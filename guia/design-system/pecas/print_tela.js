// Print / gravação de tela: a captura fica no tamanho dela, com sombra, e o espaço em volta é preenchido
// pela própria imagem ampliada e desfocada. O trecho importante ganha grifo (preso às coordenadas da
// captura, v2/T11) e zoom opcional. Consulta 03/11: moldura padrão é o logo do site em cima do print, no
// lugar da barra do navegador (Luiza, Ana); navegador e celular continuam como opção.
import { esc } from '../base.js';
import { auto, bloco, empilhar, familia, funcao, midia, semPontoFinal } from '../componentes.js';
import { VEICULOS } from './manchete_veiculo.js';
import { areaDe } from './documento.js';

export const id = 'print_tela';

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const V = formato === '9x16';
  const moldura = v.moldura ?? 'logo do site';
  const cel = moldura === 'celular';
  const w = cel ? (V ? 560 : 440) : V ? 920 : 1200;
  const h = cel ? (V ? 1100 : 900) : V ? 720 : 760;
  const a = areaDe(v.area_grifo);
  const marca = a ? `<div class="hl-area" style="position:absolute;left:${a.x}%;top:${a.y}%;width:${a.largura}%;height:${a.altura}%;background:var(--d);mix-blend-mode:multiply"></div>` : '';
  const captura = midia(recursos, 'midia', { duracao, estilo: 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top', vazia: 'Print ou gravação de tela' });
  let topo = '';
  if (moldura === 'navegador') {
    topo = `<div style="height:64px;background:#f1f1f1;display:flex;align-items:center;gap:12px;padding:0 24px;border-bottom:1px solid #ddd"><span style="width:14px;height:14px;border-radius:50%;background:#ccc"></span><span style="width:14px;height:14px;border-radius:50%;background:#ccc"></span><span style="${familia(tokens, 'manrope')};font-size:22px;color:#666;margin-left:12px">${esc(v.endereco ?? '')}</span></div>`;
  } else if (moldura === 'logo do site') {
    const logo = v.logo_site && VEICULOS.includes(v.logo_site) ? recursos.ds(`marca/veiculos/${encodeURIComponent(v.logo_site)}.png`) : '';
    const conteudo = logo ? `<img src="${esc(logo)}" alt="${esc(v.logo_site)}" style="height:40px;max-width:60%;object-fit:contain">` : `<span style="${familia(tokens, 'manrope')};font-size:30px;color:#111">${esc(v.nome_site ?? '')}</span>`;
    topo = `<div style="height:88px;background:#fff;display:flex;align-items:center;padding:0 36px;border-bottom:1px solid #e5e5e5">${conteudo}</div>`;
  }
  const alturaTopo = moldura === 'navegador' ? 64 : moldura === 'logo do site' ? 88 : 0;
  const zoom = v.zoom && a ? ` data-zoom="1.3" data-zoom-origem="${a.x + a.largura / 2}% ${a.y + a.altura / 2}%"` : '';
  const caixa = `<div class="a1 sombra" data-m="escala"${zoom} style="position:relative;width:${w}px;height:${h}px;background:#fff;overflow:hidden;border-radius:${cel ? 56 : 12}px;${cel ? 'border:18px solid #111' : ''}">${topo}<div style="position:absolute;left:0;right:0;top:${alturaTopo}px;bottom:0;overflow:hidden">${captura}${marca}</div></div>`;
  // Entorno: a própria captura ampliada e desfocada (sem vazio de navegador, em qualquer proporção).
  const entorno = `<div style="position:absolute;inset:0;background:#111;overflow:hidden"><div style="position:absolute;inset:-10%;filter:blur(14px) brightness(.45);transform:scale(1.6)">${midia(recursos, 'midia', { estilo: 'position:absolute;inset:0;width:100%;height:100%' })}</div></div>`;
  const credito = funcao(tokens, semPontoFinal(v.credito), { classes: 'a2' });
  return { fundo: '', html: entorno + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([caixa, [credito, 24]]) }) };
}

export const opaca = () => true;

export const exemplos = {
  'Logo do site': { moldura: 'logo do site', logo_site: 'Agência Brasil', midia: { arquivo: 'exemplo-print' }, area_grifo: '6 8 70 12', credito: 'Reprodução: Agência Brasil' },
  'Navegador + zoom no trecho': { moldura: 'navegador', endereco: 'gov.br/noticias/2026/11', midia: { arquivo: 'exemplo-print' }, area_grifo: '6 8 70 12', zoom: true, credito: 'Reprodução: gov.br' },
  'Celular': { moldura: 'celular', midia: { arquivo: 'exemplo-3' }, credito: 'Vídeo: reprodução Instagram' },
};
