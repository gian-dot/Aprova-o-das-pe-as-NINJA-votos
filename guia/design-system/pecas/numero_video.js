// Número sobre o vídeo: o número pertence a algo na imagem — à pessoa (tarjas empilhadas), ao objeto (seta
// desenhada) ou ao plano inteiro (contador no canto). Consulta 03/11: posição livre do rótulo (x e y em %
// da área útil), seta em qualquer direção e tamanho normal/grande/gigante (Gian, Luiza, Mauro, Ana).
import { caixaAlta, esc } from '../base.js';
import { chapeu, familia, funcao } from '../componentes.js';
import { lerNumero } from './numero.js';

export const id = 'numero_video';

const ESCALA = { normal: 1, grande: 1.5, gigante: 2.2 };
// Ângulo da seta (graus): a seta desenhada aponta para baixo à direita (45°) e gira a partir daí.
const DIRECOES = { 'baixo direita': 0, baixo: 45, 'baixo esquerda': 90, esquerda: 135, 'cima esquerda': 180, cima: 225, 'cima direita': 270, direita: 315 };
const SETA = '<svg width="300" height="230" viewBox="0 0 260 200" style="overflow:visible"><path d="M10 20 C 120 10, 200 60, 230 170" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M200 150 L232 178 L245 135" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function montar({ valores: v, formato, tokens, destaque }) {
  const a = tokens.area[formato];
  const { largura: W, altura: A } = tokens.quadro[formato];
  const k = ESCALA[v.tamanho] ?? 1;
  const px = Number.isFinite(Number(v.posicao_x)) && v.posicao_x !== '' ? Number(v.posicao_x) : null;
  const py = Number.isFinite(Number(v.posicao_y)) && v.posicao_y !== '' ? Number(v.posicao_y) : null;
  const x = a.esquerda + ((px ?? 10) / 100) * (W - a.esquerda - a.direita);
  const y = a.topo + ((py ?? (formato === '9x16' ? 60 : 70)) / 100) * (A - a.topo - a.base);
  const lugar = `left:${Math.round(x)}px;top:${Math.round(y)}px`;
  const n = lerNumero(v.numero);
  const num = n ? `<span data-v="${n.valor}" data-casas="${n.casas}">${esc(v.numero)}</span>` : esc(v.numero ?? '');
  const ligacao = v.ligacao ?? 'pessoa';
  if (ligacao === 'objeto') {
    const ang = DIRECOES[v.direcao_seta] ?? 0;
    const rotulo = `<div class="a1" data-m="varredura" style="${lugar};transform:scale(${k});transform-origin:0 0">${chapeu(tokens, formato, v.numero, { variante: 'destaque', destaque })}<br>${chapeu(tokens, formato, v.rotulo, { variante: 'branco' })}</div>`;
    const seta = `<div class="a2" data-m="desenhar" style="left:${Math.round(x + 120 * k)}px;top:${Math.round(y + 110 * k)}px;transform:rotate(${ang}deg) scale(${k});transform-origin:0 0">${SETA}</div>`;
    return { fundo: '', html: rotulo + seta };
  }
  if (ligacao === 'canto') {
    const html = `<div style="${lugar};transform:scale(${k});transform-origin:0 0">${funcao(tokens, v.rotulo, { classes: 'a1' })}<div class="a2" ${n ? 'data-m="contar"' : ''} style="${familia(tokens, 'tipo')};font-size:160px;line-height:.9;color:var(--d);background:#000;padding:18px 28px 6px;width:fit-content">${num}</div></div>`;
    return { fundo: '', html };
  }
  const tarja = (texto, cor, tam, ordem) => `<div class="w${ordem}" data-saida="varredura" data-caixa data-pad="12" style="${familia(tokens, 'tipo')};font-size:${tam}px;line-height:1;text-transform:uppercase;background:${cor};color:#000;padding:12px 22px;width:fit-content">${texto}</div>`;
  const html = `<div style="${lugar};transform:scale(${k});transform-origin:0 0">${tarja(esc(caixaAlta(v.rotulo ?? '')), '#fff', 60, 1)}${tarja(num, 'var(--d)', 52, 2)}</div>`;
  return { fundo: '', html };
}

export const exemplos = {
  'Ligado à pessoa': { ligacao: 'pessoa', rotulo: 'Lula', numero: '+ 10.376.694 votos' },
  'Seta para o objeto': { ligacao: 'objeto', rotulo: 'área queimada', numero: '2,3 mil ha', posicao_x: 30, posicao_y: 10, direcao_seta: 'baixo direita' },
  'Seta para a esquerda, grande': { ligacao: 'objeto', rotulo: 'Barragem', numero: '12 m', posicao_x: 55, posicao_y: 20, direcao_seta: 'baixo esquerda', tamanho: 'grande' },
  'Contador no canto': { ligacao: 'canto', rotulo: 'Mortos na operação', numero: '28', posicao_x: 0, posicao_y: 0 },
};
