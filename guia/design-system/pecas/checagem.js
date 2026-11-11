// Selo de checagem: a frase entra e é lida; se for falsa, o risco se desenha; por último o carimbo bate (com
// textura de tinta) e assenta. Vermelho e verde são cores com significado (legado preservado, v2);
// amarelo (destaque) para enganoso, branco para sem provas. Aprovado na consulta (4 de 5).
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, empilhar, familia, fundo, funcao, grifar, semPontoFinal, tratamentoDe } from '../componentes.js';

export const id = 'checagem';

const COR = { falso: '#E8202A', enganoso: 'var(--d)', 'sem provas': '#FFFFFF', verdadeiro: 'verdadeiro' };
const TINTA = '<svg width="0" height="0" style="position:absolute"><filter id="tinta"><feTurbulence baseFrequency="0.9" numOctaves="2" result="t"/><feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.4" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></svg>';

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const V = formato === '9x16';
  const veredito = String(v.veredito ?? 'falso').toLowerCase();
  const cor = COR[veredito] === 'verdadeiro' ? tokens.cores.verdadeiro : COR[veredito] ?? COR.falso;
  const rotulo = veredito === 'verdadeiro' ? 'Verdade' : v.veredito ?? 'Falso';
  const riscar = v.riscar ?? veredito === 'falso';
  const t = familia(tokens, 'tipo');
  const carimbo = `<span style="display:inline-block;border:10px solid ${cor};color:${cor};${t};font-size:${V ? 120 : 150}px;line-height:1;text-transform:uppercase;padding:16px 44px 4px;filter:url(#tinta)">${esc(caixaAlta(rotulo))}</span>`;
  const frase = semPontoFinal(v.frase);
  let partes;
  if (v.versao === 'sobre o post') {
    const texto = riscar ? grifar(frase, v.trecho_riscado || frase, 'rsc') : esc(frase);
    const post = `<div class="sombra" style="background:#fff;border-radius:24px;padding:48px;width:${V ? 900 : 1100}px;text-align:left;${familia(tokens, 'manrope')};font-size:${V ? 50 : 56}px;line-height:1.3;color:#111"><div style="font-size:.7em;color:#536471">${esc(v.autor ?? '')}</div>${texto}</div>`;
    partes = [`<div style="position:relative">${`<div class="a1" data-m="escala"${riscar ? ' data-risco="1"' : ''}>${post}</div>`}<div class="a2" data-m="carimbo" style="position:absolute;right:${V ? -20 : -80}px;top:${V ? -120 : -110}px">${carimbo}</div></div>`];
  } else {
    partes = [
      `<div class="a1"${riscar ? ' data-risco="1"' : ''} style="${t};font-size:${V ? 76 : 88}px;line-height:1.05;text-transform:uppercase;color:#fff;max-width:${V ? 940 : 1400}px"><span class="${riscar ? 'rsc' : ''}">“${esc(caixaAlta(frase))}”</span></div>`,
      [`<div class="a3" data-m="carimbo">${carimbo}</div>`, 48],
      [funcao(tokens, v.fonte, { classes: 'a4' }), 32],
    ];
  }
  const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(auto(v.tratamento) ?? (v.versao === 'sobre o post' ? 'fundo preto com grão' : 'desfoque')), foco: v.foco, duracao });
  return { fundo: f.fundo, html: TINTA + f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar(partes) }) };
}

export const opaca = (v) => tratamentoDe(auto(v.tratamento) ?? (v.versao === 'sobre o post' ? 'fundo preto com grão' : 'desfoque')) === 'grao';

export const exemplos = {
  Falso: { veredito: 'Falso', frase: 'A urna eletrônica foi fraudada em 2022', fonte: 'Checagem NINJA · fonte: TSE', fundo: { arquivo: 'exemplo-2' } },
  Enganoso: { veredito: 'Enganoso', frase: 'O governo cortou o Bolsa Família', fonte: 'Checagem NINJA · fonte: MDS', fundo: { arquivo: 'exemplo-2' } },
  'Sem provas': { veredito: 'Sem provas', frase: 'Ministro recebeu propina de empresa chinesa', fundo: { arquivo: 'exemplo-2' } },
  Verdadeiro: { veredito: 'Verdadeiro', frase: 'O salário mínimo subiu acima da inflação', fonte: 'Checagem NINJA · fonte: IBGE', fundo: { arquivo: 'exemplo-2' } },
  'Sobre o post': { versao: 'sobre o post', veredito: 'Falso', autor: '@perfilfalso · 1 nov', frase: 'As urnas foram fraudadas, temos provas!', trecho_riscado: 'fraudadas' },
};
