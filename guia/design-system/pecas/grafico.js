// Sistema de gráficos gerados a partir dos dados digitados (colunas, ranking, comparação com fotos e rosca).
// Montagem: a linha de base aparece primeiro, depois cada barra cresce uma de cada vez e os valores vêm em
// seguida. v2: conecta tipografia e cores; preserva geometria dos dados, eixos, unidade e animação. Os
// valores ficam estruturados (T12). Consulta 03/11: % e º vêm da fonte de apoio (Luiza).
import { esc } from '../base.js';
import { auto, bloco, chapeu, empilhar, familia, fundo, midia, tratamentoDe, variante } from '../componentes.js';

export const id = 'grafico';

// "2006 | 16,8" → [{ rotulo: '2006', valor: 16.8 }]
export function dadosDe(tabela) {
  return String(tabela ?? '')
    .split(/\r?\n/)
    .map((l) => l.split('|').map((x) => x.trim()))
    .filter((p) => p[0] && p[1] !== undefined && p[1] !== '')
    .map(([rotulo, valor]) => ({ rotulo, valor: Number(String(valor).replace(/\./g, '').replace(',', '.')) }))
    .filter((d) => Number.isFinite(d.valor));
}

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const V = formato === '9x16';
  const d = dadosDe(v.dados);
  const pedidas = Number.isFinite(Number(v.casas)) && v.casas !== '' ? Number(v.casas) : d.some((x) => !Number.isInteger(x.valor)) ? 1 : 0;
  const casas = Math.min(4, Math.max(0, Math.round(pedidas)));
  const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const un = String(v.unidade ?? '').trim();
  const iDest = Math.max(0, d.findIndex((x) => x.rotulo === String(v.destaque ?? '').trim()));
  const max = Math.max(1, ...d.map((x) => x.valor));
  const tipo = v.tipo ?? 'colunas';
  const t = familia(tokens, 'tipo');
  const m = familia(tokens, 'manrope');
  const mini = `font-size:${variante(tokens, 'papel.mini').tamanho[formato]}px;letter-spacing:.06em;text-transform:uppercase;color:#fffc`;
  let grafico;
  let modo = 'colunas';
  if (tipo === 'ranking') {
    modo = 'barras';
    const W = V ? 480 : 1150;
    const L = V ? 300 : 420;
    grafico = `<div style="position:relative">${d.map((x, i) => `<div style="display:flex;align-items:center;gap:24px;margin-bottom:20px"><div class="vl" style="width:${L}px;text-align:right;${m};font-size:${V ? 34 : 40}px;color:#fff">${esc(x.rotulo)}</div><div class="br" style="width:${Math.round((W * x.valor) / max)}px;height:${V ? 64 : 80}px;background:${i === iDest ? 'var(--d)' : '#3a3a3a'}"></div><div class="vl" style="${t};font-size:${V ? 44 : 52}px;line-height:1;color:${i === iDest ? 'var(--d)' : '#fff'}">${fmt(x.valor)}${esc(un)}</div></div>`).join('')}<div class="eixo" style="position:absolute;left:${L + 22}px;top:-10px;bottom:10px;width:4px;background:#fff8"></div></div>`;
  } else if (tipo === 'comparação com fotos') {
    modo = 'barras';
    const W = V ? 600 : 1200;
    const F = V ? 150 : 160;
    grafico = `<div style="position:relative;text-align:left">${d.slice(0, 4).map((x, i) => `<div style="display:flex;align-items:center;${i ? 'margin-top:40px' : ''}"><div style="width:${F}px;height:${F}px;flex:none;overflow:hidden;background:#333">${midia(recursos, `foto${i + 1}`, { estilo: 'width:100%;height:100%' })}</div><div class="br" style="width:${Math.round((W * x.valor) / max)}px;height:${F}px;background:${i === iDest ? 'var(--d)' : '#555'};flex:none"></div><div class="vl" style="margin-left:24px"><div style="${t};font-size:${V ? 40 : 52}px;line-height:1;color:#fff">${fmt(x.valor)}${esc(un)}</div><div style="${m};font-size:26px;color:#fffb;margin-top:8px;text-transform:uppercase;letter-spacing:.06em">${esc(x.rotulo)}</div></div></div>`).join('')}<div class="eixo" style="position:absolute;left:${F}px;top:-12px;bottom:-12px;width:4px;background:#fff8"></div></div>`;
  } else if (tipo === 'rosca') {
    modo = 'rosca';
    const R = V ? 260 : 240;
    const C = 2 * Math.PI * R * 0.8;
    const total = d.reduce((s, x) => s + x.valor, 0) || 1;
    const cores = ['var(--d)', '#3a3a3a', '#6a6a6a', '#9a9a9a', '#cfcfcf'];
    let off = 0;
    const arcos = d.map((x, i) => {
      const len = (C * x.valor) / total;
      const s = `<circle data-len="${len}" data-c="${C}" cx="${R}" cy="${R}" r="${R * 0.8}" fill="none" stroke="${cores[(i === iDest ? 0 : i + (i < iDest ? 1 : 0)) % cores.length]}" stroke-width="${R * 0.32}" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${R} ${R})"/>`;
      off += len;
      return s;
    }).join('');
    const pct = (x) => fmt((100 * x.valor) / total);
    grafico = `<div style="display:flex;gap:56px;align-items:center;${V ? 'flex-direction:column' : ''}"><svg width="${R * 2}" height="${R * 2}">${arcos}<text class="vl" x="${R}" y="${R + 34}" text-anchor="middle" font-family="TipoNinja, Manrope" font-size="${R * 0.42}" fill="#fff">${d[iDest] ? pct(d[iDest]) : ''}%</text></svg><div>${d.map((x, i) => `<div class="vl" style="display:flex;align-items:center;gap:16px;margin-bottom:20px;text-align:left"><span style="width:32px;height:32px;flex:none;background:${cores[(i === iDest ? 0 : i + (i < iDest ? 1 : 0)) % cores.length]}"></span><span style="${m};font-size:36px;color:#fff">${esc(x.rotulo)} · ${pct(x)}%</span></div>`).join('')}</div></div>`;
  } else {
    const H = V ? 620 : 500;
    const W = V ? Math.min(110, Math.floor(860 / Math.max(1, d.length)) - 28) : Math.min(170, Math.floor(1600 / Math.max(1, d.length)) - 56);
    const G = V ? 28 : 56;
    grafico = `<div style="display:flex;gap:${G}px;align-items:flex-end;height:${H + 70}px;position:relative">${d.map((x, i) => `<div style="width:${W}px;text-align:center"><div class="vl" style="${t};font-size:44px;line-height:1;color:${i === iDest ? 'var(--d)' : '#fff'};margin-bottom:14px">${fmt(x.valor)}${esc(un)}</div><div class="br" style="height:${Math.round((H * x.valor) / max)}px;background:${i === iDest ? 'var(--d)' : '#3a3a3a'}"></div></div>`).join('')}<div class="eixo" style="position:absolute;left:-16px;right:-16px;bottom:-4px;height:4px;background:#fff8"></div></div><div style="display:flex;gap:${G}px;margin-top:20px">${d.map((x) => `<div class="vl" style="width:${W}px;text-align:center;${m};font-size:24px;color:#fffa">${esc(x.rotulo)}</div>`).join('')}</div>`;
  }
  const titulo = chapeu(tokens, formato, v.titulo, { variante: 'branco', classes: 'a1', estilo: `white-space:normal;max-width:${V ? 940 : 1500}px;line-height:1.15;text-align:left` });
  const fonteTxt = String(v.fonte ?? '').trim() ? `<span class="a3" style="${m};${mini}">${esc(v.fonte)}</span>` : '';
  const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(auto(v.tratamento) ?? 'fundo preto com grão'), foco: v.foco, duracao });
  const html = bloco(tokens, formato, { posicao: auto(v.posicao) ?? (V ? 'centro' : 'centro esquerda'), dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([titulo, [`<div class="a2" data-m="${modo}" style="text-align:left">${grafico}</div>`, 56], [fonteTxt, 32]]) });
  return { fundo: f.fundo, html: f.camadas + html };
}

