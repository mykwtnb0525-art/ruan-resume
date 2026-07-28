export function ReducedMotionArchive({ opened, onOpen, reducedMotion }) {
  if (opened) return null;

  return (
    <div className="reduced-archive">
      <p>
        {reducedMotion
          ? "已关闭长距离镜头推进。机器停在可读距离。"
          : "向下滚动启动机器，或直接打开胶囊。"}
      </p>
      <button type="button" onClick={onOpen} data-cursor="OPEN">
        OPEN CAPSULE
      </button>
    </div>
  );
}
