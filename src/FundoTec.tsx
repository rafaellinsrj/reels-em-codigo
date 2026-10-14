import React from 'react';

// Fundo escuro com detalhes de tecnologia
// bem suaves (grade fina, trilhas de circuito, brilhos difusos) em azul e laranja.
// `t` em segundos move só os pulsos nas trilhas; o resto é estático.

export const TEC = {
  preto: '#05070b',
  azul: '#2997ff',
  azulForte: '#0a84ff',
  laranja: '#e8622c',
  texto: '#f5f5f7',
  apagado: '#a1a1a6',
  cartao: '#0f1218',
  borda: '#252a33',
};

const TRILHAS: {d: string; cor: string}[] = [
  {d: 'M-20 260 H180 L240 200 H420 L470 150 H700', cor: TEC.azul},
  {d: 'M1100 420 H900 L850 470 H700 L660 510 H560', cor: TEC.laranja},
  {d: 'M-20 1560 H140 L200 1500 H360 L410 1450 H520', cor: TEC.azul},
  {d: 'M1100 1720 H960 L900 1780 H760 L720 1820 H600', cor: TEC.laranja},
  {d: 'M60 -20 V90 L110 140 V330', cor: TEC.laranja},
  {d: 'M1020 1940 V1820 L970 1770 V1600', cor: TEC.azul},
];

function ponto(d: string, u: number): [number, number] {
  // Caminhos só com H/V/L: percorre por comprimento.
  const pts: [number, number][] = [];
  const tokens = d.match(/[MHVL]|-?\d+(?:\.\d+)?/g) ?? [];
  let x = 0, y = 0, cmd = 'M';
  for (let i = 0; i < tokens.length;) {
    const tk = tokens[i];
    if (/[MHVL]/.test(tk)) {cmd = tk; i++; continue;}
    if (cmd === 'H') {x = +tk; i++;} else if (cmd === 'V') {y = +tk; i++;} else {x = +tk; y = +tokens[i + 1]; i += 2;}
    pts.push([x, y]);
  }
  const seg = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
  let alvo = seg.reduce((a, b) => a + b, 0) * u;
  for (let k = 0; k < seg.length; k++) {
    if (alvo <= seg[k]) {const f = alvo / seg[k]; return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f];}
    alvo -= seg[k];
  }
  return pts[pts.length - 1];
}

export const FundoTec: React.FC<{t?: number; w?: number; h?: number}> = ({t = 0, w = 1080, h = 1920}) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0, width: w, height: h}}>
    <defs>
      <radialGradient id="ft-azul" cx="0.1" cy="0.94" r="0.65"><stop offset="0" stopColor={TEC.azulForte} stopOpacity={0.22} /><stop offset="1" stopColor={TEC.azulForte} stopOpacity={0} /></radialGradient>
      <radialGradient id="ft-laranja" cx="0.92" cy="0.06" r="0.6"><stop offset="0" stopColor={TEC.laranja} stopOpacity={0.16} /><stop offset="1" stopColor={TEC.laranja} stopOpacity={0} /></radialGradient>
      <pattern id="ft-grade" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="#ffffff" strokeOpacity={0.035} strokeWidth={1} /></pattern>
      <pattern id="ft-pontos" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1" fill="#ffffff" fillOpacity={0.05} /></pattern>
    </defs>
    <rect width={w} height={h} fill={TEC.preto} />
    <rect width={w} height={h} fill="url(#ft-grade)" />
    <rect x={w * 0.55} y={0} width={w * 0.45} height={h * 0.18} fill="url(#ft-pontos)" />
    <rect x={0} y={h * 0.82} width={w * 0.4} height={h * 0.18} fill="url(#ft-pontos)" />
    <rect width={w} height={h} fill="url(#ft-azul)" />
    <rect width={w} height={h} fill="url(#ft-laranja)" />
    {TRILHAS.map((tr, i) => {
      const fim = ponto(tr.d, 1);
      const [px, py] = ponto(tr.d, ((t * 0.18 + i * 0.37) % 1));
      return <g key={i}>
        <path d={tr.d} fill="none" stroke={tr.cor} strokeOpacity={0.16} strokeWidth={2} />
        <circle cx={fim[0]} cy={fim[1]} r={5} fill="none" stroke={tr.cor} strokeOpacity={0.3} strokeWidth={2} />
        <circle cx={px} cy={py} r={3.5} fill={tr.cor} fillOpacity={0.55} />
      </g>;
    })}
  </svg>
);
