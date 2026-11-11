// Comparação: fala contra fala (a mesma pessoa em dois momentos; um lado em cor, o outro em P&B, e troca),
// antes e depois (o mesmo lugar) e versus (duas pessoas em tela cheia, com o dado de cada uma). v2: grade,
// mídia e rótulos compartilhados; preserva os modos e a associação entre os lados.
import { caixaAlta, esc } from '../base.js';
import { chapeu, contraste, familia, midia } from '../componentes.js';

export const id = 'comparacao';

export function montar({ valores: v, formato, tokens, destaque, recursos }) {
  const V = formato === '9x16';
  const modo = v.modo ?? 'fala contra fala';
  const a = tokens.area[formato];
  const metade = (n) => (V ? (n === 1 ? 'left:0;right:0;top:0;height:958px' : 'left:0;right:0;top:962px;bottom:0') : n === 1 ? 'left:0;top:0;bottom:0;width:958px' : 'left:962px;right:0;top:0;bottom:0');
  const img = (n, extra = '') => midia(recursos, `lado${n}`, { estilo: `position:absolute;inset:0;width:100%;height:100%;${extra}`, vazia: `Lado ${n}` });
  const fio = `<div class="w5" style="${V ? 'left:0;right:0;top:958px;height:4px' : 'left:958px;top:0;bottom:0;width:4px'};background:var(--d)"></div>`;
  const frase = (t, tam) => (String(t ?? '').trim() ? `<div style="margin-top:16px;${familia(tokens, 'tipo')};font-size:${tam}px;line-height:1;text-transform:uppercase;color:#fff">${esc(caixaAlta(t))}</div>` : '');
  // Rótulo de cada lado dentro da área útil e da própria metade.
  const pos = (n, base) => (V ? `left:${a.esquerda}px;${n === 1 ? `top:${a.topo}px` : base ? `bottom:${a.base}px` : 'top:1000px'}` : `${n === 1 ? `left:${a.esquerda}px` : 'left:1020px'};${base ? `bottom:${a.base}px` : `top:${a.topo}px`}`);

  if (modo === 'antes e depois') {
    return {
      fundo: '',
      html: `<div class="a1" data-m="varredura" style="${metade(1)};overflow:hidden">${img(1, 'filter:grayscale(1) contrast(1.1) brightness(.75)')}</div><div class="a2" data-m="varredura" style="${metade(2)};overflow:hidden">${img(2)}</div>${fio}` +
        `<div class="a4" style="${pos(1)}">${chapeu(tokens, formato, v.rotulo1, { variante: 'branco' })}</div><div class="a4" style="${pos(2)}">${chapeu(tokens, formato, v.rotulo2, { variante: 'destaque', destaque })}</div>`,
    };
  }
  if (modo === 'versus') {
    const dado = (t) => (String(t ?? '').trim() ? `<div style="margin-top:16px;${familia(tokens, 'tipo')};font-size:${V ? 72 : 96}px;line-height:1;color:#fff">${esc(t)}</div>` : '');
    return {
      fundo: '',
      html: `<div class="a1" data-m="varredura" style="${metade(1)};overflow:hidden">${img(1)}</div><div class="a2" data-m="varredura" style="${metade(2)};overflow:hidden">${img(2)}</div>` +
        contraste(tokens, formato, 'degrade', { ancoras: ['.vs-rotulo'], fimFoto: tokens.quadro[formato].altura }) +
        `<div class="a3 tsombra" data-m="escala" style="left:0;right:0;top:${V ? 860 : 400}px;text-align:center;${familia(tokens, 'tipo')};font-size:${V ? 200 : 260}px;line-height:1;color:var(--d)">×</div>` +
        `<div class="a4 vs-rotulo" style="${V ? `left:${a.esquerda}px;top:700px` : `left:${a.esquerda}px;bottom:${a.base}px`}">${chapeu(tokens, formato, v.rotulo1, { variante: 'branco' })}${dado(v.dado1)}</div>` +
        `<div class="a4" style="${V ? `left:${a.esquerda}px;bottom:${a.base + 20}px` : `right:${a.direita}px;bottom:${a.base}px;text-align:right`}">${chapeu(tokens, formato, v.rotulo2, { variante: 'destaque', destaque })}${dado(v.dado2)}</div>`,
    };
  }
  // Fala contra fala: troca de lado a cada "alterna_s" segundos (timeline, não CSS: o render é por quadro).
  return {
    fundo: '',
    raiz: Number(v.alterna_s) > 0 ? { 'alterna-s': Number(v.alterna_s) } : {},
    html: `<div data-alterna="A" style="${metade(1)};overflow:hidden">${img(1)}</div><div data-alterna="B" style="${metade(2)};overflow:hidden">${img(2)}</div>${fio}` +
      `<div class="a2 tsombra" style="${pos(1, !V)}">${chapeu(tokens, formato, v.rotulo1, { variante: 'branco' })}${frase(v.frase1, V ? 56 : 64)}</div>` +
      `<div class="a3 tsombra" style="${pos(2, !V)}">${chapeu(tokens, formato, v.rotulo2, { variante: 'destaque', destaque })}${frase(v.frase2, V ? 56 : 64)}</div>`,
  };
}

export const opaca = () => true;

export const exemplos = {
  'Fala contra fala': { modo: 'fala contra fala', lado1: { arquivo: 'exemplo-pessoa' }, rotulo1: 'Lula · 2018', frase1: '“Não vou disputar”', lado2: { arquivo: 'exemplo-pessoa' }, rotulo2: 'Lula · 2026', frase2: '“Sou candidato”' },
  'Antes e depois': { modo: 'antes e depois', lado1: { arquivo: 'exemplo-3' }, rotulo1: '2019', lado2: { arquivo: 'exemplo-3' }, rotulo2: '2026' },
  'Versus (tela cheia)': { modo: 'versus', lado1: { arquivo: 'exemplo-pessoa' }, rotulo1: 'Candidata A', dado1: '48%', lado2: { arquivo: 'exemplo-pessoa' }, rotulo2: 'Candidato B', dado2: '45%' },
};
