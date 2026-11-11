// Tela dividida (2, 3, 4) e grid de fotos: uma grade compartilhada com variantes de divisão. Cada célula
// tem a própria mídia, o próprio enquadramento e o próprio crédito (v2: crop e crédito presos à célula,
// T10). As imagens entram em cascata; o fio na cor de destaque por último. Consulta 03/11: no 9x16, as
// quatro colunas saíram; quatro imagens viram grade 2 × 2 (Mauro, Ana).
import { creditoMini, midia } from '../componentes.js';

export const id = 'tela_dividida';
export const apelidos = ['grid_fotos'];

const CELULAS = 4;

// Retângulos (x, y, largura, altura) de cada célula. `fio` = espessura do fio entre as células.
export function grade(divisao, formato, fio = 4) {
  const H = formato === '16x9';
  const W = H ? 1920 : 1080;
  const A = H ? 1080 : 1920;
  const m = fio / 2;
  const faixas = (n) => [...Array(n)].map((_, i) => (H
    ? { x: (i * W) / n + (i ? m : 0), y: 0, w: W / n - (i ? m : 0) - (i < n - 1 ? m : 0), h: A }
    : { x: 0, y: (i * A) / n + (i ? m : 0), w: W, h: A / n - (i ? m : 0) - (i < n - 1 ? m : 0) }));
  switch (divisao) {
    case '2': return faixas(2);
    case '3': return faixas(3);
    case '1 + 2': return H
      ? [{ x: 0, y: 0, w: W / 2 - m, h: A }, { x: W / 2 + m, y: 0, w: W / 2 - m, h: A / 2 - m }, { x: W / 2 + m, y: A / 2 + m, w: W / 2 - m, h: A / 2 - m }]
      : [{ x: 0, y: 0, w: W, h: A / 2 - m }, { x: 0, y: A / 2 + m, w: W / 2 - m, h: A / 2 - m }, { x: W / 2 + m, y: A / 2 + m, w: W / 2 - m, h: A / 2 - m }];
    case '4 (grade 2 × 2)': return [0, 1, 2, 3].map((i) => ({ x: (i % 2) * (W / 2 + m), y: Math.floor(i / 2) * (A / 2 + m), w: W / 2 - m, h: A / 2 - m }));
    default: return faixas(2);
  }
}

export function montar({ valores: v, formato, tokens, recursos }) {
  const div = v.divisao ?? '2';
  const celulas = grade(div, formato);
  const a = tokens.area[formato];
  let h = '<div style="position:absolute;inset:0;background:#000"></div>';
  celulas.forEach((c, i) => {
    const n = i + 1;
    const img = midia(recursos, `midia${n}`, { estilo: 'position:absolute;inset:0;width:100%;height:100%', vazia: `Imagem ${n}` });
    // Crédito dentro da célula e da área segura do perfil.
    const topo = Math.max(c.y + 32, a.topo);
    const esq = Math.max(c.x + 32, a.esquerda);
    const credito = creditoMini(tokens, formato, v[`credito${n}`], `position:absolute;left:${esq - c.x}px;top:${topo - c.y}px`);
    h += `<div class="a${n}" data-m="varredura" data-celula="${n}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;overflow:hidden">${img}${credito}</div>`;
  });
  if (v.fio !== false) {
    const linhas = new Set();
    for (const c of celulas) {
      if (c.x > 0) linhas.add(`v${Math.round(c.x - 4)}|${Math.round(c.y)}|${Math.round(c.h)}`);
      if (c.y > 0) linhas.add(`h${Math.round(c.y - 4)}|${Math.round(c.x)}|${Math.round(c.w)}`);
    }
    for (const l of linhas) {
      const [k, p, q] = l.slice(1).split('|').map(Number);
      const vertical = l[0] === 'v';
      h += `<div class="w${CELULAS + 1}" style="${vertical ? `left:${k}px;width:4px;top:${p}px;height:${q}px` : `top:${k}px;height:4px;left:${p}px;width:${q}px`};background:var(--d)"></div>`;
    }
  }
  return { fundo: '', html: h };
}

export const opaca = () => true;

export const exemplos = {
  '2': { divisao: '2', midia1: { arquivo: 'exemplo-1' }, midia2: { arquivo: 'exemplo-2' }, credito1: 'Foto: Mídia NINJA', credito2: 'Reprodução: G1' },
  '3 iguais (grid de fotos)': { divisao: '3', midia1: { arquivo: 'exemplo-1' }, midia2: { arquivo: 'exemplo-2' }, midia3: { arquivo: 'exemplo-3' } },
  '1 + 2': { divisao: '1 + 2', midia1: { arquivo: 'exemplo-1' }, midia2: { arquivo: 'exemplo-2' }, midia3: { arquivo: 'exemplo-3' } },
  '4 (grade 2 × 2)': { divisao: '4 (grade 2 × 2)', midia1: { arquivo: 'exemplo-1' }, midia2: { arquivo: 'exemplo-2' }, midia3: { arquivo: 'exemplo-3' }, midia4: { arquivo: 'exemplo-4' } },
};
