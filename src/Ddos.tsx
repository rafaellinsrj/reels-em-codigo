import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {bigoStyles} from './bigo-styles';
import {Assinatura, Brand} from './marca';
import {Orb} from './Orb';
import {FundoTec, TEC} from './FundoTec';
import {Anel, BAND, BLUE, CARD, Chip, GREEN, INK, Icone, LINE, MUTED, Mapa, Navegador, ORANGE, RED, Rack, Selo, Terminal, clamp, curva, eo, hash, milhar, pr, vis} from './ddos-ui';

// Reel "Como funciona um ataque DDoS", versão 2 (42 s, mais detalhada e realista).
// Base: reel DeSdQABJio- do @guss_oliveira. Regra: 15 a 20 s; se precisar, no máximo 60 s.
// Tudo depende só do quadro atual.

export const DUR = 42;
export const durationInFrames = DUR * 30;

type Cena = {t0: number; t1: number; eb: string; ponte: string; title: string; lead: string};
export const CENAS: Cena[] = [
  {t0: 0, t1: 4.5, eb: 'DDoS', ponte: 'Segurança na prática', title: 'Como funciona um ataque <em>DDoS</em>.', lead: 'Ele não invade o servidor. Ele <b>afoga</b> o servidor em pedidos.'},
  {t0: 4.5, t1: 9.5, eb: 'Botnet', ponte: 'De onde vem o ataque', title: 'Uma rede de aparelhos <em>infectados</em>.', lead: 'Câmeras, roteadores e computadores de pessoas comuns, controlados à distância.'},
  {t0: 9.5, t1: 15, eb: 'Sobrecarga', ponte: 'O que acontece no servidor', title: 'CPU, memória e conexões <em>acabam</em>.', lead: 'O servidor responde <b>503</b> para todo mundo, inclusive para o cliente de verdade.'},
  {t0: 15, t1: 19, eb: 'Balanceador', ponte: 'Colocar mais servidores?', title: 'Dividir o ataque <em>não resolve</em>.', lead: 'O balanceador não sabe quem é bot. Só espalha o problema.'},
  {t0: 19, t1: 25, eb: 'Borda', ponte: 'Camada 1 de defesa', title: 'Barre o ataque <em>antes</em> do servidor.', lead: 'Uma rede de borda absorve o volume e <b>limita os pedidos</b> de cada IP.'},
  {t0: 25, t1: 29.5, eb: 'Desafio', ponte: 'Camada 2 de defesa', title: 'Bot que finge ser gente leva um <em>desafio</em>.', lead: 'Humanos passam. A maioria dos bots fica pelo caminho.'},
  {t0: 29.5, t1: 34.5, eb: 'Origem', ponte: 'Camada 3 de defesa', title: 'Esconda o IP e feche a <em>origem</em>.', lead: 'Se o IP vazar, o ataque pula a borda. O <b>firewall</b> só aceita a borda.'},
  {t0: 34.5, t1: 38, eb: 'No ar', ponte: 'Resultado', title: 'O site volta a <em>respirar</em>.', lead: 'Clientes atendidos, bots barrados e servidor com folga.'},
];
const FINAL_T0 = 38;
const PALAVRA = 'DDOS';
const ITENS_GUIA = ['Checklist anti-DDoS do servidor', 'Como configurar a borda', 'Como saber se o IP vazou'];
const TOTAL = String(CENAS.length + 1).padStart(2, '0');

