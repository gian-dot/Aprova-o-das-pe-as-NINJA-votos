// Manchete de outro veículo: cartão com o logo do veículo, o título real (e o lead, opcional) e trechos
// grifados em sequência depois que o texto aparece. v2: compartilha cartão, recurso e grifo; conserva a
// identidade e os metadados do veículo. Consulta 03/11: cascata saiu (Gian, Ana); cartão maior no 16x9 e
// título que se ajusta para caber uma manchete real (Gian, Luiza); logo menor que o título (Luiza, Mauro);
// grifo mais lento (Luiza).
import { esc } from '../base.js';
import { auto, bloco, cartao, familia, fundo, grifar, semPontoFinal, tratamentoDe, trechosDe } from '../componentes.js';

export const id = 'manchete_veiculo';

export const VEICULOS = ['Agência Brasil', 'Brasil de Fato', 'Carta Capital', 'CNN', 'Correio Braziliense', 'Estadão', 'Folha de S. Paulo', 'Fórum', 'G1', 'ICL', 'Metrópoles', 'O Globo', 'UOL', 'Veja'];

// Largura do cartão por formato; o título diminui (até o mínimo) para caber na altura máxima.
const CARTAO = {
  compacto: { '16x9': [900, 46, 360], '9x16': [800, 46, 520] },
  médio: { '16x9': [1400, 64, 520], '9x16': [940, 58, 760] },
  largo: { '16x9': [1800, 72, 600], '9x16': [940, 64, 900] },
};

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const tam = CARTAO[v.largura] ? v.largura : 'médio';
  const [largura, fonteTitulo, alturaMax] = CARTAO[tam][formato];
  const trechos = trechosDe(v.grifos);
  const logo = recursos?.midias?.logo?.url ?? (VEICULOS.includes(v.veiculo) ? recursos.ds(`marca/veiculos/${encodeURIComponent(v.veiculo)}.png`) : '');
  const alturaLogo = Math.round(fonteTitulo * 0.62);
  const cab = logo ? `<img src="${esc(logo)}" alt="${esc(v.veiculo ?? '')}" style="height:${alturaLogo}px;max-width:${Math.round(largura * 0.4)}px;object-fit:contain;object-position:left;display:block">` : '';
  const titulo = `<div data-ajustar="${alturaMax}" data-minimo="${Math.round(fonteTitulo * 0.6)}" style="${familia(tokens, 'manrope')};font-size:${fonteTitulo}px;line-height:1.18;color:#111;margin-top:${logo ? 28 : 0}px">${grifar(semPontoFinal(v.titulo), trechos)}</div>`;
  const lead = String(v.lead ?? '').trim()
    ? `<div style="${familia(tokens, 'manrope')};font-size:${Math.round(fonteTitulo * 0.56)}px;line-height:1.4;color:#555;margin-top:20px">${grifar(semPontoFinal(v.lead), trechos)}</div>`
    : '';
  const data = String(v.data ?? '').trim()
    ? `<div style="${familia(tokens, 'manrope')};font-size:22px;color:#fffc;text-align:right;margin-top:14px;letter-spacing:.04em;width:${largura}px">${esc(v.data)}</div>`
    : '';
  const corpo = `<div class="a1 sombra" data-m="escala" style="width:${largura}px">${cartao(tokens, 'branco', cab + titulo + lead, { largura, estilo: tam === 'compacto' ? 'padding:28px 32px' : '' })}</div>${data}`;
  const posicao = auto(v.posicao) ?? (tam === 'compacto' ? (formato === '9x16' ? 'topo esquerda' : 'base esquerda') : 'centro');
  const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(auto(v.tratamento) ?? 'desfoque'), foco: v.foco, duracao });
  return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao, dx: v.deslocar_x, dy: v.deslocar_y, html: corpo }), raiz: { grifo: 0.9 } };
}

export const exemplos = {
  'Cartão médio': { veiculo: 'Folha de S. Paulo', titulo: 'Governo anuncia novo plano contra a fome e amplia o Bolsa Família', grifos: 'novo plano; amplia', data: '02/11/2026', fundo: { arquivo: 'exemplo-2' } },
  'Manchete + lead': { veiculo: 'G1', titulo: 'PF abre inquérito sobre conta usada para pagar jato', lead: 'Investigação apura se valores vieram de empresa ligada ao gabinete; defesa nega irregularidades', grifos: 'conta usada; empresa ligada', data: '02/11/2026', fundo: { arquivo: 'exemplo-1' } },
  'Largo, manchete longa': { veiculo: 'Estadão', largura: 'largo', titulo: 'Governo anuncia novo plano nacional de combate à fome, amplia o Bolsa Família e cria auxílio para famílias com crianças pequenas em 2027', grifos: 'novo plano nacional; cria auxílio', data: '02/11/2026', fundo: { arquivo: 'exemplo-3' } },
  'Compacto no canto': { veiculo: 'UOL', largura: 'compacto', titulo: 'Câmara adia votação do marco temporal', grifos: 'adia votação', data: '02/11/2026', tratamento: 'sem tratamento', fundo: { arquivo: 'exemplo-3' } },
};
