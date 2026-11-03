// Crédito: vertical na borda direita (padrão do Canva) ou mini no topo (padrão de 9 em 16 referências).
// Pequeno, colado nas bordas e sem animação: entra e sai com o corte da imagem (pedido do Gian, 02/11).
import { caixaAlta, esc, fonte } from '../base.js';

export const id = 'credito';

const POSICAO = {
  vertical: {
    '16x9': 'right:24px;bottom:60px',
    '9x16': 'right:20px;bottom:240px',
  },
  mini: {
    '16x9': 'left:60px;top:32px',
    '9x16': 'left:70px;top:240px',
  },
};

export function montar({ valores, formato, tokens }) {
  const mini = String(valores.posicao ?? '').startsWith('mini');
  const t = mini ? tokens.texto.credito_mini : tokens.texto.credito;
  const tamanho = mini ? t.tamanho : t[formato].tamanho;
  const lugar = POSICAO[mini ? 'mini' : 'vertical'][formato];
  // Vertical: lê de baixo para cima, como o crédito de foto do Canva.
  const giro = mini ? '' : ';writing-mode:vertical-rl;transform:rotate(180deg)';
  const html = `<div id="c-texto" data-campo="texto" style="position:absolute;${lugar};${fonte(tokens, t.fonte)};font-size:${tamanho}px;line-height:1;letter-spacing:${t.espacamento}em;color:${tokens.cores.credito};white-space:nowrap${giro}">${esc(caixaAlta(String(valores.texto ?? '').trim()))}</div>`;
  return { fundo: '', html, css: '', animacoes: [] };
}
