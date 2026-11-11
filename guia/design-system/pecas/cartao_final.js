// Cartão final de ponte: leva para outro lugar. Short: "vídeo completo no canal" (~4 s). 16x9: "assista
// também", com as áreas dos vídeos recomendados livres para os elementos finais do YouTube (consulta 03/11:
// Luiza e Ana). v2: compartilha o conjunto editorial e a assinatura (logo opcional, declarada aqui).
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, chapeu, empilhar, fundo, linhasDe, papel, tratamentoDe } from '../componentes.js';

export const id = 'cartao_final';

export function montar({ valores: v, formato, tokens, recursos, duracao, destaque }) {
  const V = formato === '9x16';
  const logo = (h) => (v.assinatura === false ? '' : `<div class="a3" data-m="escala" style="display:flex;justify-content:${V ? 'center' : 'flex-start'}"><img src="${recursos.ds('marca/logos/NINJA-BRANCO.svg')}" alt="Mídia NINJA" style="height:${h}px;display:block"></div>`);
  const titulo = linhasDe(caixaAlta(v.texto ?? '')).map((l) => `<span class="ln">${esc(l)}</span>`).join('');
  const tituloHtml = titulo ? `<div class="a2" data-m="linhas" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 96 : 104 })};color:#fff">${titulo}</div>` : '';
  if (v.versao === 'assista também' && !V) {
    // Metade direita livre: duas áreas de vídeo recomendado (16:9) para os elementos finais do YouTube.
    const areas = [216, 696].map((top, i) => `<div class="a4" data-m="escala" style="left:1024px;top:${top}px;width:768px;height:${i ? 192 : 432}px;border:2px dashed rgba(255,255,255,${v.mostrar_areas ? 0.35 : 0})"></div>`).join('');
    const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(auto(v.tratamento) ?? 'fundo preto com grão'), foco: v.foco, duracao });
    const esquerda = bloco(tokens, formato, { posicao: 'centro esquerda', margens: { ...tokens.area[formato], direita: 1920 - 960 }, html: empilhar([chapeu(tokens, formato, v.chapeu || 'Assista também', { variante: 'destaque', classes: 'a1', destaque }), [tituloHtml, 20], [logo(100), 48]]) });
    return { fundo: f.fundo, html: f.camadas + esquerda + areas };
  }
  const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(auto(v.tratamento) ?? 'escuro'), foco: v.foco, duracao });
  return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([chapeu(tokens, formato, v.chapeu, { variante: 'destaque', classes: 'a1', destaque }), [tituloHtml, 20], [logo(80), 64]]) }) };
}

export const opaca = (v) => tratamentoDe(auto(v.tratamento) ?? (v.versao === 'assista também' ? 'fundo preto com grão' : 'escuro')) === 'grao';

export const exemplos = {
  'Short: vídeo completo': { chapeu: 'Vídeo completo no canal', texto: 'Assista à\ninvestigação inteira', fundo: { arquivo: 'exemplo-2' } },
  '16x9: assista também': { versao: 'assista também', texto: 'Mais sobre\no caso do jato', mostrar_areas: true },
};
