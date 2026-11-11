// Tarja de nome e cargo (identificação). Nome em caixa branca (TipoNinja, caixa alta), cargo ou @ em caixa
// preta (Manrope Medium), empilhadas e alinhadas pela mesma borda. v2: nome centralizado visualmente no box
// e posição com e sem legenda pela referência D4. Entra com varredura do lado em que está presa e sai
// fechando a varredura (animação existente). Consulta 03/11: opção de dissolve (Luiza) e sem caixa (Mauro).
import { caixaAlta, esc } from '../base.js';
import { familia, variante } from '../componentes.js';

export const id = 'tarja_nome';

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function montar({ valores: v, formato, tokens, destaque }) {
  const semCaixa = v.variacao === 'sem caixa';
  if (semCaixa) variante(tokens, 'identificacao.sem_caixa');
  const d4 = variante(tokens, 'identificacao.tarja');
  const direita = v.lado === 'direita';
  const a = tokens.area[formato];
  const base = tokens.quadro[formato].altura - (v.com_legenda ? d4.base_com_legenda[formato] : d4.base_sem_legenda[formato]);
  const dissolver = v.entrada === 'dissolver';
  const anim = (ordem) => (dissolver ? `class="a${ordem}" data-m="dissolver"` : `class="w${ordem}" data-saida="varredura"${direita ? ' data-de="direita"' : ''}`);
  const fio = v.variacao === 'fio de destaque' ? `;box-shadow:inset 0 -8px 0 ${destaque}` : '';
  const sombra = semCaixa ? `;text-shadow:${variante(tokens, 'sombra.texto').valor}` : '';

  const nomeTexto = esc(caixaAlta(String(v.nome ?? '').trim()));
  const nome = `<div id="t-nome" ${anim(1)} data-caixa data-pad="${d4.nome_padding[0]}" data-campo="nome" style="${familia(tokens, 'tipo')};font-size:${d4.nome_tamanho}px;line-height:1;padding:${d4.nome_padding[0]}px ${semCaixa ? 0 : d4.nome_padding[1]}px;${semCaixa ? 'color:#fff' : `background:${tokens.cores.branco};color:${tokens.cores.preto}`};white-space:nowrap${fio}${sombra}">${nomeTexto}</div>`;

  let segunda = '';
  const arroba = String(v.arroba ?? '').trim();
  const cargo = String(v.cargo ?? '').trim();
  if (arroba || cargo) {
    const texto = arroba ? (arroba.startsWith('@') ? arroba : `@${arroba}`) : cargo;
    const tam = arroba ? d4.arroba_tamanho : d4.funcao_tamanho;
    const caixaCss = semCaixa ? `color:#fff${sombra}` : `background:${tokens.cores.preto};color:${tokens.cores.branco}`;
    segunda = `<div id="t-cargo" ${anim(2)} data-caixa data-pad="${d4.funcao_padding[0]}" data-campo="${arroba ? 'arroba' : 'cargo'}" style="${familia(tokens, 'manrope')};font-size:${tam}px;line-height:1;${arroba ? '' : 'letter-spacing:.04em;text-transform:uppercase;'}padding:${d4.funcao_padding[0]}px ${semCaixa ? 0 : d4.funcao_padding[1]}px;${caixaCss};white-space:nowrap">${esc(texto)}</div>`;
  }

  const lado = direita ? `right:${a.direita}px;align-items:flex-end` : `left:${a.esquerda}px;align-items:flex-start`;
  const mover = num(v.deslocar_x) || num(v.deslocar_y) ? `;transform:translate(${num(v.deslocar_x)}px,${num(v.deslocar_y)}px)` : '';
  const html = `<div id="t-bloco" style="position:absolute;bottom:${base}px;${lado};display:flex;flex-direction:column${mover}">${nome}${segunda}</div>`;
  return { fundo: '', html };
}

export const exemplos = {
  'Nome + cargo': { nome: 'Bianca Borges', cargo: 'Presidente da UNE' },
  'Com legenda (D4)': { nome: 'Bianca Borges', cargo: 'Presidente da UNE', com_legenda: true },
  'Nome + @ (direita)': { nome: 'Erika Hilton', arroba: 'erikakhilton', lado: 'direita' },
  'Fio de destaque': { nome: 'Marina Silva', cargo: 'Ministra do Meio Ambiente', variacao: 'fio de destaque' },
  'Sem caixa, dissolve': { nome: 'Guilherme Boulos', cargo: 'Deputado federal', variacao: 'sem caixa', entrada: 'dissolver' },
};
