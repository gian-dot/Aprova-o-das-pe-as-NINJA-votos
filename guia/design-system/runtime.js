// Passos que cada peça roda no navegador antes de animar, na ordem pedida pela v2 do NINJA Design System
// (contrato dos componentes): carregar fontes → resolver texto → medir caixas → compor contraste →
// ligar a animação existente. O mesmo arquivo roda no preview do app, no render e no estúdio.
//
//   [data-caixa]      caixa de texto: o padding visível (data-pad) é medido nas letras de verdade, para o
//                     texto ficar centralizado visualmente (D8), com acentos e descendentes.
//                     data-caixa="area" (chapéu, V4): mantém a altura da caixa e centraliza só a tinta.
//   [data-encaixe]    texto com política de encaixe (data-encaixe = JSON da política; ver limites.js).
//   [data-degrade]    degradê editorial (D5): 0% a 80 px acima da âncora, 100% no fim visível da foto.
//   [data-ajustar]    texto que diminui até caber na caixa (documento, post); nunca muda o conteúdo.
(function (raiz) {
  const medidor = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

  // Posição no layout (sem transformações de animação) em relação a `ref`.
  function topo(el, ref) {
    let y = 0;
    for (let n = el; n && n !== ref; n = n.offsetParent) y += n.offsetTop;
    return y;
  }

  function tinta(texto, estilo, tamanho) {
    medidor.font = `${estilo.fontStyle} ${estilo.fontWeight} ${tamanho}px ${estilo.fontFamily}`;
    const m = medidor.measureText(texto || 'H');
    return { sobe: m.actualBoundingBoxAscent, desce: m.actualBoundingBoxDescent, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent };
  }

  // D8: o espaço entre a tinta das letras e a borda da caixa é o mesmo em cima e embaixo.
  function centrar(raizEl) {
    for (const el of raizEl.querySelectorAll('[data-caixa]')) {
      const pad = Number(el.dataset.pad) || 0;
      const e = getComputedStyle(el);
      const tamanho = parseFloat(e.fontSize);
      const linha = parseFloat(e.lineHeight) || tamanho;
      const linhas = (el.innerText || el.textContent || '').split('\n').filter((l) => l.trim());
      const primeira = tinta(linhas[0] ?? '', e, tamanho);
      const ultima = tinta(linhas[linhas.length - 1] ?? '', e, tamanho);
      // Linha de base dentro da caixa de linha: metade da entrelinha + ascendente da fonte.
      const base = (m) => (linha - (m.asc + m.desc)) / 2 + m.asc;
      const sobra = base(primeira) - primeira.sobe;
      const falta = linha - (base(ultima) + ultima.desce);
      if (el.dataset.caixa === 'area') {
        // V4 (chapéu): a altura da caixa não muda; só a tinta das letras vai para o centro dela (tolerância 1 px).
        const desvio = (falta - sobra) / 2;
        el.style.paddingTop = `${Math.max(0, pad + desvio)}px`;
        el.style.paddingBottom = `${Math.max(0, pad - desvio)}px`;
      } else {
        el.style.paddingTop = `${Math.max(0, pad - sobra)}px`;
        el.style.paddingBottom = `${Math.max(0, pad - falta)}px`;
      }
      el.dataset.centrada = 'sim';
    }
  }

  function encaixar(raizEl, ajustar) {
    for (const el of raizEl.querySelectorAll('[data-encaixe]')) {
      const cfg = JSON.parse(el.dataset.encaixe);
      const medir = (texto, tamanho) => {
        el.style.fontSize = `${tamanho}px`;
        const linha = parseFloat(getComputedStyle(el).lineHeight) || tamanho;
        const altura = el.offsetHeight;
        // Largura real: a linha mais larga não pode passar da área (v2: medir largura, não só linhas).
        const largura = el.scrollWidth;
        return { linhas: Math.max(1, Math.round(altura / linha)), alturaPx: altura, larguraPx: largura };
      };
      const r = ajustar({ ...cfg, texto: el.textContent, medir });
      el.style.fontSize = `${r.tamanho}px`;
      el.dataset.tamanho = r.tamanho;
      el.dataset.linhas = r.linhas;
      el.dataset.etapa = r.etapa;
      el.dataset.coube = r.coube ? 'sim' : 'nao';
    }
  }

  // Texto de documento ou post: diminui em passos de 4% até caber na altura da caixa (data-ajustar=px).
  function caber(raizEl) {
    for (const el of raizEl.querySelectorAll('[data-ajustar]')) {
      const max = Number(el.dataset.ajustar);
      const minimo = Number(el.dataset.minimo) || 0;
      let s = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollHeight > max && s * 0.96 >= minimo) {
        s *= 0.96;
        el.style.fontSize = `${s}px`;
      }
      el.dataset.tamanho = Math.round(s * 10) / 10;
      el.dataset.coube = el.scrollHeight <= max ? 'sim' : 'nao';
    }
  }

  // Faixas de texto (D8): nenhuma quebra por dentro; se a mais larga passar da área, todas diminuem juntas.
  function caberLargura(raizEl) {
    for (const el of raizEl.querySelectorAll('[data-largura-max]')) {
      const max = Number(el.dataset.larguraMax);
      const linhas = [...el.querySelectorAll('.ln')];
      if (!linhas.length) continue;
      let s = parseFloat(getComputedStyle(linhas[0]).fontSize);
      const larga = () => Math.max(...linhas.map((l) => l.offsetWidth));
      while (larga() > max && s > 24) {
        s *= 0.96;
        for (const l of linhas) l.style.fontSize = `${s}px`;
      }
      el.dataset.tamanho = Math.round(s * 10) / 10;
    }
  }

  function degradar(raizEl) {
    for (const el of raizEl.querySelectorAll('[data-degrade]')) {
      const cfg = JSON.parse(el.dataset.degrade);
      const ancora = cfg.ancoras.map((s) => raizEl.querySelector(s)).find(Boolean);
      if (!ancora) continue;
      const inicio = Math.max(0, topo(ancora, raizEl) - cfg.distancia);
      const fim = Math.max(inicio + 1, cfg.fim_foto);
      el.style.top = `${inicio}px`;
      el.style.height = `${fim - inicio}px`;
      el.dataset.inicio = Math.round(inicio);
      el.dataset.fim = Math.round(fim);
    }
  }

  // Prepara a peça e devolve a timeline. opcoes.duracao: app (sem loop); opcoes.registrar: render.
  async function preparar(raizEl, opcoes = {}) {
    if (raizEl._preparada) return raizEl._preparada;
    raizEl._preparada = (async () => {
      const doc = raizEl.ownerDocument;
      let tl = null;
      try {
        if (doc.fonts) {
          const familias = new Set();
          for (const el of raizEl.querySelectorAll('*')) familias.add(getComputedStyle(el).fontFamily);
          await Promise.all([...familias].map((f) => doc.fonts.load(`400 40px ${f}`).catch(() => null)));
          await doc.fonts.ready;
        }
        centrar(raizEl);
        if (raiz.NinjaEncaixe) encaixar(raizEl, raiz.NinjaEncaixe);
        caber(raizEl);
        centrar(raizEl);
        caberLargura(raizEl);
        centrar(raizEl);
        degradar(raizEl);
        tl = raiz.NinjaMotion ? raiz.NinjaMotion.montar(raizEl, { duracao: opcoes.duracao }) : null;
      } catch (erro) {
        // Uma falha aqui não pode travar o render: a peça sai parada e o erro fica marcado para o preview.
        raizEl.dataset.erro = String(erro && erro.message || erro);
        if (raiz.console) raiz.console.error('Peça NINJA:', erro);
      } finally {
        raizEl.dataset.pronto = 'sim';
        if (!tl && raiz.gsap) tl = raiz.gsap.timeline({ paused: true }).set({}, {}, Number(opcoes.duracao) || 1);
        if (opcoes.registrar && tl) {
          raiz.__timelines = raiz.__timelines || {};
          raiz.__timelines.main = tl;
        }
      }
      return tl;
    })();
    return raizEl._preparada;
  }

  raiz.NinjaRuntime = { preparar, centrar, encaixar, caber, degradar };
})(typeof window !== 'undefined' ? window : globalThis);
