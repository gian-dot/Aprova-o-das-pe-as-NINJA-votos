// Componentes compartilhados das peças (NINJA Design System v2, contrato dos componentes): chapéu, caixa de
// texto, contraste, grifo, cartão, mídia, identificação e crédito. Cada componente recebe conteúdo, variante
// e formato; a posição é da composição (design-system/pecas/*.js). O app (preview e render) e o estúdio usam
// estes mesmos módulos: mudar uma variante em variantes.json muda todas as peças que a usam.
// Roda no navegador e no Node; devolve HTML em texto.
import { caixaAlta, esc } from './base.js';

// Estilos que não dependem do formato. Medidas por formato vão no estilo de cada elemento.
export function cssBase(tokens) {
  const g = variante(tokens, 'grifo.editorial');
  const sc = variante(tokens, 'sombra.caixa').valor;
  const st = variante(tokens, 'sombra.texto').valor;
  return `
#peca>*{position:absolute}
.area{position:absolute;display:flex;flex-direction:column}
.area>*{flex:none;position:relative}
.ln{display:block}
.hl,.hl-revela{background:linear-gradient(var(--d),var(--d)) no-repeat ${g.posicao}/100% ${g.altura};color:#000;padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.rsc{background:linear-gradient(#E8202A,#E8202A) no-repeat 0 55%/100% 12px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.sombra{box-shadow:${sc}}.tsombra{text-shadow:${st}}
.dt{color:var(--d)}
.grao{background:#070707 url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")}
.papel{background:#f2eee6 url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence baseFrequency='.7' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .2  0 0 0 .1 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")}
.vazia{background:repeating-linear-gradient(135deg,#2a2a2a 0 18px,#232323 18px 36px);display:flex;align-items:center;justify-content:center;color:#fff8;font:500 24px Manrope,sans-serif;letter-spacing:.08em;text-transform:uppercase}
`;
}

// ---------- variantes ----------

export function variante(tokens, caminho) {
  const [grupo, nome] = caminho.split('.');
  const v = tokens.variantes?.[grupo]?.[nome];
  if (!v) throw new Error(`Variante "${caminho}" não existe em design-system/variantes.json.`);
  return v;
}

// Valor de uma decisão do Thiago no contrato v2 (ex.: 'desfoque.raio_px' dentro de contraste).
function doContrato(tokens, grupo, campo) {
  return campo.split('.').reduce((o, k) => o?.[k], tokens.v2[grupo]);
}

export function cor(tokens, nome, destaque) {
  if (nome === 'destaque') return destaque ?? 'var(--d)';
  if (nome === 'branco') return tokens.cores.branco;
  if (nome === 'preto') return tokens.cores.preto;
  return tokens.cores[nome] ?? nome;
}

// "font-family…;font-size…;line-height…" de um papel tipográfico (variantes.json → papel).
export function papel(tokens, nome, formato, extra = {}) {
  const p = variante(tokens, `papel.${nome}`);
  const f = tokens.fontes[p.fonte];
  const tamanho = extra.tamanho ?? p.tamanho[formato];
  const partes = [`font-family:'${f.familia}',${f.reserva}`, `font-weight:${f.peso}`, `font-size:${tamanho}px`];
  partes.push(`line-height:${extra.entrelinha ?? p.entrelinha ?? 1}`);
  if (p.fonte === 'tipo' || p.caixa_alta) partes.push('text-transform:uppercase');
  if (p.espacamento) partes.push(`letter-spacing:${p.espacamento}em`);
  return partes.join(';');
}

export function familia(tokens, chave) {
  const f = tokens.fontes[chave];
  return `font-family:'${f.familia}',${f.reserva};font-weight:${f.peso}`;
}

// ---------- área e posição ----------

const ANCORAS = {
  centro: ['center', 'center', 'center'],
  'centro esquerda': ['center', 'flex-start', 'left'],
  'centro direita': ['center', 'flex-end', 'right'],
  'base esquerda': ['flex-end', 'flex-start', 'left'],
  'base centro': ['flex-end', 'center', 'center'],
  'base direita': ['flex-end', 'flex-end', 'right'],
  'topo esquerda': ['flex-start', 'flex-start', 'left'],
  'topo centro': ['flex-start', 'center', 'center'],
  'topo direita': ['flex-start', 'flex-end', 'right'],
};
export const POSICOES = Object.keys(ANCORAS);

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Bloco na área útil do perfil (D2/Reels), ancorado e deslocado pela editora (deslocar_x/deslocar_y).
export function bloco(tokens, formato, { posicao = 'centro', dx = 0, dy = 0, id = '', html, estilo = '', margens } = {}) {
  const a = margens ?? tokens.area[formato];
  const [v, h, t] = ANCORAS[posicao] ?? ANCORAS.centro;
  const mover = num(dx) || num(dy) ? `;transform:translate(${num(dx)}px,${num(dy)}px)` : '';
  return `<div${id ? ` id="${id}"` : ''} class="area" style="left:${a.esquerda}px;right:${a.direita}px;top:${a.topo}px;bottom:${a.base}px;justify-content:${v};align-items:${h};text-align:${t}${mover};${estilo}">${html}</div>`;
}

