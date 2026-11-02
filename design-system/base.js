// Peças pequenas que todos os componentes usam. Roda no navegador (preview) e no Node (render).

export function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function caixaAlta(texto) {
  return String(texto ?? '').toLocaleUpperCase('pt-BR');
}

// "font-family:…;font-weight:…" de uma fonte do tokens.json, com a reserva se o arquivo faltar.
export function fonte(tokens, chave) {
  const f = tokens.fontes[chave];
  if (!f) throw new Error(`Fonte "${chave}" não existe no tokens.json.`);
  return `font-family:'${f.familia}',${f.reserva};font-weight:${f.peso}`;
}

export function fontFaces(tokens, urlDe) {
  return Object.values(tokens.fontes)
    .map((f) => `@font-face{font-family:'${f.familia}';font-weight:${f.peso};src:url('${urlDe(f.arquivo)}')}`)
    .join('\n');
}

// A opção da ficha vem como "amarelo #FADF4B"; o hex sempre vale o que está no tokens.json.
export function corDestaque(tokens, comuns) {
  const escolha = String(comuns?.cor_destaque ?? '').split(' ')[0].toLowerCase();
  const destaques = tokens.cores.destaques;
  return destaques[escolha] ?? Object.values(destaques)[0];
}

// Texto já escapado; quebras de linha da editora viram <br>.
export function comQuebras(textoEscapado) {
  return textoEscapado.replace(/\r?\n/g, '<br>');
}

// Pinta a primeira ocorrência de `palavra` (sem diferenciar maiúsculas) na cor de destaque.
export function realcar(texto, palavra, cor) {
  const t = String(texto ?? '');
  const p = String(palavra ?? '').trim();
  const i = p ? t.toLocaleLowerCase('pt-BR').indexOf(p.toLocaleLowerCase('pt-BR')) : -1;
  if (i < 0) return comQuebras(esc(t));
  const antes = comQuebras(esc(t.slice(0, i)));
  const meio = comQuebras(esc(t.slice(i, i + p.length)));
  const depois = comQuebras(esc(t.slice(i + p.length)));
  return `${antes}<span style="color:${cor}">${meio}</span>${depois}`;
}

export function px(n) {
  return `${n}px`;
}

// Fundo de mídia (foto ou vídeo) em tela cheia, enquadrado pelo ponto de foco.
export function midiaDeFundo({ recursos, foco, duracao, filtro = '' }) {
  if (!recursos.midia) {
    return `<div id="fundo-vazio" style="position:absolute;inset:0;background:linear-gradient(160deg,#3a3a3a,#111)"></div>`;
  }
  const x = Number.isFinite(foco?.x) ? foco.x : 50;
  const y = Number.isFinite(foco?.y) ? foco.y : 50;
  const estilo = `position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:${x}% ${y}%;${filtro}`;
  if (recursos.midia.tipo === 'imagem') {
    return `<img id="fundo" class="clip" data-start="0" data-duration="${duracao}" src="${esc(recursos.midia.url)}" style="${estilo}" alt="">`;
  }
  return `<video id="fundo" class="clip" data-start="0" data-duration="${duracao}" src="${esc(recursos.midia.url)}" muted playsinline style="${estilo}"></video>`;
}
