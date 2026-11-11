// Guia do Lettering: monta a cola rápida e os cartões a partir do dados.json (gerado de
// src/acabamento/letering.ts) e desenha cada peça com os MESMOS módulos do app (composicao.js → documento),
// como o estúdio (design-system/galeria/galeria.js). Não há cópia de peça aqui.
// Caminhos sempre relativos: o site mora numa subpasta do GitHub Pages.
import { documento } from './design-system/composicao.js';
import { duracaoAutomatica } from './design-system/limites.js';

const $ = (id) => document.getElementById(id);

// el('p', { className: 'x', text: 'oi' }, filho, filho): os outros nomes viram atributos.
function el(tag, props = {}, ...filhos) {
  const no = document.createElement(tag);
  for (const [nome, valor] of Object.entries(props)) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (nome === 'className') no.className = valor;
    else if (nome === 'text') no.textContent = valor;
    else no.setAttribute(nome, valor === true ? '' : String(valor));
  }
  no.append(...filhos.flat().filter((f) => f !== null && f !== undefined && f !== false));
  return no;
}

// "CITAÇÃO" → "citacao": a busca e os endereços não ligam para acento nem maiúscula.
const semAcento = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const idDoCartao = (palavra) => `peca-${semAcento(palavra).replace(/[^a-z0-9]+/g, '-')}`;
const escrevaAssim = (f) => `${f.palavra}: ${f.campos.join(' | ')}`;

// "TARJA: nome | [cargo]" com a palavra em destaque.
function linhaComPalavra(tag, classe, texto) {
  const i = texto.indexOf(':') + 1;
  return el(tag, { className: classe }, el('b', { text: texto.slice(0, i) }), texto.slice(i));
}

// ---------- copiar ----------

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Sem permissão ou fora de https: o jeito antigo, com uma caixa de texto escondida.
    const caixa = el('textarea', { readonly: true, 'aria-hidden': 'true', style: 'position:fixed;left:-9999px;top:0' });
    caixa.value = texto;
    document.body.append(caixa);
    caixa.select();
    let deu = false;
    try { deu = document.execCommand('copy'); } catch { deu = false; }
    caixa.remove();
    return deu;
  }
}

function botaoCopiar(texto, palavra, rotulo = 'Copiar') {
  const botao = el('button', { type: 'button', className: 'copiar principal', 'aria-label': `Copiar o exemplo de ${palavra}`, text: rotulo });
  let volta = 0;
  botao.addEventListener('click', async () => {
    const deu = await copiarTexto(texto);
    botao.textContent = deu ? 'Copiado' : 'Não copiou';
    botao.classList.toggle('feito', deu);
    botao.classList.toggle('falhou', !deu);
    // Quem usa leitor de tela ouve o resultado (a região aria-live fica no fim da página).
    $('avisos').textContent = '';
    $('avisos').textContent = deu ? `Copiado: ${texto}` : 'Não deu para copiar. Selecione o texto do exemplo e copie à mão.';
    clearTimeout(volta);
    volta = setTimeout(() => {
      botao.textContent = rotulo;
      botao.classList.remove('feito', 'falhou');
    }, 1800);
  });
  return botao;
}

// ---------- prévia animada ----------

// Mídias de exemplo, como no estúdio: fotos do pacote do Thiago (desfocadas: ninguém real fica ligado a
// texto de exemplo), silhueta no lugar de pessoa e um print de mentira.
const SILHUETA = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3936"/><stop offset="1" stop-color="#151413"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#g)"/><ellipse cx="540" cy="400" rx="190" ry="250" fill="#6f6b66"/><ellipse cx="540" cy="1080" rx="460" ry="360" fill="#5c5853"/><text x="540" y="120" text-anchor="middle" font-family="sans-serif" font-size="34" letter-spacing="5" fill="#ffffff88">FOTO DA PESSOA (DRIVE)</text></svg>');
const PRINT = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><rect width="1200" height="760" fill="#fff"/><text x="60" y="130" font-family="sans-serif" font-size="52" font-weight="600" fill="#111">Ministério anuncia corte de R$ 4 bilhões</text><text x="60" y="196" font-family="sans-serif" font-size="52" font-weight="600" fill="#111">no programa</text>' + [96, 90, 94, 70, 88, 80].map((w, i) => `<rect x="60" y="${260 + i * 64}" width="${w * 10.8}" height="16" fill="#ccc"/>`).join('') + '</svg>');
const TEXTURA = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5c3a"/><stop offset=".5" stop-color="#c9a36b"/><stop offset="1" stop-color="#4e6b3a"/></linearGradient></defs><rect width="800" height="400" fill="url(#t)"/></svg>');
const FOTOS = { 'exemplo-1': 'comunicacao.jpg', 'exemplo-2': 'comunidades.jpg', 'exemplo-3': 'territorio.jpg', 'exemplo-4': '66ab38a6dbfa2635.jpg' };
const DESFOQUE = '<style>img[src*="ninja/recursos"]{filter:blur(16px) saturate(1.1)!important;transform:scale(1.08)}</style>';

