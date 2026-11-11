// Linha do tempo: um sistema. A editora digita os marcos (ano | título | texto), escolhe qual começa marcado,
// para qual passa e em que segundo. A marcação anda até o próximo marco e o módulo de informação troca
// junto: serve para passagem de capítulos e pode voltar várias vezes no vídeo. 16x9 horizontal, 9x16
// vertical. Consulta 03/11: campos explícitos para a passagem (Gian) e, no 9x16, o texto fica ao lado das
// datas sem cobrir nenhuma (Luiza).
import { caixaAlta, esc } from '../base.js';
import { bloco, chapeu, familia, midia, papel } from '../componentes.js';

export const id = 'linha_tempo';

// "2019 | Denúncia | Ex-assessor procura o MP" → { ano, titulo, texto }
export function marcosDe(lista) {
  return String(lista ?? '')
    .split(/\r?\n/)
    .map((l) => l.split('|').map((x) => x.trim()))
    .filter((p) => p[0])
    .map(([ano, titulo = '', texto = '']) => ({ ano, titulo, texto }));
}

export function montar({ valores: v, formato, tokens, recursos }) {
  const H = formato === '16x9';
  const marcos = marcosDe(v.marcos);
  if (!marcos.length) return { fundo: '', html: '' };
  const achar = (ano, padrao) => { const i = marcos.findIndex((m) => m.ano === String(ano ?? '').trim()); return i >= 0 ? i : padrao; };
  const de = achar(v.comeca_em, 0);
  const ate = String(v.passa_para ?? '').trim() ? achar(v.passa_para, de) : de;
  const info = (m) => `<div style="${papel(tokens, 'chapeu', formato, { tamanho: 40 })};color:var(--d)">${esc(m.ano)}</div>` +
    (m.titulo ? `<div style="margin-top:16px;${papel(tokens, 'titulo', formato, { tamanho: H ? 72 : 60 })};color:#fff">${esc(caixaAlta(m.titulo))}</div>` : '') +
    (m.texto ? `<div style="margin-top:16px;${papel(tokens, 'apoio', formato, { tamanho: H ? 36 : 34 })};color:#fff">${esc(m.texto)}</div>` : '');

  if (v.estilo === 'parada grande') {
    const m = marcos[de];
    const foto = midia(recursos, 'foto', { estilo: `width:${H ? 820 : 900}px;height:${H ? 460 : 500}px;border:12px solid #fff;display:block`, classes: 'sombra', vazia: 'Foto do marco' });
    const conteudo = `<div class="a1" style="${papel(tokens, 'titulo', formato, { tamanho: H ? 200 : 180 })};line-height:.85;color:#000;background:var(--d);padding:20px 28px 8px;display:inline-block">${esc(m.ano)}</div>` +
      `<div class="a2" data-m="escala" style="margin-top:32px;display:flex;gap:56px;align-items:center;${H ? '' : 'flex-direction:column'}">${foto}<div style="max-width:${H ? 860 : 900}px;text-align:${H ? 'left' : 'center'}">${m.titulo ? `<div style="${papel(tokens, 'titulo', formato, { tamanho: 76 })};color:#fff">${esc(caixaAlta(m.titulo))}</div>` : ''}${m.texto ? `<div style="margin-top:20px;${papel(tokens, 'apoio', formato)};color:#fff">${esc(m.texto)}</div>` : ''}</div></div>`;
    return { fundo: '', html: `<div class="grao" style="position:absolute;inset:0"></div>` + bloco(tokens, formato, { posicao: H ? 'centro esquerda' : 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: conteudo }) };
  }

  const n = marcos.length;
  const ini = H ? 160 : 420;
  const fim = H ? 1760 : 1600;
  const passo = n > 1 ? (fim - ini) / (n - 1) : 0;
  const pos = (i) => ini + i * passo;
  const eixo = H ? 480 : 0;
  const ex = H ? 0 : 150;
  let h = `<div class="grao" style="position:absolute;inset:0"></div>`;
  h += bloco(tokens, formato, { posicao: 'topo esquerda', html: chapeu(tokens, formato, v.titulo, { variante: 'branco', classes: 'a1' }) });
  h += `<div class="w1" style="${H ? `left:${ini}px;width:${fim - ini}px;top:${eixo}px;height:4px` : `left:${ex}px;width:4px;top:${ini}px;height:${fim - ini}px`};background:#fff6"></div>`;
  marcos.forEach((m, i) => {
    const rotulo = `<div style="${familia(tokens, 'tipo')};font-size:${H ? 56 : 60}px;line-height:1;color:#fff8;${H ? 'text-align:center' : ''}">${esc(m.ano)}</div>`;
    h += `<div class="a2" data-m="escala" style="${H ? `left:${pos(i) - 80}px;width:160px;top:${eixo - 10}px` : `left:${ex - 10}px;top:${pos(i) - 12}px;display:flex;gap:28px;align-items:center`}"><div style="width:24px;height:24px;background:#fff;${H ? 'margin:0 auto 20px' : ''}"></div>${rotulo}</div>`;
  });
  const passaEm = Number(v.passa_em) > 0 ? ` data-passa-em="${Number(v.passa_em)}"` : '';
  const anda = ate !== de ? ` data-ate="${H ? pos(ate) - pos(de) : 0}" data-atey="${H ? 0 : pos(ate) - pos(de)}"${passaEm}` : '';
  h += `<div class="a3${ate !== de ? ' tl-marca' : ''}" data-m="escala"${anda} style="${H ? `left:${pos(de) - 80}px;width:160px;top:${eixo - 20}px` : `left:${ex - 20}px;top:${pos(de) - 22}px`}"><div style="width:44px;height:44px;background:var(--d);${H ? 'margin:0 auto;' : ''}box-shadow:0 0 0 10px rgba(255,255,255,.15)"></div></div>`;
  // 9x16: o módulo de informação começa depois da coluna das datas (x 400) e acompanha o marco.
  const caixaInfo = (i) => (H ? `left:160px;top:${eixo + 150}px;width:1600px` : `left:400px;top:${Math.min(pos(i) - 30, 1680 - 300)}px;width:610px`);
  h += `<div class="a4${ate !== de ? ' tl-de' : ''}" style="${caixaInfo(de)};text-align:left">${info(marcos[de])}</div>`;
  if (ate !== de) h += `<div data-tl="ate" style="${caixaInfo(ate)};text-align:left;opacity:0">${info(marcos[ate])}</div>`;
  return { fundo: '', html: h };
}

export const opaca = () => true;

const MARCOS = '2019 | Denúncia | Ex-assessor procura o MP com áudios\n2021 | Inquérito | PF abre investigação sobre a conta\n2022 | Quebra de sigilo | Justiça libera dados bancários\n2023 | Operação | Busca e apreensão em 4 estados\n2026 | Prisão | Ex-ministro é preso em Brasília';
export const exemplos = {
  'Espinha com passagem (2019 → 2021)': { titulo: 'Linha do tempo · Caso do jato', marcos: MARCOS, comeca_em: '2019', passa_para: '2021' },
  'Espinha com passagem (2023 → 2026)': { titulo: 'Linha do tempo · Caso do jato', marcos: MARCOS, comeca_em: '2023', passa_para: '2026' },
  'Parada grande': { estilo: 'parada grande', marcos: '2012 | Segundo incêndio | 80 famílias atingidas, uma morte. Moradores acusam a CPTM', foto: { arquivo: 'exemplo-3' } },
};
