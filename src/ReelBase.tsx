import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {bigoStyles} from './bigo-styles';
import {Assinatura, Brand} from './marca';
import {FundoTec} from './FundoTec';
import {CARD, INK, clamp, pr} from './ddos-ui';

// Moldura comum dos reels de animação no padrão preto tech (marca, trilha de cenas, título,
// palco SVG de 1080 × 1200 e lâmina final "Comente PALAVRA"). Cada reel só define cenas e palco.

export const LARANJA = '#e8622c';
export const QUEIMADO = '#c44a1c';
export const PESSEGO = '#f39461';
export const AREIA = '#f8b98f';

/** Segundos a mais em cada etapa, para dar tempo de ler. A animação não para: fica mais lenta na mesma tela. */
export const PAUSA = 2;

/** Converte o tempo real do vídeo no tempo da animação: cada etapa se estica PAUSA segundos; a saída segue no ritmo normal. */
export function tempoComPausa(tr: number, cenas: {t0: number; t1: number}[], pausa = PAUSA): number {
  let offset = 0;
  for (const c of cenas) {
    const fim = c.t1 - 0.25;
    const ini = c.t0 + offset;
    const fimReal = fim + offset + pausa;
    if (tr < fimReal) return c.t0 + (tr - ini) * (fim - c.t0) / (fimReal - ini);
    offset += pausa;
    if (tr < c.t1 + offset) return tr - offset;
  }
  return tr - offset;
}

export const framesComPausa = (dur: number, nCenas: number, fps = 30) => Math.round((dur + PAUSA * nCenas) * fps);

export type Cena = {t0: number; t1: number; eb: string; ponte: string; title: string; lead: string};

const fontCss = [400, 500, 600].map(weight =>
  `@font-face{font-family:Inter;font-weight:${weight};src:url("${staticFile(`assets/inter-latin-${weight}-normal.woff2`)}")}`,
).join('') + `@font-face{font-family:Mono;font-weight:500;src:url("${staticFile('assets/jetbrains-mono-latin-500-normal.woff2')}")}`;
const estilos = '.bigo-root#v{background:#05070b}.bigo-root{color:#f5f5f7}.bigo-root .top{color:#f5f5f7}.bigo-root .count{color:#8e8e93}.bigo-root #trail::before{background:#2a2f38}.bigo-root #trail i{background:#3a3f48;box-shadow:0 0 0 4px #05070b}.bigo-root #trail i.done{background:#e8622c}.bigo-root #trail span{background:#e8622c;color:#05070b}.bigo-root .ponte{color:#d1d1d6;border-left-color:#2997ff}.bigo-root h1 em{color:#e8622c}.bigo-root .lead{color:#a1a1a6}.bigo-root .lead b{color:#f5f5f7}.bigo-root .progress{background:#14171d}.bigo-root #final{background:radial-gradient(90% 55% at 100% 0%,rgba(232,98,44,.16),transparent 70%),radial-gradient(90% 55% at 0% 100%,rgba(10,132,255,.16),transparent 70%),#05070b}.bigo-root .fbody .eyebrow{color:#e8622c}.bigo-root .progress i{background:linear-gradient(90deg,#e8622c,#2997ff)}.bigo-root h1{font-size:82px}.bigo-root .lead{font-size:36px}.bigo-root #stage{top:650px;left:60px;width:960px;height:1067px}.bigo-root .top{left:100px;right:100px}.bigo-root #trail{left:100px}.bigo-root #head{left:100px;right:100px}.bigo-root .fbody{left:100px;right:100px}.bigo-root .ffoot{left:100px;right:100px}.bigo-root .big span{font-size:150px;color:#e8622c}.bigo-root .steps b{color:#e8622c}';

/** Caixa com ícone e rótulo, usada nos diagramas. */
export function Caixa({x, y, w, h, rotulo, sub, cor, op = 1, size = 30, children}: {x: number; y: number; w: number; h: number; rotulo: string; sub?: string; cor: string; op?: number; size?: number; children?: React.ReactNode}) {
  if (op <= 0) return null;
  return <g opacity={op} transform={`translate(0,${(1 - op) * 16})`}>
    <rect x={x} y={y} width={w} height={h} rx={18} fill={CARD} stroke={cor} strokeWidth={3} />
    {children}
    <text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + size / 3)} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={size} fill={INK}>{rotulo}</text>
    {sub ? <text x={x + w / 2} y={y + h / 2 + 30} textAnchor="middle" fontFamily="Mono" fontWeight={500} fontSize={20} fill="#a1a1a6">{sub}</text> : null}
  </g>;
}