// Endereços inteiros: o documento da peça roda num iframe (srcdoc) e não pode depender de onde a página mora.
const doDS = (caminho) => new URL(`design-system/${caminho}`, document.baseURI).href;
const GSAP = new URL('gsap.min.js', document.baseURI).href;

function urlExemplo(arquivo) {
  if (arquivo === 'exemplo-pessoa') return SILHUETA;
  if (arquivo === 'exemplo-print') return PRINT;
  if (arquivo === 'exemplo-textura') return TEXTURA;
  return FOTOS[arquivo] ? doDS(`ninja/recursos/${FOTOS[arquivo]}`) : null;
}

function midiasDe(valores) {
  const midias = {};
  for (const [campo, valor] of Object.entries(valores)) {
    if (valor && typeof valor === 'object' && valor.arquivo) {
      const url = urlExemplo(valor.arquivo);
      if (url) midias[campo] = { url, tipo: 'imagem', foco: valor.foco };
    }
  }
  return midias;
}

const PAUSA_NO_FIM_S = 0.8;
const semMovimento = matchMedia('(prefers-reduced-motion: reduce)');
// Quem pediu menos movimento ao sistema começa com as peças paradas no momento em que estão montadas.
let pausado = semMovimento.matches;
let tokens = null;
let fichas = null;

const previas = new Map(); // quadro → prévia
const tocando = new Set(); // só as prévias que estão na tela
let lacoLigado = false;

function laco() {
  if (pausado || tocando.size === 0) {
    lacoLigado = false;
    return;
  }
  const agora = performance.now();
  for (const p of tocando) {
    const t = ((agora - p.inicio) / 1000) % (p.duracao + PAUSA_NO_FIM_S);
    try { p.tl.seek(Math.min(t, p.duracao - 0.01), false); } catch { tocando.delete(p); }
  }
  requestAnimationFrame(laco);
}

function ligarLaco() {
  if (lacoLigado || pausado || tocando.size === 0) return;
  lacoLigado = true;
  requestAnimationFrame(laco);
}

// A peça parada no momento em que tudo está montado (peca._pico, calculado pelo motion.js).
function segurar(p) {
  if (!p.tl) return;
  try { p.tl.seek(p.peca?._pico ?? Math.min(1.5, p.duracao - 0.01), false); } catch { /* o iframe já saiu */ }
}

function atualizar(p) {
  if (!p.tl) return;
  if (p.visivel && !pausado) {
    if (!tocando.has(p)) {
      p.inicio = performance.now();
      tocando.add(p);
    }
    ligarLaco();
  } else {
    tocando.delete(p);
    if (pausado) segurar(p);
  }
}

function escalar(p) {
  if (!p.iframe) return;
  const { largura } = tokens.quadro[p.formato];
  p.iframe.style.transform = `scale(${p.quadro.clientWidth / largura})`;
}

