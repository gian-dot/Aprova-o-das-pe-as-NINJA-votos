// Chamada central: o modelo de vídeo do Canva (Thiago), modular. Só chapéu (opcional) e chamada, cada um
// com posição própria; crédito, logo e faixa de marcas são peças separadas (Gian, 02/11).
// v2: chapéu branco ou na cor de destaque (D1), encaixe de notícia completo, degradê medido pela
// geometria final (D5), véu 55% ou desfoque 24 px + véu 35% (D6), perfil horizontal próprio (D2).
import { caixaAlta } from '../base.js';
import { auto, bloco, chapeu, fundo, papel, pintar, semPontoFinal, tratamentoDe, variante } from '../componentes.js';

export const id = 'chamada_central';
export const apelidos = ['manchete_central'];

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function montar({ valores: v, formato, tokens, recursos, duracao, destaque }) {
  const trat = tratamentoDe(auto(v.tratamento) ?? 'degradê');
  const posicao = String(v.posicao_bloco ?? 'automática');
  const centro = posicao === 'centro' || (posicao !== 'base' && (trat === 'veu' || trat === 'desfoque'));
  const presente = String(v.entrada ?? '').startsWith('já');
  const anim = (classe) => (presente ? 'data-m="presente"' : `class="${classe}"`);

  const nomeChapeu = v.modo === 'ao vivo' ? 'ao_vivo' : v.cor_chapeu === 'destaque' ? 'destaque' : 'branco';
  const ch = chapeu(tokens, formato, v.chapeu, {
    variante: nomeChapeu, id: 'm-chapeu', destaque,
    estilo: num(v.deslocar_chapeu_y) ? `transform:translateY(${num(v.deslocar_chapeu_y)}px)` : '',
    atributos: presente ? 'data-m="presente"' : '', classes: presente ? '' : 'w1',
  });

  const a = tokens.area[formato];
  const p = variante(tokens, 'papel.chamada');
  const larguraArea = tokens.quadro[formato].largura - a.esquerda - a.direita;
  const largura = Math.min(p.largura_max?.[formato] ?? Infinity, larguraArea);
  const enc = tokens.v2.encaixe_noticia;
  const reels = formato === '9x16';
  const encaixe = {
    largura,
    // 200 px de folga para o chapéu e o respiro até a borda da área.
    altura: tokens.quadro[formato].altura - a.topo - a.base - 200,
    tamanhoInicial: p.tamanho[formato],
    minimo: reels ? enc.reels_minimo_habitual_px : 0,
    maximo: reels ? enc.reels_maximo_habitual_px : 10000,
    linhasPreferidas: enc.linhas_preferidas,
    reducao: enc.reducao_primeira_tentativa,
  };
  const texto = semPontoFinal(caixaAlta(v.chamada ?? v.manchete ?? ''));
  const chamada = `<div id="m-chamada" ${anim('a2')} data-campo="chamada" data-encaixe='${JSON.stringify(encaixe).replace(/'/g, '&#39;')}' style="${ch ? `margin-top:${tokens.espacamentos.chapeu_chamada}px;` : ''}${papel(tokens, 'chamada', formato)};letter-spacing:${tokens.tipografia.chamada_padrao.espacamento_letras}em;color:${tokens.cores.branco};max-width:${largura}px">${pintar(texto, caixaAlta(v.palavra_destaque ?? ''))}</div>`;

  const conjunto = bloco(tokens, formato, {
    id: 'm-bloco', posicao: centro ? 'centro' : 'base centro', dx: v.deslocar_x, dy: v.deslocar_y,
    html: `<div style="display:flex;flex-direction:column;align-items:center">${ch}${chamada}</div>`,
  });
  // Âncora do degradê: o chapéu; sem chapéu, o topo da chamada (alternativa declarada, como na thumbnail).
  const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao, ancoras: ['#m-chapeu', '#m-chamada'] });
  // Consulta (Ana, 03/11): o fundo sai junto com o texto.
  return { fundo: f.fundo, html: f.camadas + conjunto, raiz: { 'fundo-junto': '' } };
}

export const exemplos = {
  'Degradê (chapéu branco)': { chapeu: 'Brasil com S', chamada: 'Estudantes ocupam as ruas de São Paulo contra o corte na educação', palavra_destaque: 'ruas', tratamento: 'degradê', fundo: { arquivo: 'exemplo-1' } },
  'Véu 55% (chapéu destaque)': { chapeu: 'Eleições 2026', cor_chapeu: 'destaque', chamada: 'O que muda no segundo turno', tratamento: 'véu 55%', fundo: { arquivo: 'exemplo-2' } },
  'Desfoque + véu': { chamada: 'Quem pagou o jato do filho do ex-presidente?', palavra_destaque: 'jato', tratamento: 'desfoque + véu 35%', fundo: { arquivo: 'exemplo-3' } },
};
