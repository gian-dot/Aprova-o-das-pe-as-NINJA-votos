// Motor de animação único das peças NINJA: o mesmo no app (preview e render), no estúdio e na página
// de aprovação. Veio do estúdio v5 (commit 6b9cf35, auditado pelo Thiago); a v2 do design system
// (D9/D10) manda preservar movimentos, tempos, curvas e escalonamento. O que mudou depois disso veio
// da consulta da equipe (03/11) e está marcado com "consulta".
//
// Marcação nas peças:
//   classe a1..a9 / w1..w9  ordem de entrada (a = máscara subindo; w = varredura da esquerda)
//   data-m="..."            mascara | varredura | escala | carimbo | barras | colunas | linhas | desenhar
//                           | contar | girar | dissolver | presente (já na tela; só sai)
//                           | fixo (sem animação: entra e sai com o corte)
//   data-de="direita"       varredura vinda da direita
//   data-saida="varredura"  sai fechando a varredura (tarja), em vez de subir e sumir
//   data-atraso="0.6"       espera mais esse tempo antes de entrar
//   .hl                     grifo: desenha depois que o texto parou (.hl-revela: já entra com o texto)
//   .veu .blur .deg .esc .m-fundo   fundo: entra primeiro, sai por último
//   .onda                   barras de áudio em loop
// No elemento raiz: data-grifo="0.9" (duração do grifo), data-fundo-junto (fundo sai com o texto).
//
// Revisão motion-senior (pedido do Gian, 07/11, skill github.com/gian-dot/motion-senior), marcada com
// "motion-senior" no código:
//   - duração pelo peso: elemento pequeno (chapéu, função, fonte) entra em 0,5 s; grande (card, post) em 0,85 s
//   - saída a ~65% da entrada (0,45 s) e partes saindo com 2 quadros de diferença
//   - carimbo cai e bate (sem elástico, que não combina com checagem) e a imagem dá um pequeno tranco
//   - contador assenta antes da frase de apoio entrar
//   - foto de fundo nunca parada: aproximação lenta de 5% durante a peça, rumo ao ponto de foco
//   - grão vivo (muda a cada quadro, sempre igual no mesmo segundo) e respiro leve do texto no hold
//     das peças de tela cheia
//   - nenhum ease padrão do GSAP em movimento visível
//   - (11/11) a saída sempre termina dentro da duração: a fila de partes saindo é limitada a 0,2 s e
//     entra na reserva; conferido por design-system/galeria/auditoria.html
//   Pontos de som: comentários "SFX:" (a política está em docs/politicas/sfx.md).
(function (raiz) {
  const M = {
    entrada: 0.7, escalonar: 0.12, saida: 0.45, atraso_enfase: 0.25, segura: 2.4, pausa: 0.7,
    saida_fundo: 0.45, saida_fundo_atraso: 0.15, saida_fila: 0.2, grifo: 0.5,
    ease_entrada: 'expo.out', ease_varredura: 'power4.inOut', ease_saida: 'power3.in',
    // motion-senior: peso, câmera, grão e respiro.
    entrada_leve: 0.5, entrada_pesada: 0.85, leve_ate_px: 110, pesado_de_px: 520,
    aproximar: 0.05, respiro: 0.012, grao_qps: 24,
  };
  // motion-senior: leve = rápido, pesado = lento. Sem medida (fora do navegador), a duração de sempre.
  const duracaoDe = (el) => {
    const h = el.offsetHeight || 0;
    if (!h) return M.entrada;
    return h < M.leve_ate_px ? M.entrada_leve : h > M.pesado_de_px ? M.entrada_pesada : M.entrada;
  };
  const FUNDOS = '.veu,.blur,.deg,.esc,.m-fundo';
  const ordem = (el) => {
    if (el.dataset.o) return +el.dataset.o;
    const m = /(?:^|\s)[aw](\d)(?:\s|$)/.exec(el.className);
    return m ? +m[1] : 9;
  };
  const tipoDe = (el) => el.dataset.m || (/(?:^|\s)w\d/.test(el.className) ? 'varredura' : 'mascara');
  const fechado = (el) => (el.dataset.de === 'direita' ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)');

  function entrada(tl, el, t) {
    const tipo = tipoDe(el);
    if (tipo === 'fixo' || tipo === 'presente') return t;
    const d = duracaoDe(el);
    switch (tipo) {
      case 'varredura': // SFX: whoosh curto, 2 quadros antes
        tl.fromTo(el, { clipPath: fechado(el) }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d * 0.85, ease: M.ease_varredura }, t);
        break;
      case 'dissolver': // consulta (Luiza, 03/11): entrada e saída em dissolve, mais suave e mais lenta
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.inOut' }, t);
        break;
      case 'escala':
        tl.fromTo(el, { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: d, ease: M.ease_entrada }, t);
        break;
      case 'carimbo': { // cadência: espera a frase ser lida (e o risco), depois bate e assenta
        t += 1.0;
        // motion-senior: o carimbo cai acelerando (ease-in), achata 3% no impacto e assenta uma vez, sem
        // elástico. A imagem toda dá um tranco de 1,5% no impacto (câmera reativa).
        const bate = t + 0.24; // SFX: impacto (o som mais forte da peça), neste quadro
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: 'power1.out' }, t)
          .fromTo(el, { scale: 1.6, rotate: -14 }, { scale: 0.97, rotate: -6, duration: 0.24, ease: 'power3.in' }, t)
          .to(el, { scale: 1, duration: 0.3, ease: 'expo.out' }, bate);
        const palco = el.closest('#root');
        if (palco) tl.to(palco, { scale: 1.015, duration: 0.07, ease: 'power2.out' }, bate).to(palco, { scale: 1, duration: 0.4, ease: 'power3.out' }, bate + 0.07);
        return t;
      }
      case 'linhas': {
        const ls = el.querySelectorAll('.ln');
        if (el.dataset.suave !== undefined) { // consulta 03/11 (pergunta-gancho "brusca"): mais lenta e com dissolve
          tl.fromTo(ls, { clipPath: 'inset(0% 0% 100% 0%)', y: 20, opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1, duration: 0.95, ease: 'power3.out', stagger: 0.14 }, t);
          return t + ls.length * 0.14;
        }
        tl.fromTo(ls, { clipPath: 'inset(0% 0% 100% 0%)', y: 40 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: d, ease: M.ease_entrada, stagger: 0.09 }, t);
        return t + ls.length * 0.09;
      }
      case 'barras': {
        const bs = el.querySelectorAll('.br');
        tl.fromTo(el.querySelectorAll('.eixo'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, ease: 'power3.inOut' }, t);
        tl.fromTo(bs, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.7, ease: 'expo.out', stagger: 0.1 }, t + 0.35);
        tl.fromTo(el.querySelectorAll('.vl'), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', stagger: 0.1 }, t + 0.6);
        return t + 0.35 + bs.length * 0.1;
      }
      case 'colunas': {
        const bs = el.querySelectorAll('.br');
        tl.fromTo(el.querySelectorAll('.eixo'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, ease: 'power3.inOut' }, t);
        tl.fromTo(bs, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.75, ease: 'expo.out', stagger: 0.1 }, t + 0.35);
        tl.fromTo(el.querySelectorAll('.vl'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.1 }, t + 0.65);
        return t + 0.35 + bs.length * 0.1;
      }
      case 'desenhar': {
        const ps = el.querySelectorAll('path,circle,line,polyline');
        ps.forEach((p) => { const L = p.getTotalLength ? p.getTotalLength() : 1000; p.style.strokeDasharray = L; p.dataset.l = L; });
        tl.set(el, { opacity: 1 }, t);
        tl.fromTo(ps, { strokeDashoffset: (i, p) => +p.dataset.l }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.12 }, t);
        break;
      }
      case 'rosca': {
        const arcs = el.querySelectorAll('circle[data-len]');
        arcs.forEach((c) => { c.dataset.da = c.getAttribute('stroke-dasharray'); });
        tl.fromTo(arcs, { attr: { 'stroke-dasharray': (i, c) => `0 ${c.dataset.c}` } }, { attr: { 'stroke-dasharray': (i, c) => c.dataset.da }, duration: 0.7, ease: 'power3.out', stagger: 0.25 }, t);
        tl.fromTo(el.querySelectorAll('.vl'), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.12 }, t + 0.5);
        return t + arcs.length * 0.25;
      }
      case 'contar': {
        const alvo = el.querySelector('[data-v]') || el;
        const fim = +alvo.dataset.v, casas = +(alvo.dataset.casas || 0), obj = { v: 0 };
        const fmt = () => { alvo.textContent = obj.v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }); };
        tl.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: M.ease_entrada }, t);
        // motion-senior: chega rápido e assenta devagar (cauda longa); a frase de apoio espera o número
        // assentar (montar() lê el._libera). SFX: pop ou impacto no quadro em que o número assenta.
        tl.fromTo(obj, { v: 0 }, { v: fim, duration: 1.2, ease: 'expo.out', onUpdate: fmt }, t);
        el._libera = t + 0.9;
        return t + 0.6;
      }
      case 'girar':
        tl.fromTo(el, { opacity: 0, rotate: -90, scale: 0.6 }, { opacity: 1, rotate: 0, scale: 1, duration: 0.6, ease: M.ease_entrada }, t);
        break;
      default: // máscara: o bloco sobe de dentro da própria linha
        tl.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)', y: 48 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: d, ease: M.ease_entrada }, t);
        // Depois de entrar, a máscara sai (não corta sombra nem descendente).
        tl.set(el, { clipPath: 'none' }, t + d);
    }
    return t;
  }

  // Comportamentos que acontecem depois de tudo montado: destaque do grifo, zoom, troca de destaque
  // entre dois números, passagem da linha do tempo para o próximo marco.
  function depois(cv, tl, fim) {
    const focos = cv.querySelectorAll('.foco'), desf = cv.querySelectorAll('.desfoca');
    if (focos.length) {
      tl.to(desf, { filter: 'blur(6px)', opacity: 0.3, duration: 0.6, ease: 'power2.inOut' }, fim + 0.3);
      tl.to(focos, { scale: 1.06, transformOrigin: '0% 50%', duration: 0.6, ease: 'power2.inOut' }, fim + 0.3);
      fim += 1.2;
    }
    cv.querySelectorAll('[data-zoom]').forEach((z) => {
      tl.to(z, { scale: +z.dataset.zoom, transformOrigin: z.dataset.zoomOrigem || '30% 30%', duration: 1, ease: 'power2.inOut' }, fim + 0.3);
      fim += 1.4;
    });
    cv.querySelectorAll('[data-troca]').forEach((el) => {
      const a = el.querySelectorAll('.lado1'), b = el.querySelectorAll('.lado2');
      tl.set(b, { opacity: 0.3 }, 0);
      // data-troca-em: segundo absoluto escolhido pela editora; data-troca: segundos depois de montar.
      const tt = el.dataset.trocaEm ? Math.max(fim, +el.dataset.trocaEm) : fim + +el.dataset.troca;
      tl.to(a, { opacity: 0.3, duration: 0.5, ease: 'power2.inOut' }, tt).to(b, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, tt);
      fim = tt + 0.6;
    });
    // Fala contra fala: um lado em cor, o outro em P&B, e troca a cada data-alterna-s segundos (padrão 3,5).
    const ladoA = cv.querySelectorAll('[data-alterna="A"]'), ladoB = cv.querySelectorAll('[data-alterna="B"]');
    if (ladoA.length || ladoB.length) {
      const P = Number(cv.dataset.alternaS) || 3.5, cinza = 'grayscale(1) brightness(.5)';
      tl.set(ladoA, { filter: 'grayscale(0) brightness(1)' }, 0).set(ladoB, { filter: cinza }, 0);
      for (let k = 1, tt = P; tt < (cv._duracao || 2 * P); k++, tt += P) {
        tl.to(k % 2 ? ladoA : ladoB, { filter: cinza, duration: 0.4, ease: 'power2.inOut' }, tt).to(k % 2 ? ladoB : ladoA, { filter: 'grayscale(0) brightness(1)', duration: 0.4, ease: 'power2.inOut' }, tt);
      }
    }
    cv.querySelectorAll('.tl-marca').forEach((m) => {
      const tt = m.dataset.passaEm ? Math.max(fim, +m.dataset.passaEm) : fim + 1.0;
      tl.to(m, { x: +m.dataset.ate || 0, y: +m.dataset.atey || 0, duration: 0.9, ease: 'power3.inOut' }, tt);
      tl.to(cv.querySelectorAll('.tl-de'), { opacity: 0, y: -16, duration: 0.35, ease: M.ease_saida }, tt);
      tl.fromTo(cv.querySelectorAll('[data-tl="ate"]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: M.ease_entrada }, tt + 0.6);
      fim = tt + 1.3;
    });
    return fim;
  }

  // motion-senior: camadas de vida. Nada fica 100% parado numa peça de tela cheia. Tudo é função do tempo
  // da timeline (sem sorteio nem relógio): o render tira sempre o mesmo quadro no mesmo segundo.
  function vida(cv, tl, { total, fim, saida, cheia }) {
    // Peça que continua de outra ("já na tela"): sem aproximação nem respiro, para não pular no corte.
    if (cv.querySelector('[data-m="presente"]')) return;
    const palco = cv.closest('#root');
    // Foto de fundo: aproximação lenta rumo ao ponto de foco (o vídeo já tem movimento próprio).
    const foto = palco ? palco.querySelector('img#fundo') : null;
    if (foto) {
      const base = /scale\(([\d.]+)\)/.exec(foto.style.transform || '');
      const s = base ? +base[1] : 1;
      tl.fromTo(foto, { scale: s }, { scale: s * (1 + M.aproximar), transformOrigin: foto.style.objectPosition || '50% 50%', duration: total, ease: 'sine.inOut' }, 0);
    }
    // Grão: muda de posição a cada quadro (24 por segundo), pela conta do quadro, não por sorteio.
    const graos = cv.querySelectorAll('.grao');
    if (graos.length) {
      const q = { f: 0 };
      tl.to(q, { f: Math.ceil(total * M.grao_qps), duration: total, ease: 'none', onUpdate: () => {
        const k = Math.floor(q.f);
        const pos = `${(k * 73) % 240}px ${(k * 151) % 240}px`;
        graos.forEach((g) => { g.style.backgroundPosition = pos; });
      } }, 0);
    }
    // Respiro do texto no hold (só em tela cheia; tarja e crédito ficam sobre o vídeo, que já se move).
    const blocos = cv.querySelectorAll(':scope > .area');
    if ((cheia || foto || graos.length) && blocos.length && saida - fim > 0.6) {
      tl.fromTo(blocos, { scale: 1 }, { scale: 1 + M.respiro, duration: saida - fim + M.saida, ease: 'sine.inOut', immediateRender: false }, fim);
    }
  }

  // opcoes.duracao: peça do app (render e preview) — sem repetição, a saída termina no fim da duração.
  // Sem duração: estúdio e página de aprovação — loop com pausa.
  function montar(cv, opcoes = {}) {
    if (!raiz.gsap || cv._tl) return cv._tl;
    const gsap = raiz.gsap;
    const fundos = [...cv.querySelectorAll(FUNDOS)];
    const els = [...cv.querySelectorAll('*')].filter((el) =>
      typeof el.className === 'string' && (/(?:^|\s)[aw]\d(?:\s|$)/.test(el.className) || el.dataset.m) && el.dataset.m !== 'fixo');
    els.sort((a, b) => ordem(a) - ordem(b));
    const hls = [...cv.querySelectorAll('.hl')].filter((h) => !h.classList.contains('hl-revela'));
    const duracao = Number(opcoes.duracao) > 0 ? Number(opcoes.duracao) : null;
    cv._duracao = duracao;
    const tl = duracao ? gsap.timeline({ paused: true }) : gsap.timeline({ repeat: -1, repeatDelay: M.pausa, paused: true });
    // Opacidade final de cada fundo: a do estilo da peça, ou a padrão do tratamento.
    const OPAC = { veu: 0.55, esc: 0.72 };
    const opac = (el) => {
      if (el.style.opacity) return +el.style.opacity;
      for (const c in OPAC) if (el.classList.contains(c)) return OPAC[c];
      return 1;
    };
    // Lido antes de criar o tween: o fromTo já escreve opacity 0 no estilo.
    const finais = cv._opac || (cv._opac = fundos.map(opac));
    if (fundos.length) tl.fromTo(fundos, { opacity: 0 }, { opacity: (i) => finais[i], duration: 0.6, ease: 'power1.out' }, 0);
    let t = fundos.length ? 0.25 : 0.1, fim = t, grupo = null, libera = 0;
    for (const el of els) {
      const o = ordem(el);
      // motion-senior: o grupo seguinte espera o contador assentar (libera).
      if (grupo !== null && o !== grupo) t = Math.max(t + M.escalonar, libera);
      grupo = o;
      // data-atraso: espera a etapa anterior terminar (ex.: subtítulo só depois do grifo, consulta 03/11).
      if (el.dataset.atraso) t += +el.dataset.atraso;
      fim = Math.max(fim, entrada(tl, el, t) + duracaoDe(el));
      if (el._libera) libera = Math.max(libera, el._libera);
      // Frase checada como falsa: o risco se desenha depois de a frase ser lida.
      if (el.dataset.risco) tl.fromTo(el.querySelectorAll('.rsc'), { backgroundSize: '0% 12px' }, { backgroundSize: '100% 12px', duration: 0.6, ease: 'power2.inOut' }, t + 0.9);
    }
    if (hls.length) {
      const dg = Number(cv.dataset.grifo) || M.grifo;
      tl.fromTo(hls, { backgroundSize: '0% 82%' }, { backgroundSize: '100% 82%', duration: dg, ease: 'power2.inOut', stagger: dg * 0.56 }, fim - 0.2 + M.atraso_enfase);
      fim += M.atraso_enfase + hls.length * dg * 0.56 + 0.3;
    }
    fim = depois(cv, tl, fim);
    const juntos = cv.dataset.fundoJunto !== undefined;
    const ativos = [...els.slice().reverse(), ...cv.querySelectorAll('[data-tl="ate"]')];
    const varrem = ativos.filter((el) => el.dataset.saida === 'varredura');
    const dissolvem = ativos.filter((el) => el.dataset.m === 'dissolver');
    const sobem = ativos.filter((el) => !varrem.includes(el) && !dissolvem.includes(el));
    // motion-senior (Gian, 11/11): as partes saem com 2 quadros de diferença, mas a fila inteira nunca passa
    // de 0,2 s (peça com muitas partes aperta o intervalo). Esse tempo entra na reserva: antes, a saída de
    // quem tinha 2 partes ou mais terminava depois do fim da peça e o render cortava os últimos quadros.
    const passo = (n, cada) => (n > 1 ? Math.min(cada, M.saida_fila / (n - 1)) : 0);
    const passoSobem = passo(sobem.length, 0.066);
    const passoVarrem = passo(varrem.length, 0.06);
    const fila = Math.max(passoSobem * (sobem.length - 1), passoVarrem * (varrem.length - 1), 0);
    const atrasoFundo = juntos ? 0 : M.saida + M.saida_fundo_atraso;
    const durFundo = juntos ? M.saida + fila : M.saida_fundo;
    // Com duração: tudo (texto e fundo) termina 0,05 s antes do fim (último quadro já limpo).
    // Sem fundo, não reserva tempo para a saída do fundo (a tarja sai no mesmo momento da Máquina 1.0).
    const reserva = Math.max(M.saida + fila, fundos.length ? atrasoFundo + durFundo : 0);
    const saida = duracao ? Math.max(fim, duracao - 0.05 - reserva) : fim + M.segura;
    cv._pico = Math.min(fim + 0.2, saida);
    // Para a auditoria e o aviso de leitura do app: quando tudo assentou e quando a saída começa.
    cv._fim = fim;
    cv._saida = saida;
    if (sobem.length) tl.to(sobem, { opacity: 0, y: -24, duration: M.saida, ease: M.ease_saida, stagger: passoSobem }, saida);
    varrem.forEach((el, i) => tl.to(el, { clipPath: fechado(el), duration: M.saida, ease: M.ease_saida }, saida + i * passoVarrem));
    if (dissolvem.length) tl.to(dissolvem, { opacity: 0, duration: 0.7, ease: 'power1.inOut' }, Math.max(fim, saida - 0.3));
    if (fundos.length) tl.to(fundos, { opacity: 0, duration: durFundo, ease: 'power1.in' }, saida + atrasoFundo);
    const total = duracao ?? saida + M.saida + 0.6;
    tl.set({}, {}, total);
    vida(cv, tl, { total, fim, saida, cheia: fundos.length > 0 });
    cv._tl = tl;
    // Ondas de áudio: loop contínuo. No app, presas à timeline (o render precisa ser determinístico).
    cv.querySelectorAll('.onda').forEach((o) => {
      [...o.children].forEach((b, i) => {
        const v = { scaleY: 0.25 + ((i * 37) % 10) / 14, duration: 0.28 + ((i * 13) % 7) / 20, ease: 'sine.inOut', yoyo: true, delay: (i % 5) * 0.05 };
        if (duracao) tl.to(b, { ...v, repeat: Math.ceil(duracao / v.duration) }, 0);
        else gsap.to(b, { ...v, repeat: -1 });
      });
    });
    return tl;
  }

  // Segura a peça montada (para miniaturas, impressão e quem prefere sem movimento).
  function segurar(cv) { const tl = montar(cv); if (tl) tl.seek(cv._pico, false).pause(); }

  let obs = null;
  function observar(alvo) {
    const semMov = raiz.matchMedia && raiz.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!obs && 'IntersectionObserver' in raiz) {
      obs = new IntersectionObserver((es) => es.forEach((e) => {
        const cv = e.target, tl = cv._tl || montar(cv);
        if (!tl) return;
        if (semMov) { tl.seek(cv._pico, false).pause(); return; }
        e.isIntersecting ? tl.play() : tl.pause();
      }), { rootMargin: '120px' });
    }
    (alvo || document).querySelectorAll('.cv').forEach((cv) => {
      if (cv._observado) return;
      cv._observado = true;
      if (semMov) { segurar(cv); return; }
      if (obs) obs.observe(cv); else { const tl = montar(cv); if (tl) tl.play(); }
    });
  }
  raiz.NinjaMotion = { M, montar, segurar, observar };
})(typeof window !== 'undefined' ? window : globalThis);
