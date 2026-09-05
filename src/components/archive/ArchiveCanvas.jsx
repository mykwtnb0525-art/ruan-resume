import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ARCHIVE_CONFIG } from "./archiveConfig.js";
import { INITIAL_ARCHIVE_SNAPSHOT } from "./archiveNarrative.js";
import { createArchiveTunnel } from "./ArchiveTunnel.js";
import {
  bindGashaponGLTF,
  createGashaponMachine,
} from "./GashaponMachine.js";
import {
  applyCapsuleRig,
  createCapsuleReleasePath,
} from "./rigs/CapsuleRig.js";
import { getEnvironmentRenderConfig } from "./rigs/EnvironmentRig.js";
import { applyLightingRig } from "./rigs/LightingRig.js";
import { applyMachineRig, easeInOut } from "./rigs/MachineRig.js";
import { disposeObject } from "./threeUtils.js";
import { ARCHIVE_VISUAL_BASELINE } from "./visual/visualBaseline.js";
import { VISUAL_DEBUG_MODES } from "./visual/visualDebugMode.js";

const lerp = (start, end, progress) => start + (end - start) * progress;

function createContactShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  const paintShadow = (x, y, radius, yScale, strength) => {
    context.save();
    context.translate(x, y);
    context.scale(1, yScale);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${strength})`);
    gradient.addColorStop(0.28, `rgba(255,255,255,${strength * 0.68})`);
    gradient.addColorStop(0.68, `rgba(255,255,255,${strength * 0.18})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.restore();
  };

  paintShadow(256, 268, 218, 0.48, 0.86);
  paintShadow(256, 178, 104, 0.34, 0.38);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSceneConnectors(floorY) {
  const group = new THREE.Group();
  group.name = "ArchiveEnvironmentConnectors";

  const marble = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 24, 18),
    new THREE.MeshPhysicalMaterial({
      color: 0x8a7ea0,
      roughness: 0.18,
      metalness: 0.02,
      transmission: 0.56,
      thickness: 0.08,
      ior: 1.42,
      envMapIntensity: 0.88,
    }),
  );
  marble.name = "ArchiveGlassMarble";
  marble.position.set(0.82, floorY + 0.09, 0.82);
  marble.castShadow = true;
  marble.receiveShadow = true;

  group.add(marble);
  return group;
}