const fontCss = [400, 500, 600].map(weight =>
  `@font-face{font-family:Inter;font-weight:${weight};src:url("${staticFile(`assets/inter-latin-${weight}-normal.woff2`)}")}`,
).join('') + `@font-face{font-family:Mono;font-weight:500;src:url("${staticFile('assets/jetbrains-mono-latin-500-normal.woff2')}")}`;
const ddosStyles = '.bigo-root#v{background:#05070b}.bigo-root{color:#f5f5f7}.bigo-root .top{color:#f5f5f7}.bigo-root .count{color:#8e8e93}.bigo-root #trail::before{background:#2a2f38}.bigo-root #trail i{background:#3a3f48;box-shadow:0 0 0 4px #05070b}.bigo-root #trail i.done{background:#e8622c}.bigo-root #trail span{background:#e8622c;color:#05070b}.bigo-root .ponte{color:#d1d1d6;border-left-color:#2997ff}.bigo-root h1 em{color:#e8622c}.bigo-root .lead{color:#a1a1a6}.bigo-root .lead b{color:#f5f5f7}.bigo-root .progress{background:#14171d}.bigo-root #final{background:radial-gradient(90% 55% at 100% 0%,rgba(232,98,44,.16),transparent 70%),radial-gradient(90% 55% at 0% 100%,rgba(10,132,255,.16),transparent 70%),#05070b}.bigo-root .fbody .eyebrow{color:#e8622c}.bigo-root .progress i{background:linear-gradient(90deg,#e8622c,#2997ff)}.bigo-root h1{font-size:88px}.bigo-root .lead{font-size:38px}.bigo-root #stage{top:640px;height:1200px}.bigo-root .big span{font-size:220px;color:#e8622c}.bigo-root .steps b{color:#e8622c}';
const STAGE_TOP = 640;

// Linha do tempo dos números.
const RPS: [number, number][] = [[0, 140], [4.8, 140], [9.5, 1240000], [19.5, 1240000], [21.5, 160], [42, 160]];
const ATENDIDOS: [number, number][] = [[0, 100], [9.8, 100], [11.6, 4], [19.6, 4], [21.6, 97], [35, 100]];
const BLOQUEADOS: [number, number][] = [[0, 0], [19.4, 0], [21.4, 94], [27.5, 99], [32, 100]];
const CPU: [number, number][] = [[0, 22], [9.6, 22], [11.6, 100], [19.6, 100], [22, 31], [36, 28]];
const MEM: [number, number][] = [[0, 38], [9.8, 38], [12, 97], [19.6, 97], [22.5, 42]];
const CONN: [number, number][] = [[0, 15], [9.6, 15], [11.2, 100], [19.6, 100], [22, 20]];

// Aparelhos infectados no mapa (grade 60x26).
const BOTS: [number, number, string][] = [
  [12, 6, 'camera'], [8, 4, 'roteador'], [16, 9, 'notebook'], [19, 15, 'roteador'], [31, 5, 'camera'], [33, 3, 'notebook'],
  [32, 11, 'roteador'], [42, 5, 'camera'], [46, 6, 'roteador'], [49, 8, 'notebook'], [53, 4, 'camera'], [44, 11, 'roteador'],
  [52, 18, 'camera'], [51, 12, 'notebook'],
];
const MAPA_X = 40;
const MAPA_Y = 70;
const PASSO = 10.6;
const SERV = {x: 740, y: 60, w: 300, h: 840};
const WALL_X = 380;

/** Pacotes andando de A até B (com curva opcional). Retorna elementos SVG. */
function fluxo(t: number, n: number, de: (i: number) => [number, number], ate: (i: number) => [number, number], cor: string, vel: number, opts: {curva?: number; para?: number; seed?: number; op?: number} = {}) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const s = (opts.seed ?? 0) + i;
    let u = (t * vel * (0.8 + hash(s) * 0.4) + hash(s + 50)) % 1;
    const [x0, y0] = de(i);
    let [x1, y1] = ate(i);
    let a = 1;
    if (opts.para !== undefined) {
      const ux = (opts.para - x0) / (x1 - x0);
      if (u > ux) {a = 1 - clamp((u - ux) / 0.12); u = ux;}
      x1 = x0 + (x1 - x0); y1 = y0 + (y1 - y0);
    }
    const cx = (x0 + x1) / 2;
    const cy = Math.min(y0, y1) - (opts.curva ?? 0);
    const x = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1;
    const y = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1;
    out.push(<rect key={`${cor}${s}`} x={x - 16} y={y - 7} width={32} height={14} rx={7} fill={cor} opacity={a * (opts.op ?? 1) * pr(u, 0, 0.06)} />);
  }
  return out;
}

