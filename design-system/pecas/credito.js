// Crédito: vertical na borda direita (padrão do Canva) ou mini no topo (padrão de 9 em 16 referências).
import { caixaAlta, esc, fonte } from '../base.js';

export const id = 'credito';

const POSICAO = {
  vertical: {
    '16x9': 'right:96px;bottom:96px',
    '9x16': 'left:900px;bottom:672px',
  },
  mini: {
    '16x9': 'left:128px;top:64px',
    '9x16': 'left:96px;top:200px',
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
  const a = tokens.animacao;
  const animacoes = [{ alvo: '#c-texto', de: { opacity: 0 }, para: { opacity: 1 }, em: a.atraso, duracao: a.entrada, ease: a.ease_entrada }];
  return { fundo: '', html, css: '', animacoes };
}
