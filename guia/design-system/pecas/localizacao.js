// Localização: pino + "cidade, estado" numa linha e a data (opcional) embaixo, alinhados pela mesma borda.
// Consulta 03/11: no máximo duas linhas (Luiza, Mauro) e entrada mais solta (Fernanda: "travada").
// v2: conecta fonte, caixa e ícone; não copia a tarja de pessoa.
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, empilhar, familia, variante } from '../componentes.js';

export const id = 'localizacao';

const PINO = '<svg width="26" height="34" viewBox="0 0 22 28" style="flex:none"><path d="M11 0C5 0 0 5 0 11c0 8 11 17 11 17s11-9 11-17C22 5 17 0 11 0z" fill="#000"/><circle cx="11" cy="11" r="4" fill="#fff"/></svg>';

export function montar({ valores: v, formato, tokens }) {
  const lugar = [v.cidade, v.estado].map((x) => String(x ?? '').trim()).filter(Boolean).join(', ');
  const ds = tokens.tipografia.chapeu_padrao;
  const p = variante(tokens, 'papel.chapeu');
  const linha1 = lugar
    ? `<span class="a1" style="display:inline-flex;align-items:center;gap:14px;${familia(tokens, 'tipo')};font-size:${p.tamanho[formato]}px;line-height:1;text-transform:uppercase;letter-spacing:${ds.espacamento_letras}em;padding:${ds.padding_vertical}px ${ds.padding_horizontal}px;background:#fff;color:#000;white-space:nowrap">${PINO}${esc(caixaAlta(lugar))}</span>`
    : '';
  const data = String(v.data ?? '').trim();
  const linha2 = data ? `<span class="a2" style="display:inline-block;background:#000;color:#fffc;${familia(tokens, 'manrope')};font-size:24px;line-height:1;padding:10px 15px;letter-spacing:.04em">${esc(caixaAlta(data))}</span>` : '';
  return { fundo: '', html: bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'topo esquerda', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([linha1, [linha2, 0]]) }) };
}

export const exemplos = {
  'Só cidade': { cidade: 'Belém' },
  'Cidade, estado': { cidade: 'Belém', estado: 'Pará' },
  'Cidade, estado + data': { cidade: 'Belém', estado: 'Pará', data: '02 nov 2026' },
};