function Kpis({t}: {t: number}) {
  const rps = curva(t, RPS);
  const at = curva(t, ATENDIDOS);
  const bl = curva(t, BLOQUEADOS);
  const cards: [string, string, string][] = [
    ['pedidos/s no servidor', milhar(rps), rps > 10000 ? RED : INK],
    ['clientes atendidos', `${Math.round(at)}%`, at < 50 ? RED : GREEN],
    ['bots bloqueados', `${Math.round(bl)}%`, bl > 50 ? GREEN : MUTED],
  ];
  return <g transform="translate(40,1030)">
    {cards.map(([nome, valor, cor], i) => <g key={nome} transform={`translate(${i * 340},0)`}>
      <rect width={320} height={150} rx={22} fill={CARD} stroke={LINE} strokeWidth={3} />
      <text x={24} y={50} fontFamily="Inter" fontWeight={500} fontSize={26} fill={MUTED}>{nome}</text>
      <text x={24} y={118} fontFamily="Inter" fontWeight={600} fontSize={i === 0 ? 50 : 58} fill={cor}>{valor}</text>
    </g>)}
  </g>;
}

function Palco({t}: {t: number}) {
  const cpu = curva(t, CPU);
  const s1 = vis(t, -1, 4.8);
  const s2 = vis(t, 4.5, 9.8);
  const s3 = vis(t, 9.5, 15.3);
  const s4 = vis(t, 15, 19.3);
  const def = vis(t, 19, 38.3); // borda presente da cena 5 à 8
  const s5 = vis(t, 19, 25.3);
  const s6 = vis(t, 25, 29.8);
  const s7 = vis(t, 29.5, 34.8);
  const s8 = vis(t, 34.5, 38.3);
  const umServidor = 1 - s4;
  const servCentro: [number, number] = [SERV.x, SERV.y + SERV.h / 2];
  const ataque = curva(t, [[0, 0], [5, 0], [9.5, 1], [19.5, 1], [20.5, 0.85]]);
  const bloqueio = t > 20.3 ? 1 : 0;
  const nVermelhos = Math.round(curva(t, [[5, 0], [9.5, 40], [37, 40], [38, 0]]));

  return <g>
    {/* Servidor de origem (uma máquina) */}
    {umServidor > 0 ? <g opacity={umServidor}><Rack {...SERV} t={t} carga={cpu} /></g> : null}

    {/* Cena 1: navegador do cliente + log */}
    {s1 > 0 ? <g opacity={s1}>
      <Navegador x={40} y={40} w={640} h={420} erro={0} carregando={pr(t, 0.2, 1.4)} />
      <Terminal x={40} y={500} w={640} h={440} t={t} ataque={0} />
      {fluxo(t, 6, () => [680, 250], () => [SERV.x, 420], GREEN, 0.7, {curva: 40, seed: 300})}
    </g> : null}

    {/* Cena 2: botnet no mapa */}
    {s2 > 0 ? <g opacity={s2}>
      <Mapa x={MAPA_X} y={MAPA_Y} passo={PASSO} />
      {BOTS.map(([gx, gy], i) => {
        const ap = pr(t, 5.0 + i * 0.18, 5.35 + i * 0.18);
        if (ap <= 0) return null;
        const bx = MAPA_X + gx * PASSO;
        const by = MAPA_Y + gy * PASSO;
        const u = (t * 0.6 + hash(i)) % 1;
        const cx = (bx + SERV.x) / 2;
        const cy = Math.min(by, 300) - 160;
        const px = (1 - u) ** 2 * bx + 2 * (1 - u) * u * cx + u * u * SERV.x;
        const py = (1 - u) ** 2 * by + 2 * (1 - u) * u * cy + u * u * 380;
        return <g key={i}>
          <path d={`M${bx} ${by} Q ${cx} ${cy} ${SERV.x} 380`} stroke={RED} strokeWidth={2} fill="none" opacity={0.25 * ap} />
          {t > 6 ? <circle cx={px} cy={py} r={6} fill={RED} opacity={ap} /> : null}
        </g>;
      })}
      {BOTS.map(([gx, gy, nome], i) => <Selo key={`s${i}`} nome={nome} x={MAPA_X + gx * PASSO} y={MAPA_Y + gy * PASSO} r={22} cor={RED} op={pr(t, 5.0 + i * 0.18, 5.35 + i * 0.18)} />)}
      <g transform="translate(40,420)">
        <text fontFamily="Inter" fontWeight={500} fontSize={28} fill={MUTED} y={0}>aparelhos infectados</text>
        <text fontFamily="Inter" fontWeight={600} fontSize={64} fill={RED} y={66}>{milhar(curva(t, [[5, 0], [9, 48213]]))}</text>
      </g>
      <Terminal x={40} y={540} w={640} h={400} t={t} ataque={ataque} />
    </g> : null}

    {/* Cena 3: medidores, cliente vendo 503 */}
    {s3 > 0 ? <g opacity={s3}>
      <Anel x={140} y={130} r={80} v={cpu} nome="CPU" />
      <Anel x={360} y={130} r={80} v={curva(t, MEM)} nome="memória" />
      <Anel x={580} y={130} r={80} v={curva(t, CONN)} nome="conexões" />
      <Navegador x={40} y={320} w={640} h={300} erro={pr(t, 11.2, 11.8)} />
      <Terminal x={40} y={650} w={640} h={290} t={t} ataque={ataque} />
    </g> : null}

    {/* Cenas 2 e 3: enxurrada de pedidos vermelhos */}
    {(s2 > 0 || s3 > 0) && t > 6.5 ? <g opacity={Math.max(s2 * 0.6, s3)}>
      {fluxo(t, nVermelhos, i => [690, 120 + hash(i + 11) * 780], () => servCentro, RED, 1.4, {seed: 10})}
    </g> : null}

    {/* Cena 4: balanceador + 3 servidores */}
    {s4 > 0 ? <g opacity={s4}>
      <Navegador x={40} y={40} w={520} h={300} erro={1} />
      <Terminal x={40} y={380} w={520} h={560} t={t} ataque={1} />
      <circle cx={640} cy={470} r={54} fill={CARD} stroke={BLUE} strokeWidth={4} />
      <Icone nome="rede" x={640} y={470} s={52} cor={BLUE} />
      <text x={640} y={560} textAnchor="middle" fontFamily="Mono" fontWeight={500} fontSize={22} fill={MUTED}>balanceador</text>
      {[0, 1, 2].map(k => <Rack key={k} x={790} y={50 + k * 300} w={250} h={250} t={t} carga={100} nome="" seed={k + 4} />)}
      {fluxo(t, 30, i => [560, 100 + hash(i + 3) * 800], () => [640, 470], RED, 1.6, {seed: 40})}
      {fluxo(t, 30, () => [690, 470], i => [790, 175 + (i % 3) * 300], RED, 1.6, {seed: 80})}
    </g> : null}

    {/* Cenas 5 a 8: borda (camada de defesa) */}
    {def > 0 ? <g opacity={def}>
      <rect x={WALL_X - 14} y={170} width={28} height={430} rx={14} fill={ORANGE} />
      <rect x={WALL_X - 30} y={170} width={60} height={430} rx={30} fill={ORANGE} opacity={0.14} />
      <g transform={`translate(${WALL_X},640)`}><circle r={34} fill={ORANGE} /><Icone nome="escudo" x={0} y={0} s={40} cor="#05070b" w={2.4} /></g>
      <text x={WALL_X} y={705} textAnchor="middle" fontFamily="Mono" fontWeight={500} fontSize={22} fill={ORANGE}>borda · CDN</text>
      {/* atacantes à esquerda */}
      {['bot', 'camera', 'roteador', 'notebook'].map((n, i) => <Selo key={n} nome={n} x={110} y={210 + i * 100} r={30} cor={RED} />)}
      <Selo nome="usuario" x={230} y={560} r={30} cor={GREEN} />
      {fluxo(t, 26, i => [140, 210 + (i % 4) * 100], i => [SERV.x, 300 + (i % 4) * 100], RED, 1.2, {para: WALL_X - 18, seed: 120})}
      {fluxo(t, 5, () => [260, 560], () => [SERV.x, 640], GREEN, 0.55, {curva: 60, seed: 200})}
    </g> : null}

    {/* Cena 5: tabela de limite por IP */}
    {s5 > 0 ? <g opacity={s5} transform="translate(40,740)">
      <rect width={640} height={260} rx={18} fill={CARD} stroke={LINE} strokeWidth={3} />
      <text x={24} y={42} fontFamily="Inter" fontWeight={600} fontSize={26} fill={INK}>Limite: 60 pedidos por minuto por IP</text>
      {[['185.220.101.4', '1.920', true], ['45.155.205.12', '2.410', true], ['201.17.88.3', '14', false], ['91.240.118.7', '3.050', true]].map(([ip, n, b], k) => {
        const ap = pr(t, 20 + k * 0.4, 20.4 + k * 0.4);
        return <g key={k} transform={`translate(24,${70 + k * 46})`} opacity={ap}>
          <text y={28} fontFamily="Mono" fontWeight={500} fontSize={23} fill={MUTED}>{ip}</text>
          <text x={380} y={28} textAnchor="end" fontFamily="Mono" fontWeight={500} fontSize={23} fill={INK}>{n}/min</text>
          <Chip x={b ? 405 : 445} y={2} texto={b ? '429 bloqueado' : '200 ok'} cor={b ? ORANGE : GREEN} size={20} />
        </g>;
      })}
    </g> : null}

    {/* Cena 6: desafio (verificação de humano) */}
    {s6 > 0 ? <g opacity={s6}>
      {[0, 1].map(k => {
        const bot = k === 1;
        const fim = pr(t, bot ? 27.4 : 26.6, bot ? 27.7 : 26.9);
        const gira = t * 6;
        return <g key={k} transform={`translate(40,${740 + k * 140})`}>
          <rect width={640} height={120} rx={16} fill={CARD} stroke={LINE} strokeWidth={3} />
          <Selo nome={bot ? 'bot' : 'usuario'} x={56} y={60} r={28} cor={bot ? RED : GREEN} />
          <rect x={110} y={38} width={44} height={44} rx={8} fill={CARD} stroke={fim > 0 ? (bot ? RED : GREEN) : '#c7c7cc'} strokeWidth={3} />
          {fim <= 0 ? <circle cx={132} cy={60} r={12} fill="none" stroke={BLUE} strokeWidth={4} strokeDasharray="40 40" transform={`rotate(${gira * 57} 132 60)`} /> : <g opacity={fim}><Icone nome={bot ? 'x' : 'check'} x={132} y={60} s={30} cor={bot ? RED : GREEN} w={3} /></g>}
          <text x={176} y={56} fontFamily="Inter" fontWeight={600} fontSize={28} fill={INK}>{fim > 0 ? (bot ? 'Falhou na verificação' : 'Sucesso!') : 'Verificando se você é humano...'}</text>
          <text x={176} y={90} fontFamily="Inter" fontSize={22} fill={MUTED}>{bot ? 'navegador automatizado, IP residencial' : 'cliente real, entra no site'}</text>
          <text x={616} y={30} textAnchor="end" fontFamily="Mono" fontWeight={500} fontSize={18} fill="#6e6e73">CAPTCHA · Turnstile</text>
        </g>;
      })}
    </g> : null}

    {/* Cena 7: IP vazado no DNS + firewall */}
    {s7 > 0 ? <g opacity={s7}>
      <g transform="translate(40,740)">
        <rect width={640} height={140} rx={16} fill={CARD} stroke={LINE} strokeWidth={3} />
        <text x={24} y={38} fontFamily="Inter" fontWeight={600} fontSize={24} fill={INK}>DNS</text>
        <text x={24} y={78} fontFamily="Mono" fontWeight={500} fontSize={22} fill={MUTED}>loja.com.br</text>
        <Chip x={400} y={56} texto="proxy ligado" cor={BLUE} claro size={19} />
        <text x={24} y={118} fontFamily="Mono" fontWeight={500} fontSize={22} fill={INK}>painel → 203.0.113.10</text>
        <Chip x={400} y={96} texto="IP vazado" cor={RED} size={19} />
      </g>
      <g transform="translate(40,900)" opacity={pr(t, 31.4, 31.8)}>
        <rect width={640} height={110} rx={16} fill="#0a0c10" stroke={LINE} strokeWidth={2} />
        <text x={24} y={44} fontFamily="Mono" fontWeight={500} fontSize={22} fill="#7ee2a0">permitir 443  de: IPs da borda</text>
        <text x={24} y={84} fontFamily="Mono" fontWeight={500} fontSize={22} fill="#ff6961">bloquear      de: todo o resto</text>
      </g>
      {(() => {
        const a = pr(t, 30.2, 31.2);
        const tranca = pr(t, 31.8, 32.1);
        const cor = tranca > 0.5 ? '#c7c7cc' : RED;
        return <g>
          <path d={`M110 210 C 260 20, 600 20, ${SERV.x - 10} 220`} stroke={cor} strokeWidth={7} fill="none" strokeDasharray="20 14" strokeDashoffset={-t * 90} opacity={a} />
          <text x={490} y={150} fontFamily="Mono" fontWeight={500} fontSize={22} fill={cor} opacity={a}>direto no IP vazado</text>
          {tranca > 0 ? <g transform={`translate(${SERV.x - 10},230) scale(${0.6 + 0.4 * tranca})`} opacity={tranca}>
            <circle r={44} fill={TEC.laranja} /><Icone nome="cadeado" x={0} y={0} s={46} cor="#05070b" w={2.4} />
          </g> : null}
        </g>;
      })()}
    </g> : null}

    {/* Cena 8: site de volta */}
    {s8 > 0 ? <g opacity={s8}>
      <Navegador x={40} y={740} w={640} h={260} erro={0} carregando={pr(t, 34.7, 35.6)} />
    </g> : null}

    <Kpis t={t} />
  </g>;
}

