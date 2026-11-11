// Palavra-conceito: uma palavra-chave sobre a cena. Quatro estilos: grifo (com subtítulo opcional),
// contorno, vazada na foto e letra a letra. Consulta 03/11: no grifo, o fundo revela a palavra como uma
// máscara (a palavra não aparece antes do fundo, Gian); o subtítulo entra depois que o grifo terminou
// (Luiza); no letra a letra, o texto menor também é revelado por máscara (Gian).
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, chapeu, empilhar, familia, fundo, papel, tratamentoDe } from '../componentes.js';

export const id = 'palavra_conceito';

export function montar({ valores: v, formato, tokens, recursos, duracao, destaque }) {
  const V = formato === '9x16';
  const palavra = String(v.palavra ?? '').trim();
  const sub = String(v.subtitulo ?? '').trim();
  const estilo = v.estilo ?? 'grifo';
  let partes;
  let trat = tratamentoDe(auto(v.tratamento) ?? (estilo === 'letra a letra' ? 'escuro' : estilo === 'contorno' ? 'véu' : 'desfoque'));
  if (estilo === 'contorno') {
    partes = [
      `<div class="a1" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 220 : 280 })};color:transparent;-webkit-text-stroke:4px #fff">${esc(caixaAlta(palavra))}</div>`,
      [chapeu(tokens, formato, sub, { variante: 'branco', classes: 'a2' }), 24],
    ];
  } else if (estilo === 'vazada na foto') {
    // A própria foto preenche as letras; em volta, fundo preto com grão (sem mídia, cinza).
    trat = 'grao';
    const m = recursos?.midias?.fundo ?? recursos?.midia;
    const preench = m?.url && m.tipo !== 'video' ? `background:url('${esc(m.url)}') center/cover` : 'background:linear-gradient(160deg,#ddd,#777)';
    partes = [
      `<div class="a1" data-m="escala" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 300 : 420 })};line-height:.9;${preench};-webkit-background-clip:text;background-clip:text;color:transparent">${esc(caixaAlta(palavra))}</div>`,
      [chapeu(tokens, formato, sub, { variante: 'destaque', classes: 'a2', destaque }), 24],
    ];
  } else if (estilo === 'letra a letra') {
    const letras = [...caixaAlta(palavra)].map((l) => `<span class="ln" style="display:inline-block">${l === ' ' ? '&nbsp;' : esc(l)}</span>`).join('');
    partes = [
      `<div class="a1" data-m="linhas" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 120 : 200 })};color:#fff;white-space:nowrap">${letras}</div>`,
      [sub ? `<div class="w2" data-atraso="0.5"><span class="hl-revela" style="${familia(tokens, 'manrope')};font-size:40px;line-height:1.4">${esc(sub)}</span></div>` : '', 32],
    ];
  } else {
    // Grifo: o fundo e a palavra entram juntos numa varredura (máscara que revela o texto).
    partes = [
      `<div class="w1"><span class="hl-revela" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 180 : 230 })};padding:12px 32px 4px;display:inline-block">${esc(caixaAlta(palavra))}</span></div>`,
      [sub ? `<div class="a3" data-atraso="0.6" style="${papel(tokens, 'apoio', formato, { tamanho: V ? 40 : 44 })};color:#fff;max-width:${V ? 860 : 1200}px">${esc(sub)}</div>` : '', 32],
    ];
  }
  const f = estilo === 'vazada na foto'
    ? { fundo: '', camadas: '<div class="grao" style="position:absolute;inset:0"></div>' }
    : fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao });
  return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar(partes) }) };
}

export const opaca = (v) => v.estilo === 'vazada na foto';

export const exemplos = {
  'Grifo + subtítulo': { palavra: 'Golpe', subtitulo: 'Tentativa de abolir o Estado democrático', fundo: { arquivo: 'exemplo-2' } },
  Contorno: { estilo: 'contorno', palavra: 'Golpe', subtitulo: 'Art. 359-M do Código Penal', fundo: { arquivo: 'exemplo-1' } },
  'Vazada na foto': { estilo: 'vazada na foto', palavra: 'Golpe', subtitulo: 'O que diz a lei', fundo: { arquivo: 'exemplo-textura' } },
  'Letra a letra': { estilo: 'letra a letra', palavra: 'Democracia', subtitulo: 'em risco', fundo: { arquivo: 'exemplo-3' } },
};
