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
// motion-senior (Gian, 07/11): nunca menos que o tempo de leitura depois de montado — palavras ÷ 3 + 0,5 s
// (mínimo 1,2 s), mais o tempo de a peça montar e sair. A leitura conta todo texto preenchido que aparece
// (frase de apoio, chapéu, fonte), não só os obrigatórios; marcações de palavras já escritas (destaque,
// grifo) e campos de tempo não contam.
const NAO_E_LEITURA = /destaque|grifo|riscado|comeca_em|passa_para/;
const contarPalavras = (t) => t.split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
export function duracaoAutomatica(ficha, valores, tokens) {
  const [minimo, maximo] = ficha.duracao ?? [null, null];
  if (minimo === null || maximo === null) return tokens.duracao.sem_limite_na_ficha;
  const texto = (v) => String(valores[v.id] ?? '').trim();
  const caracteres = ficha.variaveis
    .filter((v) => TEXTUAIS.has(v.tipo) && v.obrigatorio)
    .reduce((soma, v) => soma + texto(v).length, 0);
  const palavras = ficha.variaveis
    .filter((v) => TEXTUAIS.has(v.tipo) && !NAO_E_LEITURA.test(v.id))
    .reduce((soma, v) => soma + contarPalavras(texto(v)), 0);
  const d = tokens.duracao;
  // Modelo que demora mais para montar (carimbo, contador, gráfico, grifo) traz o próprio tempo na ficha.
  const montarESair = ficha.montar_e_sair ?? d.montar_e_sair;
  const leitura = Math.max(d.leitura_minima, palavras / d.palavras_por_segundo + d.leitura_acrescimo) + montarESair;
  const s = Math.max(caracteres / d.caracteres_por_segundo + d.acrescimo, leitura);
  return Math.round(Math.min(maximo, Math.max(minimo, s)) * 10) / 10;
}

// Encaixe de notícia (NINJA Design System v2, contrato → encaixe_noticia): tentar o tamanho inicial;
// reduzir até ~15% em quatro linhas; restaurar o inicial e tentar cinco; depois reduzir até o piso do
// contexto (Reels: 64 px). Sem piso declarado (vídeo horizontal), desce até caber na área. Confere a
// largura real além de linhas e altura. Nunca muda o texto.
// medir(texto, tamanho) → { linhas, alturaPx, larguraPx? }.
// Autocontida (sem referências de fora): o documento da peça roda esta mesma função no navegador.
export function ajustarChamada({ texto, largura, altura, tamanhoInicial, minimo = 0, maximo = Infinity, linhasPreferidas = 4, reducao = 0.15, medir }) {
  const inicial = Math.min(maximo, tamanhoInicial);
  const primeiro = Math.max(minimo, Math.round(inicial * (1 - reducao)));
  const piso = minimo > 0 ? minimo : 8;
  const passo = (s) => Math.max(1, Math.round(s * 0.02));
  const tentativas = [];
  const cabe = (r, maxLinhas) => r.linhas <= maxLinhas && r.alturaPx <= altura && (r.larguraPx ?? 0) <= largura + 0.5;
  const etapas = [
    { maxLinhas: linhasPreferidas, ate: primeiro, nome: (s) => (s === inicial ? 'quatro' : 'quatro_reducao_15') },
    { maxLinhas: linhasPreferidas + 1, ate: piso, nome: (s) => (s === inicial ? 'cinco' : s >= primeiro ? 'cinco_reducao_15' : 'cinco_reducao_ate_piso') },
  ];
  for (const etapa of etapas) {
    for (let s = inicial; ; s = Math.max(etapa.ate, s - passo(s))) {
      const r = medir(texto, s);
      tentativas.push({ tamanho: s, linhas: r.linhas, maxLinhas: etapa.maxLinhas });
      if (cabe(r, etapa.maxLinhas)) return { tamanho: s, linhas: r.linhas, coube: true, etapa: etapa.nome(s), tentativas };
      if (s <= etapa.ate) break;
    }
  }
  const r = medir(texto, piso);
  return { tamanho: piso, linhas: r.linhas, coube: false, etapa: 'revisar', tentativas, largura };
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
