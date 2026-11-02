// Tarja de nome e cargo: evolução da tarja do .mogrt. Nome em caixa branca (Aktiv), cargo ou @ em
// caixa preta, empilhadas e alinhadas pela mesma borda. Entra 0,2 s depois do corte com varredura.
import { esc, fonte } from '../base.js';

export const id = 'tarja_nome';

// No 9x16 a tarja fica logo acima da faixa de legenda (estúdio v4), não na base da área de texto.
const BASE_9X16 = 640;
const FIO_DESTAQUE = 8;

export function montar({ valores, formato, tokens, destaque }) {
  const area = tokens.area[formato];
  const tn = tokens.texto.tarja_nome;
  const tc = tokens.texto.tarja_cargo;
  const ta = tokens.texto.tarja_arroba;
  const direita = valores.lado === 'direita';
  const base = formato === '9x16' ? BASE_9X16 : area.base;
  const lado = direita ? `right:${area.direita}px;align-items:flex-end` : `left:${area.esquerda}px;align-items:flex-start`;
  const fio = valores.variacao === 'fio de destaque' ? `;box-shadow:inset 0 -${FIO_DESTAQUE}px 0 ${destaque}` : '';

  const nome = `<div id="t-nome" data-campo="nome" style="${fonte(tokens, tn.fonte)};font-size:${tn.tamanho}px;line-height:${tn.entrelinha};padding:${tn.respiro[0]}px ${tn.respiro[1]}px;background:${tokens.cores.branco};color:${tokens.cores.preto};white-space:nowrap${fio}">${esc(String(valores.nome ?? '').trim())}</div>`;

  let segunda = '';
  const arroba = String(valores.arroba ?? '').trim();
  const cargo = String(valores.cargo ?? '').trim();
  if (arroba) {
    const texto = arroba.startsWith('@') ? arroba : `@${arroba}`;
    segunda = `<div id="t-cargo" data-campo="arroba" style="${fonte(tokens, ta.fonte)};font-size:${ta.tamanho}px;line-height:${ta.entrelinha};padding:${ta.respiro[0]}px ${ta.respiro[1]}px;background:${tokens.cores.preto};color:${tokens.cores.branco};white-space:nowrap">${esc(texto)}</div>`;
  } else if (cargo) {
    segunda = `<div id="t-cargo" data-campo="cargo" style="${fonte(tokens, tc.fonte)};font-size:${tc.tamanho}px;line-height:${tc.entrelinha};padding:${tc.respiro[0]}px ${tc.respiro[1]}px;background:${tokens.cores.preto};color:${tokens.cores.branco};text-transform:uppercase;white-space:nowrap">${esc(cargo)}</div>`;
  }

  const html = `<div id="t-bloco" style="position:absolute;bottom:${base}px;${lado};display:flex;flex-direction:column">${nome}${segunda}</div>`;

  const a = tokens.animacao;
  // A varredura vem do lado em que a tarja está presa.
  const fechado = direita ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
  const aberto = 'inset(0 0% 0 0%)';
  const animacoes = [
    { alvo: '#t-nome', de: { clipPath: fechado }, para: { clipPath: aberto }, em: a.atraso, duracao: a.entrada, ease: a.ease_entrada },
  ];
  if (segunda) {
    animacoes.push({ alvo: '#t-cargo', de: { clipPath: fechado }, para: { clipPath: aberto }, em: a.atraso + a.escalonamento, duracao: a.entrada, ease: a.ease_entrada });
  }
  // Saída seca, com o corte (regra A6 do estúdio): sem animação de saída.
  return { fundo: '', html, css: '', animacoes };
}