// Espaço entre elementos do conjunto editorial; elemento ausente não deixa espaço (v2).
// Cada item pode trazer o próprio espaço acima: [html, espaco].
export function empilhar(itens, espaco = 20) {
  return itens
    .map((item) => (Array.isArray(item) ? item : [item, espaco]))
    .filter(([html]) => Boolean(html))
    .map(([html, e], i) => `<div style="${i ? `margin-top:${e}px` : ''}">${html}</div>`)
    .join('');
}

// ---------- texto ----------

// Linhas da editora (ela quebra a linha onde quiser).
export function linhasDe(texto) {
  return String(texto ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

// Nos blocos NINJA o texto não termina em ponto final (v2); pergunta e exclamação ficam.
export function semPontoFinal(texto) {
  return String(texto ?? '').replace(/(?<!\.)\.\s*$/, '');
}

// Trechos separados por vírgula ou ponto e vírgula: "novo plano; amplia".
export function trechosDe(texto) {
  return String(texto ?? '').split(/[;\n]/).map((t) => t.trim()).filter(Boolean);
}

// Grifa cada trecho (todas as ocorrências, sem diferenciar maiúsculas). Recebe texto cru, devolve HTML.
export function grifar(texto, trechos, classe = 'hl') {
  const t = String(texto ?? '');
  const lista = (Array.isArray(trechos) ? trechos : trechosDe(trechos)).filter(Boolean);
  if (!lista.length) return esc(t);
  const baixo = t.toLocaleLowerCase('pt-BR');
  const marcas = [];
  for (const tr of lista) {
    const alvo = tr.toLocaleLowerCase('pt-BR');
    for (let i = baixo.indexOf(alvo); i >= 0; i = baixo.indexOf(alvo, i + alvo.length)) {
      if (!marcas.some(([a, b]) => i < b && i + alvo.length > a)) marcas.push([i, i + alvo.length]);
    }
  }
  marcas.sort((a, b) => a[0] - b[0]);
  let saida = '';
  let pos = 0;
  for (const [a, b] of marcas) {
    saida += esc(t.slice(pos, a)) + `<span class="${classe}">${esc(t.slice(a, b))}</span>`;
    pos = b;
  }
  return saida + esc(t.slice(pos));
}

// Palavra em destaque pintada (cor de destaque), sem fundo.
export function pintar(texto, palavra) {
  return grifar(texto, palavra ? [palavra] : [], 'dt');
}

// ---------- chapéu ----------

// D1: caixa branca ou na cor de destaque, sempre com texto preto. Padding do Thiago (chapeu_padrao).
export function chapeu(tokens, formato, texto, { variante: nome = 'branco', id = '', classes = '', estilo = '', atributos = '', destaque } = {}) {
  const t = String(texto ?? '').trim();
  if (!t) return '';
  const v = variante(tokens, `chapeu.${nome}`);
  const ds = tokens.tipografia.chapeu_padrao;
  const css = `display:inline-block;${papel(tokens, 'chapeu', formato)};letter-spacing:${ds.espacamento_letras}em;white-space:nowrap;padding:${ds.padding_vertical}px ${ds.padding_horizontal}px;background:${cor(tokens, v.fundo, destaque)};color:${cor(tokens, v.texto)};${estilo}`;
  // V4: centralização óptica na área do chapéu (runtime.js) e nunca ponto final.
  return `<span${id ? ` id="${id}"` : ''} class="${classes}" style="${css}" data-caixa="area" data-pad="${ds.padding_vertical}" ${atributos}>${esc(v.prefixo ?? '')}${esc(semPontoFinal(caixaAlta(t)))}</span>`;
}

// ---------- caixa de texto (D8) ----------

// Faixas: uma caixa por linha da editora, padding visível 18. Única: uma caixa para o bloco, 38.
// O padding vertical é acertado no navegador (runtime.js) para centralizar a tinta das letras.
export function caixa(tokens, formato, linhasHtml, { variante: nome = 'faixas', papel: p = 'titulo_tarja', fundo = '#000', corTexto = '#fff', alinhar = 'center', id = '', classes = '', atributos = '', tamanho, estilo = '' } = {}) {
  const v = variante(tokens, `caixa_texto.${nome}`);
  const pad = v.padding_px ?? tokens.v2.caixa_texto[v.padding_de];
  const fonte = papel(tokens, p, formato, tamanho ? { tamanho } : {});
  const margem = alinhar === 'center' ? 'margin-left:auto;margin-right:auto' : alinhar === 'right' ? 'margin-left:auto' : '';
  if (v.modo === 'por_linha') {
    // Uma faixa por linha da editora, sem quebrar dentro dela; se a mais larga não couber na área, todas
    // diminuem juntas (runtime.js → data-largura-max).
    const faixas = linhasHtml.map((l) => `<span class="ln" data-caixa data-pad="${pad}" style="width:fit-content;${margem};padding:${pad}px ${pad}px;background:${fundo};color:${corTexto};white-space:nowrap;${fonte}">${l}</span>`).join('');
    const max = tokens.quadro[formato].largura - tokens.area[formato].esquerda - tokens.area[formato].direita;
    return `<div${id ? ` id="${id}"` : ''} class="${classes}" data-m="linhas" data-largura-max="${max}" style="text-align:${alinhar}" ${atributos}>${faixas}</div>`;
  }
  return `<div${id ? ` id="${id}"` : ''} class="${classes}" data-caixa data-pad="${pad}" style="width:fit-content;${margem};padding:${pad}px;background:${fundo};color:${corTexto};text-align:${alinhar};${fonte};${estilo}" ${atributos}>${linhasHtml.join('<br>')}</div>`;
}

// ---------- mídia ----------

// Foto ou vídeo do Drive (recursos.midias[id]); sem mídia, nada (a peça sai com transparência) ou,
// com `vazia`, um quadro listrado que mostra onde a mídia vai.
export function midia(recursos, id, { foco, estilo = '', classes = '', filtro = '', vazia = '', duracao } = {}) {
  const m = recursos?.midias?.[id] ?? (id === 'fundo' ? recursos?.midia : null);
  if (!m?.url) return vazia ? `<div class="vazia ${classes}" style="${estilo}">${esc(vazia)}</div>` : '';
  const f = m.foco ?? foco;
  const x = Number.isFinite(f?.x) ? f.x : 50;
  const y = Number.isFinite(f?.y) ? f.y : 50;
  const css = `object-fit:cover;object-position:${x}% ${y}%;${filtro ? `filter:${filtro};` : ''}${estilo}`;
  const tempo = duracao ? ` data-start="0" data-duration="${duracao}"` : '';
  const idHtml = id === 'fundo' ? ' id="fundo"' : ` data-midia="${esc(id)}"`;
  if (m.tipo === 'video') return `<video${idHtml} class="clip ${classes}"${tempo} src="${esc(m.url)}" muted playsinline style="${css}"></video>`;
  return `<img${idHtml} class="${classes}"${tempo} src="${esc(m.url)}" alt="" style="${css}">`;
}

export function temMidia(recursos, id) {
  return Boolean((recursos?.midias?.[id] ?? (id === 'fundo' ? recursos?.midia : null))?.url);
}

// Mídia de fundo em tela cheia (fica fora de #peca, como clip do HyperFrames) e as camadas de contraste
// (dentro de #peca, para a animação existente: entram primeiro, saem por último). D5/D6.
export function fundo(tokens, formato, recursos, { tratamento = 'nenhum', foco, duracao, ancoras = [], fimFoto, id = 'fundo' } = {}) {
  const tem = temMidia(recursos, id);
  const raio = doContrato(tokens, 'contraste', variante(tokens, 'contraste.desfoque').raio_de);
  const filtro = tratamento === 'desfoque' && tem ? `blur(${raio}px)` : '';
  const escala = filtro ? 'transform:scale(1.06);' : '';
  return {
    fundo: midia(recursos, id, { foco, duracao, filtro, estilo: `position:absolute;inset:0;width:100%;height:100%;${escala}` }),
    camadas: contraste(tokens, formato, tratamento, { ancoras, fimFoto, temMidia: tem }),
  };
}

// Camadas de contraste. Véu e desfoque: D6. Degradê: D5, medido depois do encaixe (runtime.js).
export function contraste(tokens, formato, tipo, { ancoras = [], fimFoto, temMidia: tem = true } = {}) {
  if (!tipo || tipo === 'nenhum') return '';
  if (tipo === 'veu') {
    const o = doContrato(tokens, 'contraste', variante(tokens, 'contraste.veu').opacidade_de);
    return `<div id="m-veu" class="m-fundo" style="position:absolute;inset:0;background:#000;opacity:${o}"></div>`;
  }
  if (tipo === 'desfoque') {
    // Sem mídia não há o que desfocar: fica só o véu do desfoque (35%).
    const o = doContrato(tokens, 'contraste', variante(tokens, 'contraste.desfoque').opacidade_de);
    return `<div id="m-veu" class="m-fundo" data-desfoque="${tem ? 'sim' : 'sem-midia'}" style="position:absolute;inset:0;background:#000;opacity:${o}"></div>`;
  }
  if (tipo === 'escuro') {
    return `<div id="m-veu" class="m-fundo" style="position:absolute;inset:0;background:#000;opacity:${variante(tokens, 'contraste.escuro').opacidade}"></div>`;
  }
  if (tipo === 'grao') return `<div id="m-grao" class="grao" style="position:absolute;inset:0"></div>`;
  if (tipo === 'degrade') {
    variante(tokens, 'contraste.degrade');
    const d = tokens.v2.contraste.degrade;
    const fim = fimFoto ?? tokens.quadro[formato].altura;
    const cfg = { ancoras, distancia: d.distancia_acima_ancora_px, fim_foto: fim };
    // Antes de medir: do meio do quadro ao fim da foto. O runtime acerta pela geometria final.
    const meio = Math.round(tokens.quadro[formato].altura / 2);
    return `<div id="m-degrade" class="m-fundo" data-degrade='${JSON.stringify(cfg)}' style="position:absolute;left:0;right:0;top:${meio}px;height:${fim - meio}px;background:linear-gradient(rgba(0,0,0,${d.opacidade_no_inicio}),rgba(0,0,0,${d.opacidade_no_fim_da_foto}))"></div>` +
      (fim < tokens.quadro[formato].altura ? `<div id="m-base" class="m-fundo" style="position:absolute;left:0;right:0;top:${fim}px;bottom:0;background:#000"></div>` : '');
  }
  throw new Error(`Tratamento de contraste desconhecido: ${tipo}`);
}

// Nome das opções de tratamento nas fichas → variante.
export function tratamentoDe(opcao) {
  const t = String(opcao ?? '').toLowerCase();
  if (t.startsWith('degrad')) return 'degrade';
  if (t.startsWith('véu') || t.startsWith('veu')) return 'veu';
  if (t.startsWith('desfoque')) return 'desfoque';
  if (t.startsWith('escuro')) return 'escuro';
  if (t.startsWith('fundo preto') || t.startsWith('grão')) return 'grao';
  return 'nenhum';
}

// ---------- cartão, onda, crédito ----------

export function cartao(tokens, nome, html, { largura, estilo = '', classes = '', atributos = '' } = {}) {
  const v = variante(tokens, `cartao.${nome}`);
  const fundoCss = v.fundo ? `background:${v.fundo};` : '';
  return `<div class="${nome === 'papel' ? 'papel ' : ''}${classes}" style="${fundoCss}padding:${v.padding[0]}px ${v.padding[1]}px;border-radius:${v.raio ?? 0}px;${largura ? `width:${largura}px;` : ''}text-align:left;${estilo}" ${atributos}>${html}</div>`;
}

export function onda(n, corBarra = 'var(--d)', alt = 120) {
  const barras = [...Array(n)].map((_, i) => `<div style="width:10px;border-radius:5px;background:${corBarra};height:${Math.round(alt * (0.25 + 0.75 * Math.abs(Math.sin(i * 1.31) * Math.cos(i * 0.47))))}px"></div>`).join('');
  return `<div class="onda" style="display:flex;gap:8px;align-items:center;height:${alt}px">${barras}</div>`;
}

// Crédito curto preso à mídia (D3): Manrope, caixa alta, sem animação (entra e sai com o corte).
export function creditoMini(tokens, formato, texto, estilo = '') {
  const t = String(texto ?? '').trim();
  if (!t) return '';
  return `<div data-m="fixo" style="${papel(tokens, 'mini', formato)};color:${tokens.cores.credito};text-shadow:0 1px 6px rgba(0,0,0,.5);${estilo}">${esc(semPontoFinal(t))}</div>`;
}

// Linha de função da identificação (D4): Manrope em caixa preta. Substitui o "chapéu preto" do estúdio v5,
// que a v2 excluiu do chapéu (D1).
export function funcao(tokens, texto, { classes = '', estilo = '' } = {}) {
  const t = String(texto ?? '').trim();
  if (!t) return '';
  const d4 = variante(tokens, 'identificacao.tarja');
  return `<span class="${classes}" data-caixa data-pad="${d4.funcao_padding[0]}" style="display:inline-block;${familia(tokens, 'manrope')};font-size:${d4.funcao_tamanho}px;line-height:1;letter-spacing:.04em;text-transform:uppercase;padding:${d4.funcao_padding[0]}px ${d4.funcao_padding[1]}px;background:#000;color:#fff;white-space:nowrap;${estilo}">${esc(t)}</span>`;
}

// Opções "automática"/"automático" nas fichas: a composição escolhe pela versão da peça.
export function auto(valor) {
  const t = String(valor ?? '').trim();
  return !t || t.startsWith('autom') ? undefined : t;
}
