import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ARCHIVE_CONFIG, rangeProgress } from "./archiveConfig.js";
import { createArchiveTunnel } from "./ArchiveTunnel.js";
import {
  bindGashaponGLTF,
  createGashaponMachine,
} from "./GashaponMachine.js";
import { disposeObject } from "./threeUtils.js";

const easeInOut = (value) =>
  value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;

const lerp = (start, end, progress) => start + (end - start) * progress;

function capsulePath(progress, target) {
  if (progress < 0.56) {
    const local = easeInOut(progress / 0.56);
    target.set(
      lerp(0.34, 0, local),
      lerp(4.15, 0.65, local),
      lerp(0.08, 1.56, local),
    );
    return;
  }

  const local = (progress - 0.56) / 0.44;
  const bounce = Math.sin(local * Math.PI * 2.4) * (1 - local) * 0.18;
  target.set(
    0,
    0.5 + bounce,
    lerp(1.56, 1.72, local),
  );
}

export function ArchiveCanvas({
  progressRef,
  staticMode = false,
  compact = false,
}) {
  const canvasRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !compact,
        powerPreference: "high-performance",
      });
      canvas.dataset.webgl = "ready";
    } catch {
      canvas.dataset.webgl = "fallback";
      canvas.dataset.model = "atmosphere-only";
      setWebglFailed(true);
      let fallbackFrame = 0;
      const updateFallback = () => {
        const progress = progressRef.current;
        const travel = easeInOut(
          rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.travel),
        );
        const arrival = easeInOut(
          rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.arrival),
        );
        const boot = rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.boot);
        const dispense = rangeProgress(
          progress,
          ...ARCHIVE_CONFIG.ranges.dispense,
        );
        const travelZ = lerp(
          ARCHIVE_CONFIG.camera.idle[2],
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
        fallbackFrame = window.requestAnimationFrame(updateFallback);
      };
      fallbackFrame = window.requestAnimationFrame(updateFallback);
      return () => window.cancelAnimationFrame(fallbackFrame);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = !compact;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(ARCHIVE_CONFIG.colors.dark, compact ? 0.075 : 0.052);
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

    let machine = createGashaponMachine(ARCHIVE_CONFIG);
    world.add(machine.group);
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
          const loadedMachine = bindGashaponGLTF(gltf.scene, ARCHIVE_CONFIG);
          world.remove(machine.group);
          disposeObject(machine.group);
          machine = loadedMachine;
          world.add(machine.group);
          canvas.dataset.model = "gltf";
        },
        undefined,
        () => {
          canvas.dataset.model = "procedural";
        },
      );
    } else {
      canvas.dataset.model = "procedural";
    }

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      new THREE.MeshStandardMaterial({
        color: 0x090a0b,
        roughness: 0.94,
        metalness: 0.05,
        transparent: true,
        opacity: 0.86,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = ARCHIVE_CONFIG.machine.position[1] - 0.01;
    ground.receiveShadow = true;
    world.add(ground);

    const ambient = new THREE.HemisphereLight(0x8c735e, 0x050608, 0.34);
    const key = new THREE.DirectionalLight(0xf0cfad, 2.45);
    key.position.set(4, 7, 6);
    key.castShadow = !compact;
    key.shadow.mapSize.set(compact ? 512 : 1024, compact ? 512 : 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -3;
    key.shadow.bias = -0.0004;
    const rim = new THREE.DirectionalLight(0x6c9a9c, 1.2);
    rim.position.set(-5, 4, -3);
    const lowWine = new THREE.PointLight(0x6e1722, 0.44, 7, 2);
    lowWine.position.set(1.4, -0.6, 2.8);
    scene.add(ambient, key, rim, lowWine);

    const target = new THREE.Vector3(...ARCHIVE_CONFIG.camera.target);
    const capsulePosition = new THREE.Vector3();
    const idleCamera = ARCHIVE_CONFIG.camera.idle;
    const travelCamera = ARCHIVE_CONFIG.camera.travelEnd;
    const arrivalCamera = ARCHIVE_CONFIG.camera.arrival;
    const operationCamera = ARCHIVE_CONFIG.camera.operation;
    let raf = 0;
    let visible = true;
    let lastTime = performance.now();

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
      const delta = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const progress = staticMode ? progressRef.current : progressRef.current;
      const travel = easeInOut(
        rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.travel),
      );
      const arrival = easeInOut(
        rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.arrival),
      );
      const boot = rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.boot);
      const dispense = rangeProgress(
        progress,
        ...ARCHIVE_CONFIG.ranges.dispense,
      );
      const reveal = easeInOut(
        rangeProgress(progress, ...ARCHIVE_CONFIG.ranges.reveal),
      );
      const operationProgress = easeInOut(Math.min(1, boot / 0.38));

      const cameraX =
        lerp(
          lerp(
            lerp(idleCamera[0], travelCamera[0], travel),
            arrivalCamera[0],
            arrival,
          ),
          operationCamera[0],
          operationProgress,
        ) + Math.sin(travel * Math.PI) * 0.06;
      const cameraY = lerp(
        lerp(
          lerp(idleCamera[1], travelCamera[1], travel),
          arrivalCamera[1],
          arrival,
        ),
        operationCamera[1],
        operationProgress,
      );
      const cameraZ = lerp(
        lerp(
          lerp(idleCamera[2], travelCamera[2], travel),
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
        Math.max(travel, arrival),
      );
      camera.updateProjectionMatrix();
      camera.lookAt(target);

      tunnel.setVisibility(arrival);
      tunnel.fragments.rotation.z = Math.sin(progress * Math.PI * 2) * 0.02;

      const bootPower = easeInOut(Math.min(1, boot / 0.38));
      machine.materials.ivory.emissiveIntensity = 0.035 + bootPower * 0.1;
      machine.materials.wine.emissiveIntensity = 0.05 + bootPower * 0.3;
      machine.materials.glass.opacity = 0.34 + bootPower * 0.08;
      machine.materials.baseStatus.emissiveIntensity = 0.08 + bootPower * 0.5;
      machine.materials.trayScan.emissiveIntensity =
        0.04 + Math.max(0, boot - 0.65) * 1.2;
      machine.materials.statusMaterials.forEach((material, index) => {
        material.emissiveIntensity =
          0.035 + Math.max(0, boot - index * 0.18) * 1.45;
      });
      machine.lights.chamberLight.intensity = bootPower * 0.72;
      machine.lights.trayLight.intensity =
        Math.max(0, boot - 0.58) * 0.92;

      const handleProgress = easeInOut(
        Math.min(1, Math.max(0, (boot - 0.38) / 0.44)),
      );
      machine.handle.rotation.z = -handleProgress * Math.PI * 1.45;
      const bayProgress = easeInOut(
        Math.min(1, Math.max(0, (boot - 0.76) / 0.24)),
      );
      machine.outputBay.doorPivot.rotation.x = -bayProgress * 1.05;
      const closedTrayZ =
        machine.outputBay.trayGroup.userData.closedZ ??
        machine.outputBay.trayGroup.position.z;
      machine.outputBay.trayGroup.position.z = closedTrayZ + bayProgress * 0.2;
      machine.capsules.rotation.y +=
        delta * (0.08 + Math.max(0, boot - 0.18) * 1.6);
      machine.capsules.rotation.z =
        Math.sin(now * 0.0018) * 0.035 * bootPower;

      machine.capsule.group.visible = dispense > 0.015;
      if (dispense > 0.015) {
        capsulePath(easeInOut(dispense), capsulePosition);
        machine.capsule.group.position.copy(capsulePosition);
        machine.capsule.group.rotation.set(
          dispense * Math.PI * 2.4,
          dispense * Math.PI * 1.3,
          dispense * Math.PI * 1.9,
        );
      }

      machine.capsule.top.position.y = reveal * 0.58;
      machine.capsule.top.rotation.x = -reveal * 0.52;
      machine.capsule.top.rotation.z = reveal * 0.18;
      machine.capsule.seam.material.opacity = 1 - reveal;
      machine.capsule.seam.material.transparent = reveal > 0;
      machine.group.position.z = -reveal * 1.1;
      machine.group.scale.setScalar(
        (machine.group.userData.baseScale ?? 1) * (1 - reveal * 0.12),
      );

      canvas.dataset.progress = progress.toFixed(4);
      canvas.dataset.cameraZ = camera.position.z.toFixed(3);
      canvas.dataset.machineBoot = boot.toFixed(3);
      canvas.dataset.capsule = dispense.toFixed(3);

      if (visible) renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
      disposeObject(world);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [compact, progressRef, staticMode]);

  return (
    <div
      className={`archive-canvas-shell ${webglFailed ? "is-fallback" : ""}`}
    >
      <canvas
        ref={canvasRef}
        className="archive-canvas"
        aria-label="一条通向复古记忆扭蛋机的三维档案隧道；滚动将启动机器并解锁实习经历胶囊。"
      />
      {webglFailed ? (
        <div className="archive-canvas-fallback" aria-hidden="true">
          <span className="archive-canvas-fallback__tunnel" />
        </div>
      ) : null}
    </div>
  );
}
