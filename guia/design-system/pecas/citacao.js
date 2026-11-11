// Citação: com foto (fala em faixas brancas, D8, e identificação embaixo), fragmento que entra palavra a
// palavra e citação-documento (papel). v2: compartilha caixa e identificação; preserva citação e autoria;
// não impõe a política de quatro linhas da notícia. Consulta 03/11: "legenda de terceiro" saiu e a
// citação-documento ganhou grifo (Luiza).
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, caixa, cartao, chapeu, empilhar, fundo, funcao, grifar, linhasDe, papel, pintar, tratamentoDe, trechosDe } from '../componentes.js';

export const id = 'citacao';

const aspas = (t) => {
  const s = String(t ?? '').trim();
  return s && !/^[“"]/.test(s) ? `“${s}”` : s;
};

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const V = formato === '9x16';
  const estilo = v.estilo ?? 'com foto';
  const quem = [v.autor, v.cargo, v.data].map((x) => String(x ?? '').trim()).filter(Boolean).join(' · ');
  let partes;
  let trat;
  let posicao;
  if (estilo === 'fragmento') {
    trat = tratamentoDe(auto(v.tratamento) ?? 'escuro');
    const palavras = aspas(caixaAlta(v.frase)).split(/\s+/).filter(Boolean);
    const destaque = trechosDe(caixaAlta(v.palavras_destaque ?? ''));
    const html = palavras.map((w) => `<span class="ln" style="display:inline-block;margin:0 .14em">${destaque.some((d) => w.replace(/[“”".,!?]/g, '') === d) ? pintar(w, w.replace(/[“”".,!?]/g, '')) : esc(w)}</span>`).join('');
    partes = [`<div class="a1" data-m="linhas" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 130 : 180, entrelinha: 1.05 })};color:#fff;max-width:${V ? 940 : 1700}px">${html}</div>`, [chapeu(tokens, formato, quem, { variante: 'branco', classes: 'a2' }), 32]];
    posicao = 'centro';
  } else if (estilo === 'documento') {
    trat = tratamentoDe(auto(v.tratamento) ?? 'véu');
    const texto = grifar(aspas(v.frase), trechosDe(v.grifos));
    const corpo = `<div data-ajustar="${V ? 900 : 520}" data-minimo="28" style="font:italic 500 ${V ? 42 : 46}px/1.45 Georgia,serif;color:#111">${texto}</div><div style="margin-top:32px">${funcao(tokens, quem)}</div>`;
    partes = [`<div class="a1 sombra" data-m="escala" style="rotate:-1deg">${cartao(tokens, 'papel', corpo, { largura: V ? 900 : 1100, estilo: 'padding:56px' })}</div>`];
    posicao = 'centro';
  } else {
    trat = tratamentoDe(auto(v.tratamento) ?? 'degradê');
    const linhas = linhasDe(aspas(caixaAlta(v.frase))).map((l) => grifar(l, trechosDe(caixaAlta(v.palavras_destaque ?? '')), 'dt'));
    const fala = caixa(tokens, formato, linhas, { variante: 'faixas', papel: 'titulo_tarja', fundo: '#fff', corTexto: '#000', alinhar: 'left', classes: 'a1', tamanho: V ? 68 : 76 });
    partes = [fala, [funcao(tokens, quem, { classes: 'w2' }), 0]];
    posicao = V ? 'centro' : 'base esquerda';
  }
  const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao, id: 'foto', ancoras: ['.a1'] });
  return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? posicao, dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar(partes) }) };
}

export const exemplos = {
  'Com foto': { estilo: 'com foto', frase: 'Não vamos aceitar\nretrocesso', autor: 'Marina Silva', cargo: 'Ministra do Meio Ambiente', foto: { arquivo: 'exemplo-pessoa' } },
  'Fragmento palavra a palavra': { estilo: 'fragmento', frase: 'Uma ameaça à democracia', palavras_destaque: 'ameaça', autor: 'Ministro do STF', data: '02/11', foto: { arquivo: 'exemplo-2' } },
  'Documento com grifo': { estilo: 'documento', frase: 'Não desejamos ocupá-lo, mas não podemos vê-lo ocupado por nossos inimigos', grifos: 'ocupado por nossos inimigos', autor: 'Memorando', data: '1907', foto: { arquivo: 'exemplo-3' } },
};
