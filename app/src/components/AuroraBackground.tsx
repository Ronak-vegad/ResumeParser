import { useRef, useEffect } from 'react';

interface ColorNode {
  color: [number, number, number];
  xBase: number;
  yBase: number;
  ampX: number;
  ampY: number;
  periodX: number;
  periodY: number;
  phaseX: number;
  phaseY: number;
}

const nodes: ColorNode[] = [
  { color: [232, 135, 158], xBase: 0.2, yBase: 0.2, ampX: 0.15, ampY: 0.1, periodX: 15000, periodY: 20000, phaseX: 0, phaseY: Math.PI / 2 },
  { color: [183, 140, 242], xBase: 0.8, yBase: 0.2, ampX: 0.1, ampY: 0.15, periodX: 20000, periodY: 17000, phaseX: Math.PI / 3, phaseY: 0 },
  { color: [107, 141, 242], xBase: 0.8, yBase: 0.8, ampX: 0.15, ampY: 0.1, periodX: 18000, periodY: 22000, phaseX: Math.PI, phaseY: Math.PI / 4 },
  { color: [212, 165, 116], xBase: 0.2, yBase: 0.8, ampX: 0.1, ampY: 0.15, periodX: 22000, periodY: 16000, phaseX: Math.PI / 2, phaseY: Math.PI },
  { color: [26, 26, 46], xBase: 0.5, yBase: 0.5, ampX: 0.2, ampY: 0.2, periodX: 25000, periodY: 25000, phaseX: 0, phaseY: Math.PI / 3 },
];

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 200);
    };

    window.addEventListener('resize', handleResize);

    const startTime = performance.now();

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);

      const now = performance.now();
      const elapsed = now - startTime;

      // Throttle to ~30fps
      if (now - lastTimeRef.current < 33) return;
      lastTimeRef.current = now;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';

      const radius = Math.max(w, h) * 0.6;

      for (const node of nodes) {
        const x = (node.xBase + node.ampX * Math.sin((elapsed / node.periodX) * 2 * Math.PI + node.phaseX)) * w;
        const y = (node.yBase + node.ampY * Math.sin((elapsed / node.periodY) * 2 * Math.PI + node.phaseY)) * h;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const [r, g, b] = node.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        filter: 'blur(80px)',
      }}
    />
  );
}
