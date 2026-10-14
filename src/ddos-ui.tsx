import React from 'react';

// Peças visuais do reel DDoS: ícones de linha (grade 24, traço 2, pontas redondas),
// rack de servidor, navegador, terminal, mapa pontilhado e medidores.

export const BLUE = '#2997ff';
export const RED = '#ff3b30';
export const GREEN = '#30d158';
export const ORANGE = '#e8622c';
export const INK = '#f5f5f7';
export const MUTED = '#a1a1a6';
export const LINE = '#252a33';
export const CARD = '#0f1218';
export const BAND = '#171b22';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const eo = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
export const pr = (t: number, a: number, b: number) => eo((t - a) / (b - a));
/** Aparece entre a e a+0,4 s e some entre b-0,3 e b. */
export const vis = (t: number, a: number, b: number) => pr(t, a, a + 0.4) * (1 - pr(t, b - 0.3, b));
export const curva = (t: number, pts: [number, number][]) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, v1] = pts[i];
    const [t0, v0] = pts[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * eo((t - t0) / (t1 - t0));
  }
  return pts[pts.length - 1][1];
};
export const hash = (i: number) => {const h = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return h - Math.floor(h);};
export const milhar = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const ICONES: Record<string, React.ReactNode> = {
  servidor: <><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><path d="M6 6h.01M6 18h.01M10 6h6M10 18h6" /></>,
  roteador: <><rect x="2" y="14" width="20" height="8" rx="2" /><path d="M6 18h.01M10 18h.01M15 10v4M17.8 7.2a4 4 0 0 0-5.6 0M20.7 4.3a8 8 0 0 0-11.4 0" /></>,
  camera: <><path d="M16.75 12h3.63a1 1 0 0 1 .65 1.76L13 20.5" /><path d="M3 7.5 13.6 2.2a1 1 0 0 1 1.35.45l3.3 6.6a1 1 0 0 1-.45 1.35L7.2 15.9a1 1 0 0 1-1.35-.45L2.55 8.85A1 1 0 0 1 3 7.5Z" /><path d="M7 16 4 22M2 22h4" /></>,
  notebook: <><rect x="4" y="4" width="16" height="11" rx="2" /><path d="M2 20h20" /></>,
  celular: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M12 18h.01" /></>,
  usuario: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  escudo: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  cadeado: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  globo: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" /></>,
  rede: <><rect x="9" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="16" y="16" width="6" height="6" rx="1" /><path d="M12 8v4M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /></>,
  bot: <><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V4M8 4h8M9 14h.01M15 14h.01M2 13v3M22 13v3" /></>,
  alerta: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
};

export function Icone({nome, x, y, s = 48, cor = INK, w = 2}: {nome: keyof typeof ICONES | string; x: number; y: number; s?: number; cor?: string; w?: number}) {
  return <g transform={`translate(${x - s / 2},${y - s / 2}) scale(${s / 24})`} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{ICONES[nome]}</g>;
}

/** Ícone dentro de um círculo colorido (usado nos aparelhos e no usuário). */
export function Selo({nome, x, y, r = 30, cor, fundo = CARD, op = 1}: {nome: string; x: number; y: number; r?: number; cor: string; fundo?: string; op?: number}) {
  return <g opacity={op}>
    <circle cx={x} cy={y} r={r} fill={fundo} stroke={cor} strokeWidth={3} />
    <Icone nome={nome} x={x} y={y} s={r * 1.15} cor={cor} w={2.2} />
  </g>;
}

export function Chip({x, y, texto, cor, claro = false, size = 24}: {x: number; y: number; texto: string; cor: string; claro?: boolean; size?: number}) {
  const w = texto.length * size * 0.62 + size * 1.1;
  return <g>
    <rect x={x} y={y} width={w} height={size * 1.6} rx={size * 0.8} fill={claro ? CARD : cor} stroke={cor} strokeWidth={2} />
    <text x={x + w / 2} y={y + size * 1.12} textAnchor="middle" fontFamily="Mono" fontWeight={500} fontSize={size} fill={claro ? cor : '#fff'}>{texto}</text>
  </g>;
}

