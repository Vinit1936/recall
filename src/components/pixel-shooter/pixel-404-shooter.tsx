'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { retroAudio } from './audio';

// Pixel Art Bitmaps (1 = Solid Ink Pixel, 0 = Empty)
const PLANE_PIXELS = [
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
];

const DIGIT_4 = [
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1],
];

const DIGIT_0 = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
];

// Full "4 0 4" matrix: 19 columns wide x 7 rows high
const COMPOUND_404: number[][] = [];
const space = [0, 0];
for (let r = 0; r < 7; r++) {
  COMPOUND_404.push([...DIGIT_4[r], ...space, ...DIGIT_0[r], ...space, ...DIGIT_4[r]]);
}

interface Bullet {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
}

interface Enemy404 {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  pixelScale: number;
}

interface PixelDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

interface PaperMote {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
}

export function Pixel404Shooter() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [score, setScore] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Unified input dispatcher for virtual mobile arcade buttons & keyboard
  const dispatchKey = (key: string, isDown: boolean) => {
    window.dispatchEvent(new KeyboardEvent(isDown ? 'keydown' : 'keyup', { key, bubbles: true }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = box.clientWidth;
    let height = box.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const planeScale = 2.4;
    const planeWidth = 13 * planeScale;
    const planeHeight = 15 * planeScale;

    let planeX = width / 2;
    let planeY = height - planeHeight - 20;
    let planeVx = 0;

    let bullets: Bullet[] = [];
    let enemies: Enemy404[] = [];
    let debris: PixelDebris[] = [];
    let motes: PaperMote[] = [];

    // Faint vertical paper motes / flight stream
    for (let i = 0; i < 45; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 1.2 + Math.random() * 2.5,
        size: Math.random() > 0.7 ? 1.5 : 1,
        alpha: 0.08 + Math.random() * 0.12,
      });
    }

    const keys: Record<string, boolean> = {};
    let shootCooldown = 0;
    let spawnTimer = 0;
    let currentScore = 0;
    let currentDestroyed = 0;
    let gameOver = false;
    let enemyId = 0;

    const spawnEnemy = (curLvl: number) => {
      enemyId++;
      // Uniform slightly bigger scale for all 404s
      const pScale = 4.5;
      const enemyW = 19 * pScale;
      const enemyH = 7 * pScale;

      const minX = 14;
      const maxX = Math.max(minX + 20, width - enemyW - 14);
      const enemyX = minX + Math.random() * (maxX - minX);

      // Brisk starting speed so level 1 is engaging, with moderate scaling
      const speedMultiplier = 1 + Math.min(0.85, (curLvl - 1) * 0.09);
      const vy = (1.55 + Math.random() * 0.45) * speedMultiplier;
      const swayMax = 0.4 + Math.min(0.8, (curLvl - 1) * 0.10);
      const vx = (Math.random() - 0.5) * swayMax;

      enemies.push({
        id: enemyId,
        x: enemyX,
        y: -enemyH - 8,
        vx,
        vy,
        w: enemyW,
        h: enemyH,
        hp: 2,
        maxHp: 2,
        pixelScale: pScale,
      });
    };

    const shatter = (e: Enemy404) => {
      retroAudio.playExplode();
      const scale = e.pixelScale;
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 19; c++) {
          if (COMPOUND_404[r][c] === 1) {
            debris.push({
              x: e.x + c * scale,
              y: e.y + r * scale,
              vx: (Math.random() - 0.5) * 5.5,
              vy: -1 - Math.random() * 3.5,
              size: scale,
              alpha: 1.0,
              decay: 0.025 + Math.random() * 0.02,
            });
          }
        }
      }
    };

    const shootBullet = () => {
      if (gameOver) return;
      retroAudio.playShoot();
      const bW = 2.5;
      const bH = 8;
      bullets.push({
        x: planeX - planeWidth * 0.35 - bW / 2,
        y: planeY + 2,
        w: bW,
        h: bH,
        vy: -13,
      });
      bullets.push({
        x: planeX + planeWidth * 0.35 - bW / 2,
        y: planeY + 2,
        w: bW,
        h: bH,
        vy: -13,
      });
    };

    const reset = () => {
      bullets = [];
      enemies = [];
      debris = [];
      currentScore = 0;
      currentDestroyed = 0;
      setScore(0);
      setDestroyed(0);
      setLevel(1);
      gameOver = false;
      setIsGameOver(false);
      planeX = width / 2;
      spawnTimer = 0;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if ([' ', 'arrowup', 'w'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (gameOver && (e.key.toLowerCase() === 'r' || e.key === ' ')) {
        reset();
      }
      if (e.key.toLowerCase() === 'escape') {
        router.push('/');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    let isTouching = false;
    const handlePointerDown = (e: PointerEvent) => {
      isTouching = true;
      try {
        canvas.setPointerCapture?.(e.pointerId);
      } catch {}
      const rect = canvas.getBoundingClientRect();
      planeX = Math.max(planeWidth / 2 + 10, Math.min(width - planeWidth / 2 - 10, e.clientX - rect.left));
      shootBullet();
      if (gameOver) reset();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isTouching && e.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      planeX = Math.max(planeWidth / 2 + 10, Math.min(width - planeWidth / 2 - 10, e.clientX - rect.left));
    };

    const handlePointerUp = () => {
      isTouching = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    const handleResize = () => {
      if (!box) return;
      width = box.clientWidth;
      height = box.clientHeight;
      canvas.width = width;
      canvas.height = height;
      planeY = height - planeHeight - 20;
    };
    window.addEventListener('resize', handleResize);

    spawnEnemy(1);

    let animId: number;
    let tick = 0;

    const loop = () => {
      tick++;

      const curLvl = 1 + Math.floor(currentScore / 600);

      // 1. CLEAR: Crisp Paper White
      ctx.fillStyle = '#faf9f6';
      ctx.fillRect(0, 0, width, height);

      // 2. FAINT PAPER FLIGHT MOTES
      ctx.fillStyle = '#18181b';
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y += m.speed;
        if (m.y > height) {
          m.y = 0;
          m.x = Math.random() * width;
        }
        ctx.globalAlpha = m.alpha;
        ctx.fillRect(m.x, m.y, m.size, m.size * 2);
      }
      ctx.globalAlpha = 1.0;

      if (!gameOver) {
        // Fast, agile plane keyboard responsiveness
        if (keys['a'] || keys['arrowleft']) planeVx = -10.5;
        else if (keys['d'] || keys['arrowright']) planeVx = 10.5;
        else planeVx *= 0.68;

        planeX += planeVx;
        planeX = Math.max(planeWidth / 2 + 10, Math.min(width - planeWidth / 2 - 10, planeX));

        shootCooldown--;
        if ((keys[' '] || keys['w'] || keys['arrowup'] || isTouching) && shootCooldown <= 0) {
          shootBullet();
          shootCooldown = 11;
        }

        spawnTimer++;
        // Brisk drop pacing from Level 1, with smooth scaling
        const spawnInterval = Math.max(30, 64 - (curLvl - 1) * 5);
        if (spawnTimer > spawnInterval) {
          spawnEnemy(curLvl);
          // Occasional double drops starting at Level 3+
          if (curLvl >= 3 && Math.random() < 0.18) {
            spawnEnemy(curLvl);
          }
          spawnTimer = 0;
        }
      }

      // 3. BULLETS (Solid Ink Black)
      ctx.fillStyle = '#18181b';
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += b.vy;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        if (b.y < -15) bullets.splice(i, 1);
      }

      // 4. 404 ENEMIES (Solid Ink Black)
      ctx.fillStyle = '#18181b';
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!gameOver) {
          e.y += e.vy;
          e.x += e.vx;
          if (e.x < 10 || e.x + e.w > width - 10) e.vx = -e.vx;

          const pL = planeX - planeWidth / 2 + 4;
          const pR = planeX + planeWidth / 2 - 4;
          const pT = planeY + 2;
          const pB = planeY + planeHeight;

          const hitPlane = pL < e.x + e.w && pR > e.x && pT < e.y + e.h && pB > e.y;
          const hitFloor = e.y + e.h > height - 12;

          if (hitPlane || hitFloor) {
            shatter(e);
            enemies.splice(i, 1);
            gameOver = true;
            setIsGameOver(true);
            retroAudio.playGameOver();
            continue;
          }

          // Bullet hits
          for (let bi = bullets.length - 1; bi >= 0; bi--) {
            const b = bullets[bi];
            if (b.x + b.w > e.x && b.x < e.x + e.w && b.y < e.y + e.h && b.y + b.h > e.y) {
              bullets.splice(bi, 1);
              e.hp--;
              retroAudio.playHit();

              debris.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2,
                size: 2,
                alpha: 0.9,
                decay: 0.05,
              });

              if (e.hp <= 0) {
                shatter(e);
                enemies.splice(i, 1);
                currentDestroyed++;
                currentScore += 100;
                setDestroyed(currentDestroyed);
                setScore(currentScore);
                setLevel(1 + Math.floor(currentScore / 600));
                break;
              }
            }
          }
        }

        // Draw 404
        ctx.fillStyle = '#18181b';
        const scale = e.pixelScale;
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 19; c++) {
            if (COMPOUND_404[r][c] === 1) {
              ctx.fillRect(e.x + c * scale, e.y + r * scale, scale - 0.5, scale - 0.5);
            }
          }
        }
      }

      // 5. TUMBLING PIXEL DEBRIS
      ctx.fillStyle = '#18181b';
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.16;
        d.alpha -= d.decay;
        if (d.alpha <= 0) {
          debris.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = d.alpha;
        ctx.fillRect(d.x, d.y, d.size, d.size);
      }
      ctx.globalAlpha = 1.0;

      // 6. PIXEL PLANE (at bottom pointing up)
      if (!gameOver) {
        const sX = planeX - planeWidth / 2;
        const sY = planeY;
        ctx.fillStyle = '#18181b';

        for (let r = 0; r < PLANE_PIXELS.length; r++) {
          for (let c = 0; c < PLANE_PIXELS[r].length; c++) {
            if (PLANE_PIXELS[r][c] === 1) {
              ctx.fillRect(sX + c * planeScale, sY + r * planeScale, planeScale, planeScale);
            }
          }
        }

        // Faint ink thruster tail
        const flame = tick % 2 === 0 ? 6 : 11;
        ctx.fillStyle = '#71717a';
        ctx.fillRect(sX + 2 * planeScale, sY + 15 * planeScale, 2 * planeScale, flame);
        ctx.fillRect(sX + 9 * planeScale, sY + 15 * planeScale, 2 * planeScale, flame);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [router]);

  return (
    <div className="min-h-[100dvh] w-full bg-[#f4f3ef] text-[#18181b] flex flex-col items-center justify-center p-3 sm:p-6 select-none font-mono">
      {/* Load 8-bit Pixel Font directly */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .font-pixel {
          font-family: 'Press Start 2P', monospace;
        }
      `}</style>

      {/* Main Centered Container with Clean Proportion */}
      <div className="w-full max-w-[960px] flex flex-col items-center">
        {/* TOP BAR: Back button left, BIG Recall brand center, Links right */}
        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center pb-2">
          <div className="flex items-center justify-start">
            <button
              onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}
              className="font-pixel text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-1.5 border border-[#18181b] bg-[#faf9f6] text-[#18181b] hover:bg-[#18181b] hover:text-[#faf9f6] transition-colors shadow-[2px_2px_0px_0px_#18181b] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              &lt; BACK
            </button>
          </div>

          {/* BIG Recall Brand in Pixel Font with Brand Orange Dot */}
          <Link
            href="/"
            className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-[44px] tracking-wider text-[#18181b] hover:opacity-85 transition-opacity text-center leading-none"
          >
            recall<span style={{ color: '#ff6b00' }}>.</span>
          </Link>

          <div className="flex items-center justify-end gap-2 sm:gap-3 font-pixel text-[9px] sm:text-[10px]">
            <button
              onClick={() => setIsMuted(retroAudio.toggleMute())}
              className="text-[#71717a] hover:text-[#18181b] transition-colors cursor-pointer"
            >
              [SFX:{isMuted ? '0' : '1'}]
            </button>
            <Link href="/" className="hidden sm:inline text-[#71717a] hover:text-[#18181b] transition-colors">
              [HOME]
            </Link>
          </div>
        </div>

        {/* EXACTLY ONE SMALL LINE: "404 // NOT FOUND" in Pixel Font */}
        <div className="font-pixel text-[10px] sm:text-[11px] tracking-widest text-[#71717a] text-center mb-2.5 mt-1">
          404 // NOT FOUND
        </div>

        {/* WIDE HORIZONTAL GAME BOX */}
        <div className="w-full flex flex-col items-stretch">
          {/* HUD directly above the canvas */}
          <div className="flex items-center justify-between pb-1.5 px-1 font-pixel text-[8px] sm:text-[9px] text-[#71717a]">
            <div className="flex items-center gap-2.5 sm:gap-5">
              <span>
                404:<span className="text-[#18181b]">{destroyed.toString().padStart(2, '0')}</span>
              </span>
              <span>
                SCORE:<span className="text-[#18181b]">{score.toString().padStart(5, '0')}</span>
              </span>
              <span>
                LVL:<span className="text-[#18181b]">{level.toString().padStart(2, '0')}</span>
              </span>
            </div>

            <div className="hidden sm:block text-[8px] text-[#a1a1aa]">
              [A/D] MOVE [SPACE] SHOOT
            </div>
            <div className="sm:hidden text-[7px] text-[#a1a1aa]">
              [TOUCH / DRAG / BUTTONS]
            </div>
          </div>

          {/* Canvas Box */}
          <div
            ref={boxRef}
            className="relative w-full h-[360px] sm:h-[430px] md:h-[480px] bg-[#faf9f6] border-2 border-[#18181b] shadow-[4px_4px_0px_0px_#18181b] sm:shadow-[6px_6px_0px_0px_#18181b] overflow-hidden cursor-crosshair touch-none select-none"
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block touch-none" />

            {/* Game Over Screen */}
            {isGameOver && (
              <div className="absolute inset-0 bg-[#faf9f6]/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-100 z-10">
                <div className="font-pixel text-base sm:text-xl text-[#18181b] tracking-wider mb-2">
                  404 BREACHED
                </div>
                <div className="font-pixel text-[9px] text-[#71717a] mb-6">
                  SCORE: {score} · KILLS: {destroyed} · LVL: {level}
                </div>

                <div className="flex flex-col gap-2.5 w-56 font-pixel text-[9px]">
                  <button
                    onClick={() => {
                      const ev = new KeyboardEvent('keydown', { key: 'r' });
                      window.dispatchEvent(ev);
                    }}
                    className="py-2.5 border-2 border-[#18181b] bg-[#18181b] text-[#faf9f6] hover:bg-black transition-colors cursor-pointer"
                  >
                    [R] PLAY AGAIN
                  </button>
                  <Link
                    href="/"
                    className="py-2.5 border border-[#18181b] text-[#18181b] hover:bg-[#eae8e2] transition-colors block"
                  >
                    [ESC] HOME
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE RETRO ARCADE CONTROLLER BAR (touch-friendly / sm:hidden) */}
          <div className="w-full mt-3 flex items-center justify-between sm:hidden px-0.5 select-none touch-none">
            {/* Directional D-Pad */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  dispatchKey('ArrowLeft', true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  dispatchKey('ArrowLeft', false);
                }}
                onPointerCancel={() => dispatchKey('ArrowLeft', false)}
                className="w-14 h-12 flex items-center justify-center font-pixel text-base border-2 border-[#18181b] bg-[#faf9f6] text-[#18181b] shadow-[3px_3px_0px_0px_#18181b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#18181b] active:bg-[#eae8e2] cursor-pointer touch-none"
                aria-label="Move Left"
              >
                ◄
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  dispatchKey('ArrowRight', true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  dispatchKey('ArrowRight', false);
                }}
                onPointerCancel={() => dispatchKey('ArrowRight', false)}
                className="w-14 h-12 flex items-center justify-center font-pixel text-base border-2 border-[#18181b] bg-[#faf9f6] text-[#18181b] shadow-[3px_3px_0px_0px_#18181b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#18181b] active:bg-[#eae8e2] cursor-pointer touch-none"
                aria-label="Move Right"
              >
                ►
              </button>
            </div>

            {/* Hint in center */}
            <div className="font-pixel text-[8px] text-[#a1a1aa] text-center leading-tight">
              DRAG CANVAS
              <br />
              OR BUTTONS
            </div>

            {/* Fire Action Button */}
            <div>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  dispatchKey(' ', true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  dispatchKey(' ', false);
                }}
                onPointerCancel={() => dispatchKey(' ', false)}
                className="h-12 px-5 flex items-center justify-center gap-1.5 font-pixel text-[11px] border-2 border-[#18181b] bg-[#18181b] text-[#faf9f6] shadow-[3px_3px_0px_0px_#71717a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#71717a] active:bg-black cursor-pointer touch-none"
                aria-label="Fire"
              >
                FIRE <span className="text-[#ff6b00]">●</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
