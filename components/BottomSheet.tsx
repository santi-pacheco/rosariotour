"use client";

import { useEffect, useRef, useState } from "react";

export default function BottomSheet({
  title,
  expanded,
  onExpandedChange,
  children,
}: {
  title: React.ReactNode;
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; base: number; moved: boolean } | null>(null);
  const [dragY, setDragY] = useState<number | null>(null);

  const collapsedPx = () => {
    const h = sheetRef.current?.offsetHeight ?? 0;
    return Math.max(0, h - 132); // 132px visibles en peek (handle + título)
  };

  useEffect(() => {
    const onResize = () => setDragY((y) => (y === null ? null : y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = {
      startY: e.clientY,
      base: expanded ? 0 : collapsedPx(),
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const delta = e.clientY - drag.current.startY;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    const next = Math.min(collapsedPx(), Math.max(0, drag.current.base + delta));
    setDragY(next);
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    const moved = drag.current.moved;
    const y = dragY;
    drag.current = null;
    setDragY(null);
    if (!moved) {
      onExpandedChange(!expanded); // fue un tap
      return;
    }
    if (y !== null) onExpandedChange(y < collapsedPx() / 2);
  };

  const translate =
    dragY !== null ? `translateY(${dragY}px)` : expanded ? "translateY(0)" : `translateY(calc(100% - 132px))`;

  return (
    <div
      ref={sheetRef}
      className="glass fixed inset-x-0 bottom-0 z-[1200] flex max-h-[86dvh] flex-col rounded-t-3xl lg:hidden"
      style={{
        transform: translate,
        transition: dragY !== null ? "none" : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="shrink-0 cursor-grab touch-none select-none px-4 pb-2 pt-3 active:cursor-grabbing"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/40" />
        <div className="mt-2.5 flex items-center justify-between">
          <div className="text-sm font-semibold">{title}</div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {expanded ? "Deslizá para minimizar" : "Deslizá para ver más"}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}
