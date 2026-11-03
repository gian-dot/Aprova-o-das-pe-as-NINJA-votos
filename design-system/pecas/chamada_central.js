// Chamada central: o modelo de vídeo do Canva (Thiago), agora modular e no NINJA Design System.
// Só a chamada e o chapéu (opcional). Crédito, logo e faixa de marcas são peças separadas.
// Chapéu e chamada seguem os fundamentos do Thiago (TipoNinja, chapeu_padrao, 20 px entre eles);
// o tamanho da chamada é ajustado no navegador com a regra dele (limites.js → ajustarChamada).
import { caixaAlta, esc, fonte, midiaDeFundo, realcar } from '../base.js';
import { ajustarChamada } from '../limites.js';

export const id = 'chamada_central';
export const apelidos = ['manchete_central'];

function tratamento(t, tokens, formato) {
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

const numero = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function montar({ valores, formato, tokens, recursos, duracao, destaque }) {
  const area = tokens.area[formato];
  const tq = tokens.texto.chamada;
  const tc = tokens.texto.chapeu_canva;
  const chapeuDs = tokens.tipografia.chapeu_padrao;
  const chamadaDs = tokens.tipografia.chamada_padrao;
  const aoVivo = valores.modo === 'ao vivo';
  const trat = String(valores.tratamento ?? '');
  const escurece = trat.startsWith('véu') || trat.startsWith('desfoque');
  const posicao = String(valores.posicao_bloco ?? 'automática');
  const centro = posicao === 'centro' || (posicao !== 'base' && escurece);

  const fundo = midiaDeFundo({
    recursos,
    foco: valores.foco,
    duracao,
    filtro: trat.startsWith('desfoque') ? `filter:blur(${tokens.fundo.desfoque.raio}px);transform:scale(1.06)` : '',
  });

  const chapeuTexto = String(valores.chapeu ?? '').trim();
  const chapeu = chapeuTexto
    ? `<div id="m-chapeu" style="display:inline-block;${fonte(tokens, tc.fonte)};font-size:${tc[formato].tamanho}px;line-height:1;padding:${chapeuDs.padding_vertical}px ${chapeuDs.padding_horizontal}px;letter-spacing:${chapeuDs.espacamento_letras}em;text-transform:uppercase;background:${aoVivo ? tokens.cores.ao_vivo : chapeuDs.caixa_fundo};color:${aoVivo ? tokens.cores.branco : chapeuDs.texto};transform:translateY(${numero(valores.deslocar_chapeu_y)}px)">${aoVivo ? '● ' : ''}${esc(caixaAlta(chapeuTexto))}</div>`
    : '';
  const texto = String(valores.chamada ?? valores.manchete ?? '');
  const largura = Math.min(tq[formato].largura_max ?? Infinity, tokens.quadro[formato].largura - area.esquerda - area.direita);
  const chamada = `<div id="m-chamada" data-campo="chamada" data-linhas-max="5" style="${chapeu ? `margin-top:${tokens.espacamentos.chapeu_chamada}px;` : ''}${fonte(tokens, tq.fonte)};font-size:${tq[formato].tamanho}px;line-height:${chamadaDs.entrelinha};letter-spacing:${chamadaDs.espacamento_letras}em;color:${tokens.cores.branco};text-transform:uppercase;max-width:${largura}px">${realcar(caixaAlta(texto), caixaAlta(valores.palavra_destaque), destaque)}</div>`;

  const bloco =
    `<div id="m-bloco" style="position:absolute;left:${area.esquerda}px;right:${area.direita}px;top:${area.topo}px;bottom:${area.base}px;` +
    `display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:${centro ? 'center' : 'flex-end'};` +
    `transform:translate(${numero(valores.deslocar_x)}px, ${numero(valores.deslocar_y)}px)">${chapeu}${chamada}</div>`;

  const html = tratamento(trat, tokens, formato) + bloco;

  // Ajuste de tamanho no navegador (preview e render usam o mesmo Chrome): mede as linhas de verdade.
  const ajuste = {
    largura,
    altura: tokens.quadro[formato].altura - area.topo - area.base - 200,
    tamanhoInicial: tq[formato].tamanho,
    minimo: tq[formato].minimo ?? 0,
    maximo: tq[formato].maximo ?? 10000,
  };
  const antes = `
var ajustarChamada = ${ajustarChamada.toString()};
(function () {
  var el = document.getElementById('m-chamada');
  if (!el) return;
  var cfg = ${JSON.stringify(ajuste)};
  function medir(texto, tamanho) {
    el.style.fontSize = tamanho + 'px';
    var linha = parseFloat(getComputedStyle(el).lineHeight) || tamanho;
    var altura = el.getBoundingClientRect().height;
    return { linhas: Math.max(1, Math.round(altura / linha)), alturaPx: altura };
  }
  var r = ajustarChamada({ texto: el.textContent, largura: cfg.largura, altura: cfg.altura, tamanhoInicial: cfg.tamanhoInicial, minimo: cfg.minimo, maximo: cfg.maximo, medir: medir });
  el.style.fontSize = r.tamanho + 'px';
  el.dataset.tamanho = r.tamanho;
  el.dataset.linhas = r.linhas;
  el.dataset.coube = r.coube ? 'sim' : 'nao';
})();`;

  const a = tokens.animacao;
  const parado = { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' };
  const saiTexto = Math.max(1, duracao - a.saida_texto - a.saida_fundo - a.atraso_saida_fundo);
  const saiFundo = Math.max(1.2, duracao - a.saida_fundo);
  const animacoes = [];
  if (chapeu) {
    animacoes.push({ alvo: '#m-chapeu', de: { clipPath: 'inset(0% 100% 0% 0%)' }, para: { clipPath: 'inset(0% 0% 0% 0%)' }, em: 0.1, duracao: a.entrada * 0.85, ease: a.ease_varredura });
  }
  // Máscara: a chamada sobe de dentro da própria linha.
  animacoes.push({ alvo: '#m-chamada', de: { opacity: 1, y: a.deslocamento, clipPath: 'inset(0% 0% 100% 0%)' }, para: parado, em: 0.1 + (chapeu ? a.escalonamento : 0), duracao: a.entrada, ease: a.ease_entrada });
  // Saída: o texto sai primeiro; o tratamento do fundo some depois (sem corte seco).
  animacoes.push({ alvo: '#m-bloco', de: { opacity: 1, y: 0 }, para: { opacity: 0, y: -24 }, em: saiTexto, duracao: a.saida_texto, ease: a.ease_saida });
  // Sem "de": parte da opacidade que o tratamento já tem (o véu é 55%, não 100%).
  animacoes.push({ alvo: '.m-fundo', para: { opacity: 0 }, em: saiFundo, duracao: a.saida_fundo, ease: a.ease_saida });

  return { fundo, html, css: '', animacoes, antes };
}