/** Rack de servidor com gavetas, luzes e status. `carga` de 0 a 100. */
export function Rack({x, y, w, h, t, carga, nome = 'servidor · origem', seed = 1}: {x: number; y: number; w: number; h: number; t: number; carga: number; nome?: string; seed?: number}) {
  const quente = carga > 90;
  const n = Math.max(3, Math.floor((h - 120) / 62));
  const uh = (h - 120) / n;
  return <g>
    <text x={x + w / 2} y={y - 18} textAnchor="middle" fontFamily="Mono" fontWeight={500} fontSize={24} fill={MUTED}>{nome}</text>
    <rect x={x} y={y} width={w} height={h} rx={16} fill="#2c2c2e" />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={10} fill="#1c1c1e" />
    {Array.from({length: n}).map((_, i) => {
      const yy = y + 24 + i * uh;
      const piscaA = hash(seed * 97 + i * 7 + Math.floor(t * (quente ? 10 : 4))) > (quente ? 0.3 : 0.6);
      const piscaB = hash(seed * 13 + i * 3 + Math.floor(t * (quente ? 8 : 2.5))) > 0.5;
      return <g key={i}>
        <rect x={x + 22} y={yy} width={w - 44} height={uh - 10} rx={6} fill="#3a3a3c" />
        {Array.from({length: 6}).map((__, k) => <rect key={k} x={x + 38 + k * 12} y={yy + 10} width={6} height={uh - 30} rx={3} fill="#48484a" />)}
        <rect x={x + w - 150} y={yy + (uh - 10) / 2 - 7} width={60} height={14} rx={4} fill="#2c2c2e" />
        <circle cx={x + w - 66} cy={yy + (uh - 10) / 2} r={6} fill={quente ? (piscaA ? RED : '#5c1a17') : (piscaA ? GREEN : '#1d4d2b')} />
        <circle cx={x + w - 44} cy={yy + (uh - 10) / 2} r={6} fill={piscaB ? (quente ? ORANGE : '#64d2ff') : '#2c3e50'} />
      </g>;
    })}
    <g transform={`translate(${x + 22},${y + h - 84})`}>
      <rect width={w - 44} height={60} rx={10} fill={quente ? '#3b1513' : '#14301d'} />
      <circle cx={30} cy={30} r={8} fill={quente ? RED : GREEN} />
      <text x={52} y={39} fontFamily="Mono" fontWeight={500} fontSize={24} fill={quente ? '#ff8a80' : '#7ee2a0'}>{quente ? 'SOBRECARGA' : 'ONLINE'}</text>
    </g>
  </g>;
}

/** Janela de navegador: site carregado ou página de erro 503. */
export function Navegador({x, y, w, h, erro, carregando = 0}: {x: number; y: number; w: number; h: number; erro: number; carregando?: number}) {
  return <g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill={CARD} stroke={LINE} strokeWidth={3} />
    <path d={`M${x} ${y + 58}h${w}`} stroke={LINE} strokeWidth={2} />
    {[0, 1, 2].map(i => <circle key={i} cx={x + 30 + i * 24} cy={y + 29} r={7} fill={['#ff5f57', '#febc2e', '#28c840'][i]} />)}
    <rect x={x + 120} y={y + 14} width={w - 150} height={30} rx={15} fill={BAND} />
    <Icone nome="cadeado" x={x + 142} y={y + 29} s={18} cor={MUTED} />
    <text x={x + 160} y={y + 37} fontFamily="Inter" fontSize={20} fill={MUTED}>https://loja.com.br</text>
    <g opacity={1 - erro}>
      <rect x={x + 24} y={y + 80} width={w - 48} height={(h - 110) * 0.42} rx={12} fill="#0d2440" />
      <rect x={x + 48} y={y + 104} width={(w - 96) * 0.55} height={22} rx={6} fill={BLUE} opacity={0.85} />
      <rect x={x + 48} y={y + 138} width={(w - 96) * 0.4} height={16} rx={6} fill="#1f5ea8" />
      {[0, 1, 2].map(i => {
        const cw = (w - 48 - 32) / 3;
        return <g key={i}>
          <rect x={x + 24 + i * (cw + 16)} y={y + 90 + (h - 110) * 0.42} width={cw} height={(h - 110) * 0.5} rx={12} fill={BAND} />
          <rect x={x + 40 + i * (cw + 16)} y={y + 106 + (h - 110) * 0.42} width={cw - 32} height={(h - 110) * 0.22} rx={8} fill="#232831" />
          <rect x={x + 40 + i * (cw + 16)} y={y + 120 + (h - 110) * 0.64} width={(cw - 32) * 0.7} height={12} rx={6} fill="#2e343e" />
        </g>;
      })}
      {carregando > 0 && carregando < 1 ? <rect x={x} y={y + 56} width={w * carregando} height={4} fill={BLUE} /> : null}
    </g>
    <g opacity={erro}>
      <Icone nome="alerta" x={x + w / 2} y={y + 58 + (h - 58) * 0.32} s={64} cor={RED} w={2.2} />
      <text x={x + w / 2} y={y + 58 + (h - 58) * 0.58} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={40} fill={INK}>503 Service Unavailable</text>
      <text x={x + w / 2} y={y + 58 + (h - 58) * 0.76} textAnchor="middle" fontFamily="Inter" fontSize={24} fill={MUTED}>O servidor está sobrecarregado. Tente mais tarde.</text>
    </g>
  </g>;
}

