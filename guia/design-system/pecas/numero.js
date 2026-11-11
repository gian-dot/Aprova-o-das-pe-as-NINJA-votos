// Número em destaque: gigante com contagem, comparação de dois números com o momento da troca escolhido
// pela editora, ou sobre a foto no canto. v2: conecta tipografia e contexto; preserva dado, unidade,
// contagem e destaque. Consulta 03/11: todos os textos do modelo e o tempo da troca são campos (Gian);
// % e º vêm da fonte de apoio, porque a TipoNinja não tem esses sinais (Luiza).
import { esc } from '../base.js';
import { auto, bloco, chapeu, empilhar, familia, fundo, funcao, linhasDe, papel, tratamentoDe } from '../componentes.js';

export const id = 'numero';

// "2,3" → { valor: 2.3, casas: 1 }; "10.376.694" → { valor: 10376694, casas: 0 }. Texto que não é número
// (ex.: "1º") fica sem contagem.
export function lerNumero(texto) {
  const t = String(texto ?? '').trim();
  if (!/^[−-]?\d{1,3}(\.\d{3})*(,\d+)?$|^[−-]?\d+(,\d+)?$/.test(t)) return null;
  const casas = t.includes(',') ? t.split(',')[1].length : 0;
  return { valor: Number(t.replace(/\./g, '').replace(',', '.').replace('−', '-')), casas };
}

function numeroHtml(texto) {
  const n = lerNumero(texto);
  return n ? `<span data-v="${n.valor}" data-casas="${n.casas}">${esc(texto)}</span>` : esc(texto);
}

export function montar({ valores: v, formato, tokens, recursos, duracao, destaque }) {
  const V = formato === '9x16';
  const versao = v.versao ?? 'gigante';
  const unidade = String(v.unidade ?? '').trim();
  const fonte = String(v.fonte ?? '').trim() ? funcao(tokens, v.fonte, { classes: 'a3' }) : '';
  const conta = (texto) => (lerNumero(texto) ? 'data-m="contar"' : 'data-m="escala"');
  let partes;
  let trat = tratamentoDe(auto(v.tratamento) ?? (versao === 'sobre a foto' ? 'degradê' : 'escuro'));
  if (versao === 'comparação') {
    const lado = (rot, num, n, cor) => `<div class="lado${n}"><div style="${papel(tokens, 'chapeu', formato, { tamanho: 64 })};color:${cor}">${esc(rot)}</div><div class="tsombra" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 190 : 220 })};line-height:.85;color:${cor}">${esc(num)}${unidade ? `<span style="${familia(tokens, 'manrope')};font-size:.26em"> ${esc(unidade)}</span>` : ''}</div></div>`;
    const troca = Number(v.troca_em) > 0 ? `data-troca-em="${Number(v.troca_em)}"` : 'data-troca="1.4"';
    partes = [
      chapeu(tokens, formato, v.titulo, { variante: 'branco', classes: 'a1' }),
      [`<div class="a2" ${troca}><div style="display:flex;gap:${V ? 48 : 120}px;align-items:flex-end;${V ? 'flex-direction:column;align-items:center' : ''}">${lado(v.rotulo1, v.numero1, 1, '#fff')}${lado(v.rotulo2, v.numero2, 2, 'var(--d)')}</div></div>`, 48],
      [chapeu(tokens, formato, v.variacao, { variante: 'destaque', classes: 'a3', destaque }), 32],
      [fonte.replace('class="a3"', 'class="a4"'), 24],
    ];
  } else if (versao === 'sobre a foto') {
    partes = [
      `<div class="a1 tsombra" ${conta(v.numero)} style="${papel(tokens, 'titulo', formato, { tamanho: V ? 200 : 240 })};line-height:.85;color:#fff">${numeroHtml(v.numero)}${unidade ? ` <span style="${familia(tokens, 'manrope')};font-size:.3em">${esc(unidade)}</span>` : ''}</div>`,
      [chapeu(tokens, formato, v.frase, { variante: 'destaque', classes: 'a2', destaque }), 24],
      [fonte, 24],
    ];
  } else {
    const frase = linhasDe(v.frase).map((l) => `<span class="ln">${esc(l)}</span>`).join('');
    partes = [
      `<div class="a1 tsombra" ${conta(v.numero)} style="${papel(tokens, 'titulo', formato, { tamanho: V ? 360 : 420 })};line-height:.85;color:var(--d)">${numeroHtml(v.numero)}${unidade ? `<span style="font-size:.5em">${esc(unidade)}</span>` : ''}</div>`,
      [frase ? `<div class="a2" data-m="linhas" style="${papel(tokens, 'apoio', formato, { tamanho: V ? 48 : 56, entrelinha: 1.25 })};color:#fff">${frase}</div>` : '', 48],
      [fonte, 32],
    ];
  }
  const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao, ancoras: ['.a1'] });
  const posicao = auto(v.posicao) ?? (versao === 'sobre a foto' ? 'base esquerda' : 'centro');
  return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao, dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar(partes) }) };
}

export const exemplos = {
  'Gigante (contagem)': { numero: '33', unidade: '%', frase: 'dos lares brasileiros vivem\ncom insegurança alimentar', fonte: 'Fonte: IBGE · PNAD 2025', fundo: { arquivo: 'exemplo-3' } },
  'Comparação com troca': { versao: 'comparação', titulo: 'Desmatamento na Amazônia', rotulo1: '2022', numero1: '11,6', rotulo2: '2025', numero2: '5,8', unidade: 'mil km²', variacao: '−50%', troca_em: 2.2, fundo: { arquivo: 'exemplo-1' } },
  'Sobre a foto': { versao: 'sobre a foto', numero: '2,3', unidade: 'mil hectares', frase: 'queimados em 48 horas', tratamento: 'degradê', fundo: { arquivo: 'exemplo-3' } },
  'Com º (fonte de apoio)': { numero: '2º', frase: 'turno no dia 25', fonte: 'Fonte: TSE', fundo: { arquivo: 'exemplo-2' } },
};