/** Ponto que anda de A até B em [t0, t1]. */
export function Ponto({t, t0, t1, a, b, cor, r = 9}: {t: number; t0: number; t1: number; a: [number, number]; b: [number, number]; cor: string; r?: number}) {
  if (t < t0 || t > t1 + 0.15) return null;
  const u = clamp((t - t0) / (t1 - t0));
  return <circle cx={a[0] + (b[0] - a[0]) * u} cy={a[1] + (b[1] - a[1]) * u} r={r} fill={cor} opacity={1 - pr(t, t1, t1 + 0.15)} />;
}

export const ReelShell: React.FC<{
  nome: string; dur: number; cenas: Cena[]; finalT0: number; palavra: string; itens: string[];
  capaT: number; cover?: boolean; palco: (t: number, cena: Cena, local: number) => React.ReactNode;
}> = ({nome, dur, cenas, finalT0, palavra, itens, capaT, cover = false, palco}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [fontHandle] = useState(() => delayRender(`Carregando fontes do reel ${nome}`));
  useEffect(() => {
    Promise.all([...[400, 500, 600].map(w => document.fonts.load(`${w} 32px Inter`)), document.fonts.load('500 32px Mono')])
      .then(() => continueRender(fontHandle)).catch(cancelRender);
  }, [fontHandle]);
  const total = String(cenas.length + 1).padStart(2, '0');
  const durReal = dur + PAUSA * cenas.length;
  const tr = clamp(frame / fps, 0, durReal - 0.001);
  const t = cover ? capaT : tempoComPausa(tr, cenas);
  const idx = t >= finalT0 ? cenas.length - 1 : Math.max(0, cenas.findIndex(c => t >= c.t0 && t < c.t1));
  const cena = cenas[t >= finalT0 ? cenas.length - 1 : idx];
  const local = t - cena.t0;
  const durC = cena.t1 - cena.t0;
  // Depois do início da lâmina final, título e trilha continuam apagados (antes voltavam por um instante).
  const sai = t >= finalT0 ? 0 : 1 - pr(local, durC - 0.22, durC);
  const head = (k: number): React.CSSProperties => {
    const p = cena.t0 === 0 ? 1 : pr(local, k * 0.08, 0.32 + k * 0.08);
    return {opacity: p * sai, transform: `translateY(${(1 - p) * 22}px)`};
  };
  const finalT = t - finalT0;
  const fin = (k: number): React.CSSProperties => {
    const p = pr(finalT, 0.15 + k * 0.12, 0.5 + k * 0.12);
    return {opacity: p, transform: `translateY(${(1 - p) * 26}px)`};
  };
  return <AbsoluteFill className="bigo-root" id="v">
    <style>{fontCss + bigoStyles + estilos}</style>
    <FundoTec t={cover ? capaT : tr} />
    <Brand count={t >= finalT0 ? `${total} / ${total}` : `${String(idx + 1).padStart(2, '0')} / ${total}`} />
    <div id="trail" style={{opacity: 1 - pr(t, finalT0 - 0.3, finalT0)}}>{cenas.map((c, k) => k === idx
      ? <span key={k} style={{opacity: c.t0 === 0 ? 1 : pr(local, 0, 0.3)}}>{c.eb}</span>
      : <i key={k} className={k < idx ? 'done' : undefined} />)}</div>
    <div id="head">
      <p className="ponte" style={head(0)}>{cena.ponte}</p>
      <h1 style={head(1)} dangerouslySetInnerHTML={{__html: cena.title}} />
      <p className="lead" style={head(2)} dangerouslySetInnerHTML={{__html: cena.lead}} />
    </div>
    <svg id="stage" viewBox="0 0 1080 1200"><g opacity={1 - pr(t, finalT0 - 0.3, finalT0)}>{palco(t, cena, local)}</g></svg>
    {t >= finalT0 ? <div id="final" style={{opacity: pr(finalT, 0, 0.35)}}>
      <Brand count={`${total} / ${total}`} />
      <div className="fbody">
        <p className="eyebrow" style={fin(0)}>Guia gratuito</p>
        <p className="big" style={fin(1)}>Comente<span>{palavra}</span></p>
        <p className="recebe" style={fin(2)}>e receba no seu direct:</p>
        <div className="steps">{itens.map((text, k) => <div key={text} style={fin(k + 3)}><b>{String(k + 1).padStart(2, '0')}</b>{text}</div>)}</div>
      </div>
      <div className="ffoot" style={fin(6)}><Assinatura /><span className="cta">Salve este post</span></div>
    </div> : null}
    <div className="progress"><i style={{width: `${((cover ? capaT : tr) / durReal) * 100}%`}} /></div>
  </AbsoluteFill>;
};
