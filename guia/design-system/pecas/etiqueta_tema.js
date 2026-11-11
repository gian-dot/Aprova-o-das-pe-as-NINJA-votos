// Etiqueta de tema / série: rótulo que diz a pauta durante o bloco, no topo da área segura. A fita varre da
// esquerda. v2: compartilha a construção de etiqueta e a centralização (caixa única D8); o recorte da fita e
// o cabeçalho de série são estilos próprios (legado do estúdio v5). Aprovada na consulta (3 de 5).
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, caixa, chapeu, papel } from '../componentes.js';

export const id = 'etiqueta_tema';

export function montar({ valores: v, formato, tokens, destaque }) {
  const V = formato === '9x16';
  const tema = esc(caixaAlta(String(v.tema ?? '').trim()));
  if (v.estilo === 'cabeçalho fixo') {
    const ano = String(v.ano ?? '').trim();
    const sombra = `<div class="m-fundo" style="position:absolute;left:0;right:0;top:0;height:${V ? 360 : 200}px;background:linear-gradient(#000e,#0000)"></div>`;
    const conteudo = `<div class="a1" style="display:flex;align-items:center;gap:24px">${ano ? `<span style="${papel(tokens, 'titulo', formato, { tamanho: 72 })};color:#fff">${esc(ano)}</span>` : ''}${chapeu(tokens, formato, v.tema, { variante: 'destaque', destaque })}</div>`;
    return { fundo: '', html: sombra + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'topo esquerda', dx: v.deslocar_x, dy: v.deslocar_y, html: conteudo }) };
  }
  // Fita recortada: caixa única na cor de destaque, com a borda irregular de fita.
  const fita = caixa(tokens, formato, [tema], {
    variante: 'unica', papel: 'chapeu', fundo: 'var(--d)', corTexto: '#000', alinhar: 'left', tamanho: 40,
    classes: 'w1', estilo: 'clip-path:polygon(0 8%,4% 0,30% 6%,60% 0,100% 5%,98% 50%,100% 94%,70% 100%,40% 94%,6% 100%,0 60%)',
  });
  return { fundo: '', html: bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'topo esquerda', dx: v.deslocar_x, dy: v.deslocar_y, html: fita }) };
}

export const exemplos = {
  'Fita recortada': { tema: 'Eleições 26' },
  'Cabeçalho fixo': { estilo: 'cabeçalho fixo', tema: 'Operação Jato', ano: '2026' },
};
