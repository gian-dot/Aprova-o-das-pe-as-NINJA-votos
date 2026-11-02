// Manchete central: o modelo de vídeo do Canva (Thiago), medido em 02/11/2026.
// Mídia em tela cheia, tratamento do fundo, chapéu em caixa, manchete TipoNinja centralizada,
// faixa de marcas e crédito na base preta.
import { caixaAlta, esc, fonte, midiaDeFundo, realcar } from '../base.js';

export const id = 'manchete_central';

// Medidas do Canva que só valem para esta peça (as gerais estão no tokens.json).
const MEDIDAS = {
  '9x16': {
    bloco: 'left:83px;right:83px;bottom:388px',
    faixa: 'left:69px;right:77px;top:1580px',
    credito: 'left:69px;top:1727px',
  },
  '16x9': {
    bloco: 'left:240px;right:240px;bottom:228px',
    faixa: 'left:128px;right:128px;top:900px',
    credito: 'left:128px;top:1000px',
  },
};
const CHAPEU_PARA_MANCHETE = 24;
const LOGO_ALTURA = 40;
const OLHOS_ALTURA = 48;

function tratamento(valores, tokens, formato) {
  const t = String(valores.tratamento ?? '');
  if (t.startsWith('véu')) {
    return `<div id="m-veu" class="m-fundo" style="position:absolute;inset:0;background:#000;opacity:${tokens.fundo.veu}"></div>`;
  }
  if (t.startsWith('desfoque')) {
    return `<div id="m-veu" class="m-fundo" style="position:absolute;inset:0;background:#000;opacity:${tokens.fundo.desfoque.veu}"></div>`;
  }
  const d = tokens.fundo.degrade_canva[formato];
  return (
    `<div id="m-degrade" class="m-fundo" style="position:absolute;left:0;right:0;top:${d.inicio}px;height:${d.altura}px;background:linear-gradient(transparent,#000)"></div>` +
    `<div id="m-base" class="m-fundo" style="position:absolute;left:0;right:0;top:${d.base_preta}px;bottom:0;background:#000"></div>`
  );
}

export function montar({ valores, comuns, formato, tokens, recursos, duracao, destaque }) {
  const m = MEDIDAS[formato];
  const tm = tokens.texto.manchete_canva;
  const tc = tokens.texto.chapeu_canva;
  const ts = tokens.texto.selo_faixa;
  const tcr = tokens.texto.credito_mini;
  const aoVivo = valores.modo === 'ao vivo';
  const desfoque = String(valores.tratamento ?? '').startsWith('desfoque');

  const fundo = midiaDeFundo({
    recursos,
    foco: valores.foco,
    duracao,
    filtro: desfoque ? `filter:blur(${tokens.fundo.desfoque.raio}px);transform:scale(1.06)` : '',
  });

  const chapeuTexto = String(valores.chapeu ?? '').trim();
  const chapeu = chapeuTexto
    ? `<div id="m-chapeu" style="display:inline-block;${fonte(tokens, tc.fonte)};font-size:${tc.tamanho}px;line-height:1;padding:${tc.respiro[0]}px ${tc.respiro[1]}px;text-transform:uppercase;background:${aoVivo ? tokens.cores.ao_vivo : tokens.cores.branco};color:${aoVivo ? tokens.cores.branco : tokens.cores.preto}">${aoVivo ? '● ' : ''}${esc(caixaAlta(chapeuTexto))}</div>`
    : '';
  const manchete = `<div id="m-manchete" data-campo="manchete" data-linhas-max="3" style="${chapeu ? `margin-top:${CHAPEU_PARA_MANCHETE}px;` : ''}${fonte(tokens, tm.fonte)};font-size:${tm[formato].tamanho}px;line-height:${tm[formato].entrelinha}px;letter-spacing:${tm.espacamento}em;color:${tokens.cores.branco};text-transform:uppercase">${realcar(caixaAlta(valores.manchete), caixaAlta(valores.palavra_destaque), destaque)}</div>`;

  const selo = valores.selo && valores.selo !== 'nenhum' && !String(valores.selo).startsWith('outro')
    ? `<span style="${fonte(tokens, ts.fonte)};font-size:${ts.tamanho}px;letter-spacing:${ts.espacamento}em;color:${tokens.cores.branco}">▬ ${esc(valores.selo)}</span>`
    : '<span></span>';
  const faixa = valores.faixa_marcas === false
    ? ''
    : `<div id="m-faixa" style="position:absolute;${m.faixa};display:flex;align-items:center;justify-content:space-between">` +
      `<img src="${esc(recursos.ds('marca/logos/NINJA-BRANCO.svg'))}" style="height:${LOGO_ALTURA}px;display:block" alt="">${selo}` +
      `<img src="${esc(recursos.ds('marca/logos/ninja-logo-olhos-semfundo.png'))}" style="height:${OLHOS_ALTURA}px;display:block" alt=""></div>`;

  const creditoTexto = String(valores.credito ?? '').trim();
  const credito = creditoTexto
    ? `<div id="m-credito" style="position:absolute;${m.credito};${fonte(tokens, tcr.fonte)};font-size:${tcr.tamanho}px;letter-spacing:${tcr.espacamento}em;text-transform:uppercase;color:${tokens.cores.credito}">${esc(caixaAlta(creditoTexto))}</div>`
    : '';

  const html =
    tratamento(valores, tokens, formato) +
    `<div id="m-bloco" style="position:absolute;${m.bloco};text-align:center">${chapeu}${manchete}</div>` +
    faixa +
    credito;

  const a = tokens.animacao;
  const sobe = { opacity: 0, y: a.deslocamento };
  const parado = { opacity: 1, y: 0 };
  const saiTexto = Math.max(1, duracao - a.saida_texto - a.saida_fundo);
  const saiFundo = Math.max(1.2, duracao - a.saida_fundo);
  const animacoes = [];
  if (chapeu) animacoes.push({ alvo: '#m-chapeu', de: sobe, para: parado, em: 0.1, duracao: a.entrada, ease: a.ease_entrada });
  animacoes.push({ alvo: '#m-manchete', de: sobe, para: parado, em: 0.1 + a.escalonamento, duracao: a.entrada, ease: a.ease_entrada });
  const extras = [faixa && '#m-faixa', credito && '#m-credito'].filter(Boolean);
  for (const alvo of extras) {
    animacoes.push({ alvo, de: { opacity: 0 }, para: { opacity: 1 }, em: 0.1 + 2 * a.escalonamento, duracao: a.entrada, ease: a.ease_entrada });
  }
  // Saída suave: o texto sai primeiro; o tratamento do fundo some depois (regras §6).
  for (const alvo of ['#m-bloco', ...extras]) {
    animacoes.push({ alvo, de: { opacity: 1 }, para: { opacity: 0 }, em: saiTexto, duracao: a.saida_texto, ease: a.ease_saida });
  }
  // Sem "de": parte da opacidade que o tratamento já tem (o véu é 55%, não 100%).
  animacoes.push({ alvo: '.m-fundo', para: { opacity: 0 }, em: saiFundo, duracao: a.saida_fundo, ease: a.ease_saida });

  return { fundo, html, css: '', animacoes };
}