function montarPrevia(p) {
  clearInterval(p.espera);
  tocando.delete(p);
  p.tl = null;
  p.peca = null;
  p.quadro.replaceChildren();
  p.quadro.classList.toggle('vertical', p.formato === '9x16');
  const { largura, altura } = tokens.quadro[p.formato];
  const midias = midiasDe(p.f.valores);
  let html;
  try {
    html = documento({
      peca: { modelo: p.f.modelo, valores: p.f.valores, duracao: p.duracao },
      formato: p.formato,
      tokens,
      recursos: { ds: doDS, gsap: GSAP, midias, midia: midias.fundo ?? null },
      comuns: { cor_destaque: 'amarelo' },
    }).replace('</head>', `${DESFOQUE}</head>`);
  } catch (erro) {
    console.error(`Prévia de ${p.f.palavra}:`, erro);
    p.quadro.append(el('p', { className: 'quadro-aviso', text: 'Não consegui desenhar esta prévia.' }));
    return;
  }
  const aviso = el('p', { className: 'quadro-aviso', text: 'Carregando a prévia…' });
  const iframe = el('iframe', { tabindex: '-1', scrolling: 'no', 'aria-hidden': 'true', title: `Prévia da peça ${p.f.palavra}` });
  iframe.style.width = `${largura}px`;
  iframe.style.height = `${altura}px`;
  p.iframe = iframe;
  iframe.addEventListener('load', () => {
    let tentativas = 0;
    p.espera = setInterval(() => {
      if (p.iframe !== iframe) { clearInterval(p.espera); return; }
      const janela = iframe.contentWindow;
      const tl = janela?.__timelines?.main;
      if (!tl) {
        if (++tentativas > 250) { clearInterval(p.espera); aviso.textContent = 'Não consegui desenhar esta prévia.'; }
        return;
      }
      clearInterval(p.espera);
      aviso.remove();
      p.tl = tl;
      p.peca = janela.document.getElementById('peca');
      if (p.peca?.dataset.erro) console.error(`Prévia de ${p.f.palavra}:`, p.peca.dataset.erro);
      segurar(p);
      atualizar(p);
    }, 60);
  }, { once: true });
  iframe.srcdoc = html;
  p.quadro.append(aviso, iframe);
  escalar(p);
}

// Os iframes só nascem quando o cartão chega perto da tela, e o loop para nos que saem: são quase 30 prévias.
const naTela = new IntersectionObserver((entradas) => {
  for (const entrada of entradas) {
    const p = previas.get(entrada.target);
    if (!p) continue;
    p.visivel = entrada.isIntersecting;
    if (p.visivel && !p.iframe) montarPrevia(p);
    else atualizar(p);
  }
}, { rootMargin: '240px 0px' });

const aoRedimensionar = new ResizeObserver((entradas) => {
  for (const entrada of entradas) {
    const p = previas.get(entrada.target);
    if (p) escalar(p);
  }
});

function criarPrevia(f) {
  const ficha = fichas.pecas.find((x) => x.id === f.modelo);
  const duracao = duracaoAutomatica(ficha, f.valores, tokens);
  const quadro = el('div', { className: 'quadro', role: 'img', 'aria-label': `Prévia animada da peça ${f.palavra}, com o texto do exemplo` });
  const p = { f, formato: '16x9', duracao, quadro, iframe: null, tl: null, peca: null, visivel: false, inicio: 0, espera: 0 };
  previas.set(quadro, p);

  const botoes = [['16x9', 'Deitado (16x9)'], ['9x16', 'Short (9x16)']].map(([formato, rotulo]) => {
    const b = el('button', { type: 'button', className: 'pequeno', 'aria-pressed': String(formato === p.formato), text: rotulo });
    b.addEventListener('click', () => {
      if (p.formato === formato) return;
      p.formato = formato;
      for (const outro of botoes) outro.setAttribute('aria-pressed', String(outro === b));
      montarPrevia(p);
    });
    return b;
  });
  const segundos = duracao.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const barra = el('div', { className: 'previa-barra' },
    el('div', { className: 'formatos', role: 'group', 'aria-label': `Formato da prévia de ${f.palavra}` }, botoes),
    el('p', { className: 'tempo', text: `Fica cerca de ${segundos} s na tela` }),
  );
  naTela.observe(quadro);
  aoRedimensionar.observe(quadro);
  return el('div', { className: 'previa' }, quadro, barra);
}

