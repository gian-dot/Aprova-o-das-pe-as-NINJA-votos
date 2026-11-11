// Crédito: vertical na borda direita (padrão do Canva) ou mini no topo (padrão de 9 em 16 referências).
// Pequeno, colado nas bordas e sem animação: entra e sai com o corte da imagem (Gian, 02/11). A posição de
// borda é a exceção explícita que a v2 permite ao crédito (D3).
import { caixaAlta, esc } from '../base.js';
import { familia, semPontoFinal, variante } from '../componentes.js';

export const id = 'credito';

const POSICAO = {
  vertical: { '16x9': 'right:24px;bottom:60px', '9x16': 'right:20px;bottom:240px' },
  mini: { '16x9': 'left:60px;top:32px', '9x16': 'left:70px;top:240px' },
};

export function montar({ valores: v, formato, tokens }) {
  const mini = String(v.posicao ?? '').startsWith('mini');
  const tamanho = mini ? variante(tokens, 'papel.mini').tamanho[formato] - 2 : variante(tokens, 'credito.borda').tamanho[formato];
  const lugar = POSICAO[mini ? 'mini' : 'vertical'][formato];
  // Vertical: lê de baixo para cima, como o crédito de foto do Canva.
  const giro = mini ? '' : ';writing-mode:vertical-rl;transform:rotate(180deg)';
  const html = `<div id="c-texto" data-m="fixo" data-campo="texto" style="position:absolute;${lugar};${familia(tokens, 'manrope')};font-size:${tamanho}px;line-height:1;letter-spacing:.06em;color:${tokens.cores.credito};white-space:nowrap${giro}">${esc(semPontoFinal(caixaAlta(String(v.texto ?? '').trim())))}</div>`;
  return { fundo: '', html };
}

export const exemplos = {
  'Vertical na borda': { texto: 'Foto: Mídia NINJA' },
  'Mini no topo': { texto: 'Reprodução: YouTube / G1', posicao: 'mini no topo' },
};