export function ArchiveCanvas({
  snapshotRef,
  staticMode = false,
  compact = false,
  lightingPass = "final",
  visualDebugMode = VISUAL_DEBUG_MODES.FINAL,
  chapterConfig,
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const section = canvas.closest(".archive-sequence");
    const qaMode = new URLSearchParams(window.location.search).has("qa");
    const modelDebugMode = visualDebugMode === VISUAL_DEBUG_MODES.MODEL;
    const materialDebugMode =
      visualDebugMode === VISUAL_DEBUG_MODES.MATERIAL;
    const finalMode = visualDebugMode === VISUAL_DEBUG_MODES.FINAL;
    const visualBaseline = ARCHIVE_VISUAL_BASELINE;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !compact && !qaMode,
        powerPreference: "high-performance",
      });
      canvas.dataset.webgl = "ready";
      canvas.dataset.modelUrl = ARCHIVE_CONFIG.assets.model;
      canvas.dataset.modelStatus = "loading";
    } catch (error) {
      canvas.dataset.webgl = "fallback";
      canvas.dataset.model = "atmosphere-only";
      canvas.dataset.modelStatus = "webgl-unavailable";
      canvas.dataset.webglError =
        error instanceof Error ? error.message : String(error);
      if (import.meta.env.DEV) {
        console.error("Archive WebGL initialization failed", error);
      }
      canvas.dataset.modelUrl = ARCHIVE_CONFIG.assets.model;
      let fallbackFrame = 0;
      const updateFallback = () => {
        const snapshot = snapshotRef.current || INITIAL_ARCHIVE_SNAPSHOT;
        const progress = snapshot.globalProgress;
        const collage = easeInOut(snapshot.entry.collage);
        const travel = easeInOut(snapshot.entry.travel);
        const arrival = easeInOut(snapshot.entry.arrival);
        const boot = Math.max(
          snapshot.chapter.prime,
          snapshot.chapter.activate,
        );
        const dispense = snapshot.chapter.dispense;
        const collageZ = lerp(
          ARCHIVE_CONFIG.camera.idle[2],
          ARCHIVE_CONFIG.camera.collage[2],
          collage,
        );
        const travelZ = lerp(
          collageZ,
          ARCHIVE_CONFIG.camera.travelEnd[2],
          travel,
        );
        canvas.dataset.progress = progress.toFixed(4);
        const arrivalZ = lerp(
          travelZ,
          ARCHIVE_CONFIG.camera.arrival[2],
          arrival,
        );
        canvas.dataset.cameraZ = lerp(
          arrivalZ,
          ARCHIVE_CONFIG.camera.operation[2],
          easeInOut(Math.min(1, boot / 0.38)),
        ).toFixed(3);
        canvas.dataset.machineBoot = boot.toFixed(3);
        canvas.dataset.capsule = dispense.toFixed(3);
        canvas.dataset.capsuleOpen =
          snapshot.chapter.capsuleOpen.toFixed(3);
        canvas.dataset.archiveVisible =
          snapshot.chapter.archiveVisibility.toFixed(3);
        canvas.dataset.phase = snapshot.phase;
        fallbackFrame = window.requestAnimationFrame(updateFallback);
      };
      fallbackFrame = window.requestAnimationFrame(updateFallback);
      return () => window.cancelAnimationFrame(fallbackFrame);
    }
    renderer.setPixelRatio(
      qaMode
        ? 1
        : Math.min(
            window.devicePixelRatio || 1,
            visualBaseline.renderer.maxDpr,
          ),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = modelDebugMode
      ? visualBaseline.renderer.modelExposure
      : visualBaseline.renderer.exposure;
    renderer.shadowMap.enabled = !compact;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const environmentConfig = getEnvironmentRenderConfig(
      chapterConfig,
      compact,
    );
    const hasEnvironment = !modelDebugMode && lightingPass !== "base";
    const hasGround =
      modelDebugMode ||
      materialDebugMode ||
      ["ground", "atmosphere", "final"].includes(lightingPass);
    const hasAtmosphere =
      finalMode && ["atmosphere", "final"].includes(lightingPass);
    scene.environmentIntensity = hasEnvironment
      ? environmentConfig.environmentIntensity
      : 0;
    if (hasAtmosphere) {
      scene.fog = new THREE.Fog(
        visualBaseline.environment.fogColor,
        environmentConfig.fogNear,
        environmentConfig.fogFar,
      );
    }
    let environmentTarget = null;
    if (hasEnvironment) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      environmentTarget = pmrem.fromScene(room, 0.04);
      scene.environment = environmentTarget.texture;
      room.dispose();
      pmrem.dispose();
    }
    const camera = new THREE.PerspectiveCamera(
      ARCHIVE_CONFIG.camera.fovStart,
      1,
      0.1,
      60,
    );
    camera.position.fromArray(ARCHIVE_CONFIG.camera.idle);

    const world = new THREE.Group();
    scene.add(world);

    const tunnel = createArchiveTunnel({ compact });
    world.add(tunnel.group);
    tunnel.group.visible = finalMode;

    let machine = createGashaponMachine(ARCHIVE_CONFIG, chapterConfig);
    world.add(machine.group);
    machine.group.visible = true;
    canvas.dataset.model = "procedural-loading";
    let disposed = false;
    if (ARCHIVE_CONFIG.machine.modelMode === "gltf") {
      const loader = new GLTFLoader();
      loader.load(
        ARCHIVE_CONFIG.assets.model,
        (gltf) => {
          if (disposed) {
            disposeObject(gltf.scene);
            return;
          }
          const loadedMachine = bindGashaponGLTF(
            gltf.scene,
            ARCHIVE_CONFIG,
            chapterConfig,
          );
          world.remove(machine.group);
          disposeObject(machine.group);
          machine = loadedMachine;
          world.add(machine.group);
          machine.group.visible = true;
          if (modelDebugMode) {
            const clay = new THREE.MeshStandardMaterial({
              color: 0xaaa29a,
              roughness: 0.72,
              metalness: 0.02,
            });
            machine.group.traverse((object) => {
              if (!object.isMesh) return;
              object.material = clay;
            });
          }
          canvas.dataset.model = "gltf";
          canvas.dataset.modelStatus = "loaded";
        },
        undefined,
        (error) => {
          canvas.dataset.model = "procedural";
          canvas.dataset.modelStatus = "error";
          canvas.dataset.modelError = error?.message || "GLB load failed";
        },
      );
    } else {
      canvas.dataset.model = "procedural";
      canvas.dataset.modelStatus = "procedural";
    }

    const floorY = ARCHIVE_CONFIG.machine.position[1] - 0.01;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.ShadowMaterial({
        color: visualBaseline.ground.shadowColor,
        opacity: visualBaseline.ground.shadowOpacity,
        transparent: true,
        depthWrite: false,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = floorY;
    ground.receiveShadow = true;
    ground.visible = hasGround;
    world.add(ground);

    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(...visualBaseline.ground.contactSize),
      new THREE.MeshBasicMaterial({
        color: visualBaseline.ground.shadowColor,
        map: createContactShadowTexture(),
        transparent: true,
        opacity: visualBaseline.ground.contactOpacity,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    contactShadow.name = "ArchiveSoftContactShadow";
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(
      ARCHIVE_CONFIG.machine.position[0],
      floorY + 0.006,
      0.22,
    );
    contactShadow.renderOrder = 2;
    contactShadow.visible = hasGround;
    world.add(contactShadow);

    const sceneConnectors = createSceneConnectors(floorY);
    sceneConnectors.visible = hasGround;
    world.add(sceneConnectors);

    const light = visualBaseline.lighting;
    const ambient = new THREE.AmbientLight(
      light.ambient.color,
      light.ambient.intensity,
    );
    const hemisphere = new THREE.HemisphereLight(
      light.hemisphere.skyColor,
      light.hemisphere.groundColor,
      light.hemisphere.intensity,
    );
    const key = new THREE.DirectionalLight(
      light.key.color,
      light.key.intensity,
    );
    key.position.fromArray(light.key.position);
    key.castShadow = !compact;
    const shadowMapSize = qaMode ? 1024 : compact ? 1024 : 2048;
    key.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -3;
    key.shadow.bias = -0.00025;
    key.shadow.normalBias = 0.025;
    const fill = new THREE.DirectionalLight(
      light.fill.color,
      light.fill.intensity,
    );
    fill.position.fromArray(light.fill.position);
    const rim = new THREE.SpotLight(
      light.rim.color,
      light.rim.intensity,
      light.rim.distance,
      light.rim.angle,
      light.rim.penumbra,
      light.rim.decay,
    );
    rim.position.fromArray(light.rim.position);
    const rimTarget = new THREE.Object3D();
    rimTarget.position.fromArray(light.rim.target);
    rim.target = rimTarget;
    scene.add(
      ambient,
      hemisphere,
      key,
      fill,
      rim,
      rimTarget,
    );

    const target = new THREE.Vector3(...ARCHIVE_CONFIG.camera.target);
    const cameraTarget = target.clone();
    const capsulePosition = new THREE.Vector3();
    const capsuleReleasePath = createCapsuleReleasePath(chapterConfig);
    const capsuleAnchorWorld = new THREE.Vector3();
    const capsuleAnchorScreen = new THREE.Vector3();
    const idleCamera = ARCHIVE_CONFIG.camera.idle;
    const collageCamera = ARCHIVE_CONFIG.camera.collage;
    const travelCamera = ARCHIVE_CONFIG.camera.travelEnd;
    const arrivalCamera = ARCHIVE_CONFIG.camera.arrival;
    const operationCamera = ARCHIVE_CONFIG.camera.operation;
    let raf = 0;
    let visible = true;
    let lastRender = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "180px" },
    );
    observer.observe(canvas);
    window.addEventListener("resize", resize);

    const render = (now) => {
      const snapshot = snapshotRef.current || INITIAL_ARCHIVE_SNAPSHOT;
      const progress = snapshot.globalProgress;
      const collage = easeInOut(snapshot.entry.collage);
      const travel = easeInOut(snapshot.entry.travel);
      const arrival = easeInOut(snapshot.entry.arrival);
      const chapter = snapshot.chapter;
      const boot = Math.max(chapter.prime, chapter.activate);
      const dispense = chapter.dispense;
      const operationProgress = easeInOut(chapter.takeover);

      const cameraX =
        lerp(
          lerp(
            lerp(
              lerp(idleCamera[0], collageCamera[0], collage),
              travelCamera[0],
              travel,
            ),
            arrivalCamera[0],
            arrival,
          ),
          operationCamera[0],
          operationProgress,
        ) + Math.sin(travel * Math.PI) * 0.06;
      const cameraY = lerp(
        lerp(
          lerp(
            lerp(idleCamera[1], collageCamera[1], collage),
            travelCamera[1],
            travel,
          ),
          arrivalCamera[1],
          arrival,
        ),
        operationCamera[1],
        operationProgress,
      );
      const cameraZ = lerp(
        lerp(
          lerp(
            lerp(idleCamera[2], collageCamera[2], collage),
            travelCamera[2],
            travel,
          ),
          arrivalCamera[2],
          arrival,
        ),
        operationCamera[2],
        operationProgress,
      );
      camera.position.set(cameraX, cameraY, cameraZ);
      camera.fov = lerp(
        ARCHIVE_CONFIG.camera.fovStart,
        ARCHIVE_CONFIG.camera.fovEnd,
        Math.max(collage * 0.28, travel, arrival),
      );
      camera.updateProjectionMatrix();
      const trayFocus =
        Math.max(chapter.dispense, chapter.land, chapter.open) *
        (1 - chapter.emerge);
      cameraTarget.set(
        target.x,
        lerp(target.y, 0.15, easeInOut(trayFocus)),
        lerp(target.z, 0.42, easeInOut(trayFocus)),
      );
      camera.lookAt(cameraTarget);
      if (modelDebugMode || materialDebugMode) {
        camera.position.set(3.25, -0.02, 8.4);
        camera.lookAt(0, -0.25, 0);
      }

      tunnel.setProgress({ collage, travel, arrival });
      tunnel.fragments.rotation.z = Math.sin(progress * Math.PI * 2) * 0.02;

      applyLightingRig({
        machine,
        chapter,
        config: chapterConfig,
        lightingEnabled:
          !modelDebugMode && lightingPass !== "base",
      });
      applyMachineRig({
        machine,
        chapter,
        now,
        config: chapterConfig,
      });
      const { capsuleOpen } = applyCapsuleRig({
        machine,
        chapter,
        now,
        config: chapterConfig,
        releasePath: capsuleReleasePath,
        position: capsulePosition,
      });

      machine.capsule.group.updateWorldMatrix(true, false);
      machine.capsule.group.getWorldPosition(capsuleAnchorWorld);
      capsuleAnchorWorld.y += 0.08 + capsuleOpen * 0.12;
      capsuleAnchorScreen.copy(capsuleAnchorWorld).project(camera);
      const anchorX = (capsuleAnchorScreen.x * 0.5 + 0.5) * 100;
      const anchorY = (-capsuleAnchorScreen.y * 0.5 + 0.5) * 100;
      section?.style.setProperty(
        "--capsule-anchor-x",
        `${Math.min(92, Math.max(8, anchorX)).toFixed(2)}%`,
      );
      section?.style.setProperty(
        "--capsule-anchor-y",
        `${Math.min(92, Math.max(8, anchorY)).toFixed(2)}%`,
      );
      canvas.dataset.capsuleAnchorX = anchorX.toFixed(2);
      canvas.dataset.capsuleAnchorY = anchorY.toFixed(2);

      const archiveDepth = chapter.archiveVisibility;
      machine.group.position.z = -archiveDepth * 0.72;
      machine.group.scale.setScalar(
        (machine.group.userData.baseScale ?? 1) * (1 - archiveDepth * 0.08),
      );

      canvas.dataset.progress = progress.toFixed(4);
      canvas.dataset.phase = snapshot.phase;
      canvas.dataset.cameraZ = camera.position.z.toFixed(3);
      canvas.dataset.machineBoot = boot.toFixed(3);
      canvas.dataset.capsule = dispense.toFixed(3);
      canvas.dataset.capsuleOpen = capsuleOpen.toFixed(3);
      canvas.dataset.archiveVisible = archiveDepth.toFixed(3);

      if (visible && (!qaMode || now - lastRender > 80)) {
        renderer.render(scene, camera);
        lastRender = now;
      }
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
      disposeObject(world);
      environmentTarget?.dispose();
      renderer.dispose();
      if (!import.meta.env.DEV) renderer.forceContextLoss();
    };
  }, [
    chapterConfig,
    compact,
    lightingPass,
    snapshotRef,
    staticMode,
    visualDebugMode,
  ]);

  return (
    <div className="archive-canvas-shell">
      <canvas
        ref={canvasRef}
        className="archive-canvas"
        aria-label="一条通向记忆档案扭蛋机的三维通道；滚动将启动正式机器并解锁第一份 AIGC 音乐影像项目档案。"
      />
      <div className="archive-gashapon-fallback" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}assets/archive-gashapon-fallback.png`}
          alt=""
        />
        <span className="archive-gashapon-fallback__light" />
        <span className="archive-gashapon-fallback__dial" />
        <span className="archive-gashapon-fallback__capsule" />
      </div>
    </div>
  );
}
