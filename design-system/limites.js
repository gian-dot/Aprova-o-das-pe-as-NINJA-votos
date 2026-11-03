// Limites de texto e duração das peças, lidos da ficha (pecas.json). O texto que passa do limite
// gera aviso; a letra nunca diminui (regra do Gian), exceto a chamada, que segue o ajuste do NINJA
// Design System (ajustarChamada).

const TEXTUAIS = new Set(['texto', 'texto_longo']);

// Limite da variável naquele formato: o próprio do formato vale no lugar do geral.
export function limiteDe(variavel, formato) {
  const l = variavel.limite;
  if (!l || l.linhas === undefined) return null;
  const proprio = l[formato] ?? {};
  return { linhas: proprio.linhas ?? l.linhas, car_linha: proprio.car_linha ?? l.car_linha };
}

// Quebra como a editora quebraria: respeita as quebras dela e junta palavras até o limite da linha.
export function quebrar(texto, carLinha) {
  const linhas = [];
  for (const paragrafo of String(texto ?? '').split(/\r?\n/)) {
    let atual = '';
    for (const palavra of paragrafo.split(/\s+/).filter(Boolean)) {
      if (atual && (atual + ' ' + palavra).length > carLinha) {
        linhas.push(atual);
        atual = palavra;
      } else {
        atual = atual ? `${atual} ${palavra}` : palavra;
      }
    }
    linhas.push(atual);
  }
  return linhas.filter((l, i) => l !== '' || i < linhas.length - 1);
}

export function avisos(ficha, valores, formato) {
  const lista = [];
  for (const v of ficha.variaveis) {
    const valor = valores[v.id];
    if (!TEXTUAIS.has(v.tipo) || typeof valor !== 'string' || valor.trim() === '') continue;
    const limite = limiteDe(v, formato);
    if (!limite) continue;
    const linhas = quebrar(valor.trim(), limite.car_linha);
    const longas = linhas.filter((l) => l.length > limite.car_linha);
    if (linhas.length > limite.linhas || longas.length > 0) {
      const motivo = longas.length > 0
        ? `tem linha com mais de ${limite.car_linha} caracteres`
        : `ocupa ${linhas.length} linhas`;
      lista.push({
        campo: v.id,
        formato,
        mensagem: `${v.rotulo} (${formato}) ${motivo}; o limite é ${limite.linhas} ${limite.linhas === 1 ? 'linha' : 'linhas'} de até ${limite.car_linha} caracteres. Encurte o texto.`,
      });
    }
  }
  return lista;
}

export function faltando(ficha, valores) {
  return ficha.variaveis
    .filter((v) => v.obrigatorio)
    .filter((v) => {
      const valor = valores[v.id];
      if (v.tipo === 'midia' || v.tipo === 'foto' || v.tipo === 'video') return !valor || !valor.arquivo;
      return typeof valor !== 'string' || valor.trim() === '';
    })
    .map((v) => v.rotulo);
}

// Caracteres ÷ 15 + 1 s, dentro do mínimo e máximo da ficha (comuns → duracao).
export function duracaoAutomatica(ficha, valores, tokens) {
  const [minimo, maximo] = ficha.duracao ?? [null, null];
  if (minimo === null || maximo === null) return tokens.duracao.sem_limite_na_ficha;
  const caracteres = ficha.variaveis
    .filter((v) => TEXTUAIS.has(v.tipo) && v.obrigatorio)
    .reduce((soma, v) => soma + String(valores[v.id] ?? '').trim().length, 0);
  const s = caracteres / tokens.duracao.caracteres_por_segundo + tokens.duracao.acrescimo;
  return Math.round(Math.min(maximo, Math.max(minimo, s)) * 10) / 10;
}

// Ajuste da chamada (regra do NINJA Design System do Thiago, GUIA-AGENTES.md): preferir 4 linhas;
// se não couber, reduzir a letra em até ~15%; se ainda não couber, voltar ao tamanho inicial e
// aceitar 5 linhas, reduzindo de novo. Nunca muda o texto. medir(texto, tamanho) → { linhas, alturaPx }.
// Autocontida (sem referências de fora): o documento da peça roda esta mesma função no navegador.
export function ajustarChamada({ texto, largura, altura, tamanhoInicial, minimo = 0, maximo = Infinity, medir }) {
  const inicial = Math.min(maximo, tamanhoInicial);
  const menor = Math.max(minimo, Math.round(inicial * 0.85));
  const tentativas = [];
  for (const maxLinhas of [4, 5]) {
    for (let s = inicial; ; s = Math.max(menor, s - Math.max(1, Math.round(s * 0.02)))) {
      const r = medir(texto, s);
      tentativas.push({ tamanho: s, linhas: r.linhas });
      if (r.linhas <= maxLinhas && r.alturaPx <= altura) return { tamanho: s, linhas: r.linhas, coube: true, tentativas };
      if (s === menor) break;
    }
  }
  const r = medir(texto, menor);
  return { tamanho: menor, linhas: r.linhas, coube: false, tentativas, largura };
}

// Valores iniciais de uma peça nova: os padrões da ficha.
export function valoresPadrao(ficha) {
  const valores = {};
  for (const v of ficha.variaveis) {
    if (v.padrao !== undefined) valores[v.id] = v.padrao;
    else if (v.tipo === 'opcao' && v.opcoes) valores[v.id] = v.opcoes[0];
    else if (TEXTUAIS.has(v.tipo)) valores[v.id] = '';
  }
  return valores;
}