function ligarPausa() {
  const botao = $('pausar');
  const mostrar = () => {
    // O nome do botão diz o que ele faz agora (no celular aparece só o verbo; o nome inteiro vai no aria-label).
    $('pausar-verbo').textContent = pausado ? 'Tocar' : 'Pausar';
    botao.setAttribute('aria-label', pausado ? 'Tocar animações' : 'Pausar animações');
  };
  const aplicar = () => {
    mostrar();
    for (const p of previas.values()) atualizar(p);
  };
  botao.addEventListener('click', () => { pausado = !pausado; aplicar(); });
  semMovimento.addEventListener('change', () => { pausado = semMovimento.matches; aplicar(); });
  mostrar();
}

// ---------- cartões ----------

function textoDoLimite(limite) {
  const um = (l) => (l.linhas === 1 ? `até ${l.car_linha} caracteres` : `até ${l.linhas} linhas de ${l.car_linha} caracteres`);
  const deitado = limite['16x9'];
  const short = limite['9x16'];
  if (deitado.linhas === short.linhas && deitado.car_linha === short.car_linha) return `Cabe ${um(deitado)}.`;
  return `Cabe ${um(deitado)} no vídeo deitado e ${um(short)} no short.`;
}

// Cada campo, na ordem: o nome, se é opcional, o que o exemplo põe ali e o limite da ficha (quando existe).
function listaDeCampos(f) {
  const partes = f.exemplo.slice(f.exemplo.indexOf(':') + 1).split('|').map((x) => x.trim());
  const itens = f.campos.map((campo, i) => {
    const opcional = /^\[.*\]$/.test(campo);
    const nome = opcional ? campo.slice(1, -1) : campo;
    // O último campo fica com o resto da linha (é assim que a Máquina lê).
    const noExemplo = (i === f.campos.length - 1 ? partes.slice(i).join(' | ') : partes[i]) ?? '';
    const limite = f.limites.find((l) => l.campo === i);
    return el('li', {},
      el('span', { className: 'campo-nome' }, nome, opcional && el('span', { className: 'etiqueta', text: 'opcional' })),
      el('span', { className: 'campo-exemplo' }, noExemplo ? ['No exemplo: ', el('q', { text: noExemplo })] : 'Não aparece no exemplo.'),
      limite && el('span', { className: 'campo-limite', text: textoDoLimite(limite) }),
    );
  });
  // Limite que não deu para ligar a um campo só: fica no fim, com o nome que a editora vê no app.
  for (const limite of f.limites.filter((l) => l.campo === null)) {
    itens.push(el('li', {}, el('span', { className: 'campo-nome', text: limite.rotulo }), el('span', { className: 'campo-limite', text: textoDoLimite(limite) })));
  }
  return el('ol', { className: 'campos' }, itens);
}

function cartao(f, atalhos) {
  const idTitulo = `t-${idDoCartao(f.palavra)}`;
  const topo = el('header', { className: 'cartao-topo' },
    el('div', { className: 'cartao-titulo' },
      el('h3', { id: idTitulo, text: f.palavra }),
      el('p', { className: 'modelo', text: `Peça: ${f.nome}` }),
    ),
    el('p', { className: 'quando', text: f.quando }),
  );
  const texto = el('div', { className: 'cartao-texto' },
    el('div', {}, el('h4', { text: 'Escreva assim' }), linhaComPalavra('code', 'linha', escrevaAssim(f))),
    el('div', {}, el('h4', { text: 'Exemplo' }), el('div', { className: 'com-botao' }, linhaComPalavra('code', 'linha exemplo', f.exemplo), botaoCopiar(f.exemplo, f.palavra))),
    el('div', {}, el('h4', { text: f.campos.length === 1 ? 'O campo' : 'Os campos, na ordem' }), listaDeCampos(f)),
    f.apelidos.length > 0 && el('p', { className: 'apelidos' }, 'Também vale: ', f.apelidos.flatMap((a, i) => [i ? ', ' : '', el('code', { text: `${a}:` })])),
    atalhos.length > 0 && el('div', { className: 'atalhos' },
      el('h4', { text: 'Atalhos' }),
      el('p', { text: 'A palavra já diz o resultado: você escreve só o resto.' }),
      atalhos.map((a) => el('div', { className: 'com-botao' }, linhaComPalavra('code', 'linha', escrevaAssim(a)), botaoCopiar(a.exemplo, a.palavra))),
    ),
    f.dica && el('div', { className: 'dica' }, el('h4', { text: 'Dica' }), el('p', { style: 'margin:0', text: f.dica })),
  );
  return el('article', { className: 'cartao', id: idDoCartao(f.palavra), 'aria-labelledby': idTitulo }, topo, criarPrevia(f), texto);
}

