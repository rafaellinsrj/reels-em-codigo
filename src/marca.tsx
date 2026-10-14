import React from 'react';
import {Img, staticFile} from 'remotion';

// Identidade de quem publica. Troque aqui para usar os modelos com a sua marca.
export const MARCA = {
  nome: 'Lins Partners',
  autor: 'Rafael Lins',
  arroba: '@rafaellinscto',
  foto: 'assets/foto.jpg', // dentro de public/
};

/** Marca no topo de cada cena, com o contador "03 / 09". */
export function Brand({count}: {count: string}) {
  return <div className="top"><div className="brand"><svg viewBox="0 0 40 40"><g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M20 21 8 9M20 21 32 9M20 21v14M20 21l13 8" /></g><circle cx="8" cy="9" r="4" fill="currentColor" /><circle cx="20" cy="35" r="3.5" fill="currentColor" /><circle cx="33" cy="29" r="3" fill="currentColor" /><circle cx="32" cy="9" r="4.5" fill="#2997ff" /><circle cx="20" cy="21" r="7.5" fill="currentColor" /></svg>{MARCA.nome}</div><span className="count">{count}</span></div>;
}

/** Assinatura da lâmina final: foto, nome e arroba. */
export function Assinatura() {
  return <div className="handle"><Img src={staticFile(MARCA.foto)} alt={MARCA.autor} /><span><b>{MARCA.autor}</b>{MARCA.arroba}</span></div>;
}
