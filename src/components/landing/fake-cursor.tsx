'use client';

import { motion, useAnimation } from 'motion/react';
import { forwardRef, useImperativeHandle } from 'react';

export type CursorHandle = {
  moveTo: (x: number, y: number, duration?: number) => Promise<void>;
  click: () => Promise<void>;
  hide: () => void;
  show: () => void;
};

const FakeCursor = forwardRef<CursorHandle>((_, ref) => {
  const controls = useAnimation();

  useImperativeHandle(ref, () => ({
    async moveTo(x, y, duration = 0.5) {
      await controls.start({ x: x - 4, y: y - 2, transition: { duration, ease: [0.25, 0.1, 0.25, 1] } });
    },
    async click() {
      await controls.start({ scale: 0.75, transition: { duration: 0.08 } });
      await controls.start({ scale: 1, transition: { duration: 0.12 } });
    },
    hide() {
      controls.start({ opacity: 0, transition: { duration: 0.2 } });
    },
    show() {
      controls.start({ opacity: 1, transition: { duration: 0.2 } });
    },
  }));

  return (
    <motion.div
      animate={controls}
      initial={{ x: 40, y: 200, opacity: 0 }}
      style={{
        position: 'absolute',
        width: 20,
        height: 20,
        zIndex: 999,
        pointerEvents: 'none',
        transformOrigin: '4px 2px',
      }}
    >
      {/* Custom cursor SVG — arrow shape, not a circle */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 2L16 9.5L10.5 11L8 17L4 2Z" fill="white" stroke="#000" strokeWidth="1" />
      </svg>
    </motion.div>
  );
});

FakeCursor.displayName = 'FakeCursor';
export { FakeCursor };
