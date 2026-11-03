// Tarja de nome e cargo: evolução da tarja do .mogrt, no NINJA Design System. Nome em caixa branca
// (TipoNinja, caixa alta), cargo ou @ em caixa preta (Manrope Medium), empilhadas e alinhadas pela
// mesma borda. Entra com varredura 0,25 s depois do corte e sai com a varredura ao contrário.
import { caixaAlta, esc, fonte } from '../base.js';

export const id = 'tarja_nome';

// No 9x16 a tarja fica logo acima da faixa de legenda (62–87% da altura), não na base da área segura.
const BASE_9X16 = 640;
const FIO_DESTAQUE = 8;

export function montar({ valores, formato, tokens, destaque, duracao }) {
  const area = tokens.area[formato];
  const tn = tokens.texto.tarja_nome;
  const tc = tokens.texto.tarja_cargo;
  const ta = tokens.texto.tarja_arroba;
  const direita = valores.lado === 'direita';
  const base = formato === '9x16' ? BASE_9X16 : area.base;
  const lado = direita ? `right:${area.direita}px;align-items:flex-end` : `left:${area.esquerda}px;align-items:flex-start`;
  const fio = valores.variacao === 'fio de destaque' ? `;box-shadow:inset 0 -${FIO_DESTAQUE}px 0 ${destaque}` : '';

  const nome = `<div id="t-nome" style="${fonte(tokens, tn.fonte)};font-size:${tn.tamanho}px;line-height:1;padding:${tn.respiro[0]}px ${tn.respiro[1]}px ${tn.respiro[0] - 4}px;background:${tokens.cores.branco};color:${tokens.cores.preto};text-transform:uppercase;white-space:nowrap${fio}" data-campo="nome">${esc(caixaAlta(String(valores.nome ?? '').trim()))}</div>`;

  let segunda = '';
  const arroba = String(valores.arroba ?? '').trim();
  const cargo = String(valores.cargo ?? '').trim();
  if (arroba) {
    const texto = arroba.startsWith('@') ? arroba : `@${arroba}`;
    segunda = `<div id="t-cargo" style="${fonte(tokens, ta.fonte)};font-size:${ta.tamanho}px;line-height:${ta.entrelinha};padding:${ta.respiro[0]}px ${ta.respiro[1]}px;background:${tokens.cores.preto};color:${tokens.cores.branco};white-space:nowrap" data-campo="arroba">${esc(texto)}</div>`;
  } else if (cargo) {
    segunda = `<div id="t-cargo" style="${fonte(tokens, tc.fonte)};font-size:${tc.tamanho}px;line-height:${tc.entrelinha};letter-spacing:${tc.espacamento}em;padding:${tc.respiro[0]}px ${tc.respiro[1]}px;background:${tokens.cores.preto};color:${tokens.cores.branco};text-transform:uppercase;white-space:nowrap" data-campo="cargo">${esc(cargo)}</div>`;
  }

  const html = `<div id="t-bloco" style="position:absolute;bottom:${base}px;${lado};display:flex;flex-direction:column">${nome}${segunda}</div>`;

  const a = tokens.animacao;
  // A varredura vem do lado em que a tarja está presa e volta para ele na saída.
  const fechado = direita ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
  const aberto = 'inset(0 0% 0 0%)';
  const alvos = segunda ? ['#t-nome', '#t-cargo'] : ['#t-nome'];
  const animacoes = alvos.map((alvo, i) => ({ alvo, de: { clipPath: fechado }, para: { clipPath: aberto }, em: a.atraso + i * a.escalonamento, duracao: a.entrada * 0.85, ease: a.ease_varredura }));
  const sai = Math.max(1, (duracao ?? 4) - a.saida_texto - 0.1);
  alvos.slice().reverse().forEach((alvo, i) => {
    animacoes.push({ alvo, de: { clipPath: aberto }, para: { clipPath: fechado }, em: sai + i * 0.06, duracao: a.saida_texto, ease: a.ease_saida });
  });
  return { fundo: '', html, css: '', animacoes };
}
