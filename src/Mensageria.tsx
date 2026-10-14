import React from 'react';
import {Caixa, Cena, LARANJA, PESSEGO, AREIA, Ponto, ReelShell, framesComPausa} from './ReelBase';
import {TEC} from './FundoTec';
import {CARD, INK, LINE, MUTED, RED, GREEN, pr, vis} from './ddos-ui';

// Reel "Kafka ou RabbitMQ", 25,5 s. Base: reel DeMao4mtxyC do @krishnachaytanyaa (nossa versão).

export const DUR = 25.5;

const CENAS: Cena[] = [
  {t0: 0, t1: 4, eb: 'Mensageria', ponte: 'Arquitetura na prática', title: '<em>Kafka</em> ou <em>RabbitMQ</em>?', lead: 'A diferença está no que acontece <b>depois da leitura</b>.'},
  {t0: 4, t1: 11, eb: 'Leitura', ponte: 'Mesmo pedido, dois caminhos', title: 'RabbitMQ apaga. Kafka <em>guarda</em>.', lead: 'Depois da confirmação, a fila esvazia. O log fica.'},
  {t0: 11, t1: 16.5, eb: 'Histórico', ponte: 'Chega um serviço novo', title: 'Quem chega depois <em>relê tudo</em>?', lead: 'No Kafka, sim. No RabbitMQ, <b>não sobrou nada</b>.'},
  {t0: 16.5, t1: 21, eb: 'Escolha', ponte: 'Quando usar cada um', title: 'Tarefa única ou <em>histórico</em>.', lead: 'Os dois são ótimos. Para <b>problemas diferentes</b>.'},
];
const FINAL_T0 = 21;

const N = 6;
const COL = [{x: 50, nome: 'RabbitMQ', sub: 'fila', cor: PESSEGO}, {x: 570, nome: 'Kafka', sub: 'log', cor: TEC.azul}];
const CW = 460;
const SLOT_Y = (k: number) => 560 - k * 62;
const PROD: [number, number] = [540, 130];
const T_ENV = (k: number) => 4.6 + k * 0.35;   // pedido k chega às duas colunas
const T_LE = (k: number) => 7.0 + k * 0.45;    // e-mail lê o pedido k

function Colunas({t}: {t: number}) {
  const l = t - 4;
  return <g>
    <Caixa x={340} y={40} w={400} h={90} rotulo="Serviço de pedidos" cor={LARANJA} op={pr(t, 0.3, 0.8)} size={28} />
    {COL.map((c, ci) => {
      const ap = pr(t, 0.6 + ci * 0.2, 1.1 + ci * 0.2);
      // mensagens guardadas agora
      let guardadas = 0;
      const slots = Array.from({length: N}).map((_, k) => {
        const chegou = t > T_ENV(k) + 0.6;
        const lida = t > T_LE(k) + 0.3;
        const some = ci === 0 && lida ? pr(t, T_LE(k) + 0.3, T_LE(k) + 0.6) : 0;
        if (chegou && (ci === 1 || !lida)) guardadas++;
        if (!chegou) return null;
        return <g key={k} opacity={1 - some}>
          <rect x={c.x + 60} y={SLOT_Y(k)} width={CW - 120} height={50} rx={12} fill={CARD} stroke={lida && ci === 1 ? '#3a3f48' : c.cor} strokeWidth={2.5} />
          <text x={c.x + 90} y={SLOT_Y(k) + 33} fontFamily="Mono" fontWeight={500} fontSize={22} fill={lida && ci === 1 ? MUTED : INK}>pedido #{k + 1}</text>
          {lida ? <text x={c.x + CW - 80} y={SLOT_Y(k) + 33} textAnchor="end" fontFamily="Mono" fontWeight={500} fontSize={20} fill={ci === 0 ? RED : GREEN}>{ci === 0 ? 'apagado' : 'lido'}</text> : null}
        </g>;
      });
      // marcador do Kafka: posição do último lido
      const lidos = Array.from({length: N}).filter((_, k) => t > T_LE(k) + 0.3).length;
      return <g key={ci} opacity={ap}>
        <rect x={c.x} y={170} width={CW} height={470} rx={24} fill="none" stroke={LINE} strokeWidth={3} />
        <text x={c.x + 30} y={215} fontFamily="Inter" fontWeight={600} fontSize={34} fill={c.cor}>{c.nome}</text>
        <text x={c.x + CW - 30} y={215} textAnchor="end" fontFamily="Mono" fontWeight={500} fontSize={22} fill={MUTED}>{c.sub}</text>
        {slots}
        {ci === 1 && lidos > 0 ? <g>
          <path d={`M${c.x + 20} ${SLOT_Y(lidos - 1) + 25} l24 -14 v28 z`} fill={LARANJA} />
          <text x={c.x + 18} y={SLOT_Y(lidos - 1) - 6} fontFamily="Mono" fontWeight={500} fontSize={18} fill={LARANJA}>marcador</text>
        </g> : null}
        <text x={c.x + CW / 2} y={680} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} fill={MUTED} opacity={pr(l, 0.8, 1.2)}>guardados: <tspan fill={c.cor} fontWeight={600}>{guardadas}</tspan></text>
        <Caixa x={c.x + 80} y={720} w={CW - 160} h={80} rotulo="Serviço de e-mail" cor={LINE} op={pr(l, 1.5, 2)} size={26} />
      </g>;
    })}
    {Array.from({length: N}).map((_, k) => COL.map((c, ci) => <Ponto key={`${k}-${ci}`} t={t} t0={T_ENV(k)} t1={T_ENV(k) + 0.6} a={PROD} b={[c.x + CW / 2, 230]} cor={AREIA} r={8} />))}
    {Array.from({length: N}).map((_, k) => COL.map((c, ci) => <Ponto key={`l${k}-${ci}`} t={t} t0={T_LE(k)} t1={T_LE(k) + 0.3} a={[c.x + CW / 2, SLOT_Y(k) + 50]} b={[c.x + CW / 2, 720]} cor={GREEN} r={7} />))}
  </g>;
}

