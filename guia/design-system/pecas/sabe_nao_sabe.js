// O que se sabe / o que não se sabe: duas colunas (até 3 itens cada), lista longa (até 6 itens) ou um item
// por vez em cartão grande. Cada item entra em sequência. v2: compartilha texto, lista e contêiner; preserva
// a distinção entre as duas listas (confirmado em caixa branca ✓, em aberto em caixa preta ?). O título de
// cada coluna é chapéu na cor de destaque: o chapéu preto do estúdio v5 foi excluído pela v2 (D1).
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, chapeu, empilhar, familia, fundo, linhasDe, papel, tratamentoDe } from '../componentes.js';

export const id = 'sabe_nao_sabe';

export function montar({ valores: v, formato, tokens, recursos, duracao, destaque }) {
  const V = formato === '9x16';
  const m = familia(tokens, 'manrope');
  const sabe = linhasDe(v.sabe).slice(0, 3);
  const nao = linhasDe(v.nao_sabe);
  const versao = v.versao ?? 'duas colunas';
  let html;
  let trat = tratamentoDe(auto(v.tratamento) ?? 'desfoque');
  if (versao === 'lista longa') {
    trat = tratamentoDe(auto(v.tratamento) ?? 'fundo preto com grão');
    const itens = nao.slice(0, 6).map((x, j) => [`<div class="a${Math.min(j + 2, 7)}" style="display:flex;gap:16px;align-items:flex-start;text-align:left;max-width:${V ? 940 : 1500}px"><span style="${familia(tokens, 'tipo')};font-size:40px;line-height:1;color:var(--d);width:64px;flex:none">${j + 1}</span><span style="${m};font-size:${V ? 36 : 40}px;line-height:1.25;color:#fff">${esc(x)}</span></div>`, 22]);
    html = empilhar([chapeu(tokens, formato, v.titulo_nao || 'O que ainda não se sabe', { variante: 'destaque', classes: 'a1', destaque }), ...itens.map((x, i) => (i === 0 ? [x[0], 32] : x))]);
    const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao });
    return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? (V ? 'centro' : 'centro esquerda'), dx: v.deslocar_x, dy: v.deslocar_y, html }) };
  }
  if (versao === 'um por vez') {
    trat = tratamentoDe(auto(v.tratamento) ?? 'escuro');
    const n = Math.max(1, Math.min(nao.length, Number(v.item) || 1));
    const linhas = String(nao[n - 1] ?? '').split(/\s*\/\s*/).map((l) => `<span class="ln">${esc(caixaAlta(l))}</span>`).join('');
    html = empilhar([chapeu(tokens, formato, `${v.titulo_nao || 'O que não se sabe'} · ${n} de ${nao.length || 1}`, { variante: 'destaque', classes: 'a1', destaque }), [`<div class="a2" data-m="linhas" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 110 : 130 })};color:#fff">${linhas}</div>`, 32]]);
    const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao });
    return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html }) };
  }
  const coluna = (titulo, itens, ic, claro, i0) => `<div class="sombra" style="background:${claro ? '#fff' : '#000'};border:4px solid ${claro ? '#fff' : '#fff5'};padding:44px;width:${V ? 940 : 880}px;text-align:left">${chapeu(tokens, formato, titulo, { variante: 'destaque', destaque })}${itens.map((x, j) => `<div class="a${i0 + j}" style="display:flex;gap:24px;align-items:flex-start;margin-top:28px"><span style="flex:none;width:52px;height:52px;border-radius:50%;background:${claro ? '#000' : 'var(--d)'};color:${claro ? '#fff' : '#000'};${m};font-size:32px;line-height:52px;text-align:center">${ic}</span><span style="${m};font-size:${V ? 36 : 38}px;line-height:1.25;color:${claro ? '#000' : '#fff'}">${esc(x)}</span></div>`).join('')}</div>`;
  html = `<div style="display:flex;gap:${V ? 24 : 40}px;${V ? 'flex-direction:column' : ''}">${coluna(v.titulo_sabe || 'O que se sabe', sabe, '✓', true, 1)}${coluna(v.titulo_nao || 'O que não se sabe', nao.slice(0, 3), '?', false, 4)}</div>`;
  const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao });
  return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html }) };
}

export const opaca = (v) => v.versao === 'lista longa' && tratamentoDe(auto(v.tratamento) ?? 'fundo preto com grão') === 'grao';

const SABE = 'A reunião aconteceu em 14 de outubro, no gabinete\nHouve pagamento de R$ 2 milhões\nO contrato foi assinado sem licitação';
const NAO = 'Quem autorizou o repasse\nPara onde foi o dinheiro\nSe outros deputados sabiam';
export const exemplos = {
  'Duas colunas': { sabe: SABE, nao_sabe: NAO, fundo: { arquivo: 'exemplo-2' } },
  'Lista longa': { versao: 'lista longa', nao_sabe: 'Quem autorizou o repasse de R$ 2 milhões\nPara onde foi o dinheiro depois da segunda transferência\nSe outros deputados da comissão sabiam do contrato\nPor que a licitação foi dispensada\nQual é o papel da empresa de fachada\nQuando a PF vai ouvir o ex-assessor' },
  'Um por vez': { versao: 'um por vez', nao_sabe: 'Quem autorizou / o repasse\nPara onde foi / o dinheiro\nSe outros deputados / sabiam', item: 1, fundo: { arquivo: 'exemplo-3' } },
};