function desenharEtapas(dados) {
  const principais = dados.formatos.filter((f) => !f.atalho);
  for (const etapa of dados.etapas) {
    const daEtapa = principais.filter((f) => f.etapa === etapa.nome);
    if (!daEtapa.length) continue;
    const id = `etapa-${semAcento(etapa.nome)}`;
    $('etapas').append(el('section', { id, 'aria-labelledby': `t-${id}` },
      el('div', { className: 'etapa-topo' }, el('h2', { id: `t-${id}`, text: etapa.nome }), etapa.texto && el('p', { text: etapa.texto })),
      el('div', { className: 'cartoes' }, daEtapa.map((f) => cartao(f, dados.formatos.filter((a) => a.atalho && a.atalho_de === f.palavra)))),
    ));
    $('indice-links').append(el('a', { href: `#${id}`, text: etapa.nome }));
  }
  $('legenda-previas').hidden = false;
}

// ---------- cola rápida ----------

function desenharCola(dados) {
  const linhas = dados.formatos.map((f) => {
    const destino = idDoCartao(f.atalho ? f.atalho_de : f.palavra);
    const nota = f.atalho ? `atalho de ${f.atalho_de}` : f.apelidos.length ? `também vale: ${f.apelidos.join(', ')}` : '';
    const linha = el('tr', {},
      el('td', { className: 'c-peca' }, el('a', { href: `#${destino}`, text: f.palavra }), nota && el('small', { text: nota })),
      el('td', { className: 'c-escreva' }, linhaComPalavra('code', '', escrevaAssim(f))),
      el('td', { className: 'c-copiar' }, botaoCopiar(f.exemplo, f.palavra, 'Copiar')),
    );
    // A busca olha a palavra, os apelidos e o nome da peça (e, no atalho, a peça de que ele é atalho).
    linha.dataset.busca = semAcento([f.palavra, ...f.apelidos, f.nome, f.atalho_de ?? ''].join(' | '));
    return linha;
  });
  $('cola-linhas').append(...linhas);

  const filtrar = () => {
    const termo = semAcento($('busca').value).trim();
    let achadas = 0;
    for (const linha of linhas) {
      linha.hidden = termo !== '' && !linha.dataset.busca.includes(termo);
      if (!linha.hidden) achadas++;
    }
    $('busca-vazia').hidden = achadas > 0;
    $('busca-conta').textContent = termo === '' ? `${linhas.length} jeitos de pedir uma peça` : achadas === 0 ? 'Nenhuma peça achada' : achadas === 1 ? '1 peça achada' : `${achadas} peças achadas`;
  };
  $('busca').addEventListener('input', filtrar);
  filtrar();
}

// ---------- começo ----------

async function json(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) throw new Error(`${caminho}: ${resposta.status}`);
  return resposta.json();
}

try {
  const [dados, tokensLidos, fichasLidas] = await Promise.all([json('dados.json'), json('design-system/tokens-resolvidos.json'), json('design-system/pecas.json')]);
  tokens = tokensLidos;
  fichas = fichasLidas;
  ligarPausa();
  desenharCola(dados);
  desenharEtapas(dados);
  $('versao').textContent = `Máquina de Vídeos ${dados.versao} · NINJA Design System ${dados.design_system}`;
  $('estado').hidden = true;
  // Quem chegou por um link direto para uma peça (…#peca-tarja) vai até ela depois de a página montar.
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
} catch (erro) {
  console.error('Guia do Lettering:', erro);
  $('estado').textContent = 'Não consegui carregar as peças. Recarregue a página. Se continuar, avise quem cuida da Máquina de Vídeos.';
  $('estado').classList.add('erro');
}