const ROTAS = ['/produtos', '/busca?q=tenis', '/carrinho', '/login', '/api/preco', '/checkout'];
/** Terminal com o log de pedidos. `ataque` de 0 a 1 troca 200 por 503; `vel` linhas por segundo. */
export function Terminal({x, y, w, h, t, ataque, bloqueio = 0}: {x: number; y: number; w: number; h: number; t: number; ataque: number; bloqueio?: number}) {
  const linhasVis = Math.floor((h - 70) / 36);
  const vel = 3 + ataque * 22;
  // Linha atual: integral aproximada da velocidade (determinística pelo tempo).
  const base = Math.floor(t * 3 + Math.max(0, t - 4) * 22 * ataque);
  void vel;
  const linhas = Array.from({length: linhasVis}).map((_, k) => {
    const id = base - (linhasVis - 1 - k);
    const ip = `${Math.floor(hash(id) * 200 + 20)}.${Math.floor(hash(id + 1) * 255)}.${Math.floor(hash(id + 2) * 255)}.${Math.floor(hash(id + 3) * 255)}`;
    const bot = hash(id + 9) < ataque;
    const rota = bot ? '/busca?q=' + Math.floor(hash(id + 5) * 9999) : ROTAS[Math.floor(hash(id + 4) * ROTAS.length)];
    let st = '200';
    let cor = '#7ee2a0';
    if (bot && bloqueio > 0.5) {st = '429'; cor = ORANGE;}
    else if (ataque > 0.6) {st = '503'; cor = '#ff6961';}
    return {ip, rota, st, cor};
  });
  return <g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill="#0a0c10" stroke={LINE} strokeWidth={2} />
    {[0, 1, 2].map(i => <circle key={i} cx={x + 28 + i * 22} cy={y + 26} r={6} fill="#48484a" />)}
    <text x={x + w - 24} y={y + 33} textAnchor="end" fontFamily="Mono" fontWeight={500} fontSize={20} fill="#8e8e93">access.log</text>
    {linhas.map((l, k) => <g key={k} fontFamily="Mono" fontWeight={500} fontSize={23}>
      <text x={x + 24} y={y + 84 + k * 36} fill="#8e8e93">{l.ip.padEnd(15, ' ')}</text>
      <text x={x + 24 + 15 * 14} y={y + 84 + k * 36} fill="#d1d1d6">{('GET ' + l.rota).slice(0, Math.floor((w - 300) / 14))}</text>
      <text x={x + w - 24} y={y + 84 + k * 36} textAnchor="end" fill={l.cor}>{l.st}</text>
    </g>)}
  </g>;
}

/** Medidor em anel. */
export function Anel({x, y, r, v, nome}: {x: number; y: number; r: number; v: number; nome: string}) {
  const cor = v > 90 ? RED : v > 65 ? ORANGE : GREEN;
  const c = 2 * Math.PI * r;
  return <g>
    <circle cx={x} cy={y} r={r} fill="none" stroke="#22262e" strokeWidth={16} />
    <circle cx={x} cy={y} r={r} fill="none" stroke={cor} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${(c * v) / 100} ${c}`} transform={`rotate(-90 ${x} ${y})`} />
    <text x={x} y={y + 13} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={38} fill={INK}>{Math.round(v)}%</text>
    <text x={x} y={y + r + 46} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} fill={MUTED}>{nome}</text>
  </g>;
}

// Mapa-múndi pontilhado aproximado (grade 60x26) feito de elipses por continente.
const BLOBS: [number, number, number, number][] = [
  [12, 6, 7, 4], [8, 4, 5, 2.5], [16, 9.5, 4, 2.5], [21, 3, 3, 1.8], [25, 2, 2, 1.4],
  [18.5, 14, 3.5, 3], [19.5, 18.5, 2.3, 3.2],
  [31, 5, 3.6, 2], [33, 3, 2, 1.4],
  [32, 11.5, 4.2, 3.5], [34, 15.5, 3, 3],
  [42, 5, 8, 3.5], [49, 8, 5, 3], [53, 4, 4, 2], [44.5, 11, 2, 2.2], [51, 12.5, 2, 1.4],
  [52.5, 18.5, 3.6, 2],
];
export const MAPA_PONTOS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let gy = 0; gy < 26; gy++) for (let gx = 0; gx < 60; gx++) {
    if (BLOBS.some(([cx, cy, rx, ry]) => ((gx - cx) / rx) ** 2 + ((gy - cy) / ry) ** 2 <= 1)) out.push([gx, gy]);
  }
  return out;
})();
export function Mapa({x, y, passo, op = 1}: {x: number; y: number; passo: number; op?: number}) {
  return <g opacity={op}>{MAPA_PONTOS.map(([gx, gy], i) => <circle key={i} cx={x + gx * passo} cy={y + gy * passo} r={passo * 0.28} fill="#3a414d" />)}</g>;
}