function Replay({t}: {t: number}) {
  const l = t - 11;
  const relidosK = Math.min(N, Math.max(0, Math.floor((l - 1.4) / 0.35) + 1));
  return <g opacity={pr(l, 0.6, 1)}>
    {COL.map((c, ci) => <g key={ci}>
      <Caixa x={c.x + 80} y={880} w={CW - 160} h={80} rotulo="Serviço novo: análise" cor={LARANJA} op={pr(l, 0.6, 1)} size={24} />
      <text x={c.x + CW / 2} y={1010} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={34} fill={ci === 0 ? RED : GREEN} opacity={pr(l, 1.2, 1.6)}>{ci === 0 ? 'relidos: 0' : `relidos: ${l > 1.4 ? relidosK : 0}`}</text>
      {ci === 1 ? Array.from({length: N}).map((_, k) => <Ponto key={k} t={t} t0={12.4 + k * 0.35} t1={12.9 + k * 0.35} a={[c.x + CW / 2, SLOT_Y(k) + 25]} b={[c.x + CW / 2, 880]} cor={LARANJA} r={8} />) : null}
      {ci === 0 && l > 1.6 ? <text x={c.x + CW / 2} y={420} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={30} fill={MUTED} opacity={pr(l, 1.6, 2)}>fila vazia</text> : null}
    </g>)}
    <text x={540} y={1090} textAnchor="middle" fontFamily="Inter" fontSize={26} fill="#c7c7cc" opacity={pr(l, 3, 3.4)}>O Kafka também apaga, mas por tempo: 7 dias, por padrão.</text>
  </g>;
}

function Escolha({t}: {t: number}) {
  const l = t - 16.5;
  const cards: [string, string, string[]][] = [
    ['RabbitMQ', PESSEGO, ['Tarefa que roda uma vez', 'Enviar e-mail, gerar PDF', 'Roteamento e reentrega']],
    ['Kafka', TEC.azul, ['Muitos leem o mesmo dado', 'Eventos e alto volume', 'Reprocessar o passado']],
  ];
  return <g>{cards.map(([nome, cor, itens], k) => {
    const p = pr(l, 0.3 + k * 0.3, 0.8 + k * 0.3);
    const y = 60 + k * 400;
    return <g key={nome} opacity={p} transform={`translate(0,${(1 - p) * 20})`}>
      <rect x={40} y={y} width={1000} height={350} rx={26} fill={CARD} stroke={cor} strokeWidth={3} />
      <text x={90} y={y + 75} fontFamily="Inter" fontWeight={600} fontSize={46} fill={cor}>{nome}</text>
      {itens.map((s, j) => <g key={s}>
        <circle cx={104} cy={y + 140 + j * 70} r={9} fill={cor} />
        <text x={134} y={y + 151 + j * 70} fontFamily="Inter" fontWeight={500} fontSize={34} fill={INK}>{s}</text>
      </g>)}
    </g>;
  })}</g>;
}

export const Mensageria: React.FC<{cover?: boolean}> = ({cover}) => <ReelShell
  nome="Mensageria" dur={DUR} cenas={CENAS} finalT0={FINAL_T0} palavra="MENSAGERIA" capaT={13.6} cover={cover}
  itens={['Fila ou log: o que cada um guarda', 'Quando usar Kafka ou RabbitMQ', 'As opções gerenciadas nas nuvens']}
  palco={t => <g>
    {t < 16.8 ? <g opacity={vis(t, -1, 16.7)}><Colunas t={t} /></g> : null}
    {t >= 11 && t < 16.8 ? <g opacity={vis(t, 10.8, 16.7)}><Replay t={t} /></g> : null}
    {t >= 16.3 ? <g opacity={vis(t, 16.3, 21.3)}><Escolha t={t} /></g> : null}
  </g>}
/>;

export const durationInFrames = framesComPausa(DUR, CENAS.length);
