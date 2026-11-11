// Documento com grifo: o texto do documento entra por linha e os grifos vêm depois (um ou vários). Opcional:
// o trecho grifado vem para a frente e cresce enquanto o resto desfoca. Página sobre fundo preto ou
// flutuante sobre o vídeo, com identificação oficial opcional. Também aceita a foto do documento, com a
// marca presa às coordenadas da imagem (v2: grifo em captura acompanha o recurso, T11).
// Consulta 03/11: pilha com datas saiu (Gian); o texto diminui para caber quando é longo (Luiza).
import { esc } from '../base.js';
import { auto, bloco, cartao, chapeu, empilhar, familia, fundo, grifar, linhasDe, midia, temMidia, tratamentoDe, trechosDe } from '../componentes.js';

export const id = 'documento';

// "10 40 35 8" → { x, y, largura, altura } em % da imagem.
export function areaDe(texto) {
  const n = String(texto ?? '').split(/[\s,;]+/).map(Number).filter(Number.isFinite);
  return n.length === 4 ? { x: n[0], y: n[1], largura: n[2], altura: n[3] } : null;
}

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const V = formato === '9x16';
  const flutuante = v.moldura === 'flutuante';
  const destacar = Boolean(v.destacar_grifo);
  const trechos = trechosDe(v.grifos);
  const largura = V ? 940 : flutuante ? 1180 : 1300;
  const oficial = String(v.identificacao ?? '').trim();
  const cab = oficial
    ? `<div style="display:flex;align-items:center;gap:16px;margin-bottom:32px"><div style="width:64px;height:64px;border-radius:50%;border:4px solid #1b5e20;display:flex;align-items:center;justify-content:center;${familia(tokens, 'manrope')};font-size:18px;color:#1b5e20">GOV</div><div style="${familia(tokens, 'manrope')};font-size:22px;line-height:1.2;color:#333;letter-spacing:.06em;text-transform:uppercase">${oficial.split('|').map((x) => esc(x.trim())).join('<br>')}</div></div>`
    : '';
  let corpo;
  if (temMidia(recursos, 'imagem')) {
    const a = areaDe(v.area_grifo);
    const marca = a ? `<div class="hl-area" style="position:absolute;left:${a.x}%;top:${a.y}%;width:${a.largura}%;height:${a.altura}%;background:var(--d);mix-blend-mode:multiply"></div>` : '';
    corpo = `<div class="a2" style="position:relative">${midia(recursos, 'imagem', { estilo: 'display:block;width:100%;height:auto;object-fit:contain' })}${marca}</div>`;
  } else {
    const max = V ? 900 : 560;
    const ls = linhasDe(v.texto).map((l) => {
      const tem = trechos.some((t) => l.toLocaleLowerCase('pt-BR').includes(t.toLocaleLowerCase('pt-BR')));
      return `<span class="ln ${destacar ? (tem ? 'foco' : 'desfoca') : ''}" style="transform-origin:0 50%">${grifar(l, trechos)}</span>`;
    }).join('');
    corpo = `<div class="a2" data-m="linhas" data-ajustar="${max}" data-minimo="26" style="font:500 ${V ? 40 : 46}px/1.6 Georgia,serif;color:#222">${ls}</div>`;
  }
  const pagina = `<div class="a1 sombra" data-m="escala">${cartao(tokens, 'papel', cab + corpo, { largura, estilo: V ? 'padding:48px' : '' })}</div>`;
  const rotulo = chapeu(tokens, formato, v.rotulo, { variante: 'branco', classes: 'a3' });
  const trat = flutuante ? tratamentoDe(auto(v.tratamento) ?? 'desfoque') : 'grao';
  const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao });
  return { fundo: flutuante ? f.fundo : '', html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([pagina, [rotulo, 24]]) }) };
}

export const opaca = (v) => v.moldura !== 'flutuante';

const TEXTO = 'O investigado mantinha relação com a\nempresa desde 2019, quando passou a\nreceber valores mensais por meio de\nconta registrada em nome de terceiros,\nconforme relatório da Receita Federal\nanexado ao inquérito em março.';
export const exemplos = {
  'Página: linhas + grifos': { texto: TEXTO, grifos: 'valores mensais; Receita Federal', rotulo: 'Inquérito 4.781 · STF' },
  'Página: grifo em destaque': { texto: TEXTO, grifos: 'valores mensais; Receita Federal', destacar_grifo: true, rotulo: 'Inquérito 4.781 · STF' },
  'Flutuante + identificação oficial': { moldura: 'flutuante', identificacao: 'Ministério da Justiça | Polícia Federal', texto: TEXTO, grifos: 'valores mensais', rotulo: 'Relatório da PF · p. 14', fundo: { arquivo: 'exemplo-2' } },
};