export const Ddos: React.FC<{cover?: boolean}> = ({cover = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [fontHandle] = useState(() => delayRender('Carregando fontes do reel DDoS'));
  useEffect(() => {
    Promise.all([...[400, 500, 600].map(w => document.fonts.load(`${w} 32px Inter`)), document.fonts.load('500 32px Mono')])
      .then(() => continueRender(fontHandle)).catch(cancelRender);
  }, [fontHandle]);
  const t = cover ? 12.5 : clamp(frame / fps, 0, DUR - 0.001);
  const idx = t >= FINAL_T0 ? CENAS.length - 1 : Math.max(0, CENAS.findIndex(c => t >= c.t0 && t < c.t1));
  const cena = CENAS[t >= FINAL_T0 ? CENAS.length - 1 : idx];
  const local = t - cena.t0;
  const dur = cena.t1 - cena.t0;
  const sai = t >= FINAL_T0 ? 0 : 1 - pr(local, dur - 0.22, dur);
  const head = (k: number): React.CSSProperties => {
    const p = cena.t0 === 0 ? 1 : pr(local, k * 0.08, 0.32 + k * 0.08);
    return {opacity: p * sai, transform: `translateY(${(1 - p) * 22}px)`};
  };
  const finalT = t - FINAL_T0;
  const fin = (k: number): React.CSSProperties => {
    const p = pr(finalT, 0.15 + k * 0.12, 0.5 + k * 0.12);
    return {opacity: p, transform: `translateY(${(1 - p) * 26}px)`};
  };
  const botnet = vis(t, 5.2, 9.8);
  const globo = vis(t, 19.6, 38.3);
  const desafio = vis(t, 25.3, 29.8);
  const respira = vis(t, 34.8, 38.3);

  return <AbsoluteFill className="bigo-root" id="v">
    <style>{fontCss + bigoStyles + ddosStyles}</style>
    <FundoTec t={t} />
    <Brand count={t >= FINAL_T0 ? `${TOTAL} / ${TOTAL}` : `${String(idx + 1).padStart(2, '0')} / ${TOTAL}`} />
    <div id="trail" style={{opacity: 1 - pr(t, FINAL_T0 - 0.3, FINAL_T0)}}>{CENAS.map((c, k) => k === idx
      ? <span key={k} style={{opacity: c.t0 === 0 ? 1 : pr(local, 0, 0.3)}}>{c.eb}</span>
      : <i key={k} className={k < idx ? 'done' : undefined} />)}</div>
    <div id="head">
      <p className="ponte" style={head(0)}>{cena.ponte}</p>
      <h1 style={head(1)} dangerouslySetInnerHTML={{__html: cena.title}} />
      <p className="lead" style={head(2)} dangerouslySetInnerHTML={{__html: cena.lead}} />
    </div>
    <svg id="stage" viewBox="0 0 1080 1200"><Palco t={t} /></svg>
    {botnet > 0 ? <div style={{position: 'absolute', left: 470, top: STAGE_TOP + 380, opacity: botnet}}><Orb state="connecting" px={200} ink={RED} paper="#05070b" speed={0.8} /></div> : null}
    {globo > 0 ? <div style={{position: 'absolute', left: WALL_X - 90, top: STAGE_TOP - 10, opacity: globo}}><Orb state="searching" px={180} ink={TEC.laranja} paper="#05070b" speed={0.6} /></div> : null}
    {desafio > 0 ? <div style={{position: 'absolute', left: 470, top: STAGE_TOP + 330, opacity: desafio}}><Orb state="solving" px={180} ink={TEC.azul} paper="#05070b" speed={0.7} /></div> : null}
    {respira > 0 ? <div style={{position: 'absolute', left: 470, top: STAGE_TOP + 330, opacity: respira}}><Orb state="breathing" px={200} ink={GREEN} paper="#05070b" speed={0.5} /></div> : null}
    {t >= FINAL_T0 ? <div id="final" style={{opacity: pr(finalT, 0, 0.35)}}>
      <Brand count={`${TOTAL} / ${TOTAL}`} />
      <div className="fbody">
        <p className="eyebrow" style={fin(0)}>Guia gratuito</p>
        <p className="big" style={fin(1)}>Comente<span>{PALAVRA}</span></p>
        <p className="recebe" style={fin(2)}>e receba no seu direct:</p>
        <div className="steps">{ITENS_GUIA.map((text, k) => <div key={text} style={fin(k + 3)}><b>{String(k + 1).padStart(2, '0')}</b>{text}</div>)}</div>
      </div>
      <div className="ffoot" style={fin(6)}><Assinatura /><span className="cta">Salve este post</span></div>
    </div> : null}
    <div className="progress"><i style={{width: `${(t / DUR) * 100}%`}} /></div>
  </AbsoluteFill>;
};

void BAND; void eo;