export const opaca = (v) => tratamentoDe(auto(v.tratamento) ?? 'fundo preto com grão') === 'grao';

export const exemplos = {
  Colunas: { tipo: 'colunas', titulo: 'Abstenção no 2º turno (%)', dados: '2006 | 16,8\n2010 | 21,5\n2014 | 21,1\n2018 | 21,3\n2022 | 20,6\n2026 | 19,2', destaque: '2026', fonte: 'Fonte: TSE · eixo começa em zero' },
  Ranking: { tipo: 'ranking', titulo: 'Onde Lula mais cresceu do 1º para o 2º turno (p.p.)', dados: 'Goiás | 9,28\nSão Paulo | 7,95\nDistrito Federal | 7,61\nRio de Janeiro | 7,49\nAmapá | 7,17\nMinas Gerais | 7,1', destaque: 'Goiás', casas: 2, fonte: 'Fonte: TSE' },
  'Comparação com fotos': { tipo: 'comparação com fotos', titulo: 'Votos válidos · 2º turno 2026', dados: 'Lula | 64.256.232\nFlávio | 59.826.041', destaque: 'Lula', fonte: 'Fonte: TSE · 100% das seções' },
  Rosca: { tipo: 'rosca', titulo: 'Quem decide o orçamento', dados: 'Emendas parlamentares | 24\nMinistérios | 61\nOutros | 15', destaque: 'Emendas parlamentares', fonte: 'Fonte: Siafi 2026' },
};
