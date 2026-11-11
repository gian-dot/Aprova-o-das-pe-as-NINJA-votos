// Marcador de capítulo: tela de capítulo (número grande, chapéu e título) ou etiqueta permanente no canto
// enquanto o bloco dura. Sombra opcional pela regra geral de sombra. Aprovado na consulta (4 de 5).
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, chapeu, empilhar, fundo, linhasDe, papel, tratamentoDe } from '../componentes.js';

export const id = 'capitulo';

export function montar({ valores: v, formato, tokens, recursos, duracao, destaque }) {
  const V = formato === '9x16';
  const cru = String(v.numero ?? '').trim();
  const numero = esc(cru);
  const sombra = v.sombra ? 'sombra' : '';
  if (v.versao === 'etiqueta permanente') {
    const t = String(v.titulo ?? '').replace(/\s*\n\s*/g, ' ');
    const etiqueta = `<div class="w1 ${sombra}" style="display:flex">${chapeu(tokens, formato, cru, { variante: 'destaque', destaque })}${chapeu(tokens, formato, t, { variante: 'branco' })}</div>`;
    const f = fundo(tokens, formato, recursos, { tratamento: 'nenhum', foco: v.foco, duracao });
    return { fundo: f.fundo, html: bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'topo esquerda', dx: v.deslocar_x, dy: v.deslocar_y, html: etiqueta }) };
  }
  const n = numero ? `<div class="a1 ${v.sombra ? 'tsombra' : ''}" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 240 : 280 })};line-height:.8;color:var(--d)">${numero}</div>` : '';
  const ch = chapeu(tokens, formato, v.chapeu, { variante: 'branco', classes: `a2 ${sombra}` });
  const linhas = linhasDe(caixaAlta(v.titulo ?? '')).map((l) => `<span class="ln">${esc(l)}</span>`).join('');
  const titulo = linhas ? `<div class="a3 ${v.sombra ? 'tsombra' : ''}" data-m="linhas" style="${papel(tokens, 'titulo', formato, { tamanho: V ? 96 : 112 })};color:#fff">${linhas}</div>` : '';
  const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(auto(v.tratamento) ?? 'desfoque'), foco: v.foco, duracao });
  const html = bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'base esquerda', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([n, [ch, 32], [titulo, 20]]) });
  return { fundo: f.fundo, html: f.camadas + html };
}

export const exemplos = {
  Tela: { numero: '01', chapeu: 'Capítulo um', titulo: 'O que aconteceu\nna madrugada', fundo: { arquivo: 'exemplo-3' } },
  'Etiqueta permanente': { versao: 'etiqueta permanente', numero: '01', titulo: 'O que aconteceu', fundo: { arquivo: 'exemplo-1' } },
  'Etiqueta com sombra': { versao: 'etiqueta permanente', numero: '02', titulo: 'A investigação', sombra: true, fundo: { arquivo: 'exemplo-2' } },
};
