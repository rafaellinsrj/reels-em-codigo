import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {MODE_FRAMES, resolvePreset} from './vendor/thinking-orbs/engine';
import type {OrbState} from './vendor/thinking-orbs/types';

// Orbe do thinking-orbs (MIT, Jakub Antalik; cópia em src/vendor/thinking-orbs).
// Desenhado pelo quadro do Remotion, nunca por requestAnimationFrame: o mesmo
// quadro sempre sai igual. O motor só tem presets de 64 px; ampliamos no canvas.

const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));

export type OrbProps = {
  state: OrbState;
  /** Tamanho na tela, em px do vídeo. */
  px: number;
  /** Multiplica a velocidade do preset (no vídeo, 0,5 a 0,8 lê melhor). */
  speed?: number;
  /** Cor dos pontos mais próximos. */
  ink?: string;
  /** Cor do fundo onde o orbe está (os pontos distantes somem nela). */
  paper?: string;
  /** Segundos somados ao relógio, para orbes iguais não andarem juntos. */
  offset?: number;
  style?: React.CSSProperties;
};

export const Orb: React.FC<OrbProps> = ({state, px, speed = 0.7, ink = '#0071e3', paper = '#ffffff', offset = 0, style}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps + offset;
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = 2;
    const scale = (px * dpr) / 64;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const {mode, speed: base, opts} = resolvePreset(state, 64);
    const {dots, lines} = MODE_FRAMES[mode](64, t * base * speed, opts);
    const [ir, ig, ib] = hex(ink);
    const [pr, pg, pb] = hex(paper);
    // white = 0 é o ponto mais perto (tinta cheia); 1 some no papel.
    const mix = (w: number, a: number) => {
      const f = Math.min(1, Math.max(0, w));
      return `rgba(${Math.round(ir + (pr - ir) * f)},${Math.round(ig + (pg - ig) * f)},${Math.round(ib + (pb - ib) * f)},${a})`;
    };
    for (const l of lines) {
      ctx.strokeStyle = mix(l.white, l.a ?? 1);
      ctx.lineWidth = l.w;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    }
    for (const d of dots) {
      ctx.fillStyle = mix(d.white, d.a ?? 1);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [state, px, speed, ink, paper, t]);
  return <canvas ref={ref} width={px * 2} height={px * 2} style={{width: px, height: px, display: 'block', ...style}} />;
};

export const ORB_STATES: OrbState[] = ['working', 'searching', 'solving', 'listening', 'connecting', 'weaving', 'composing', 'breathing', 'shaping'];
