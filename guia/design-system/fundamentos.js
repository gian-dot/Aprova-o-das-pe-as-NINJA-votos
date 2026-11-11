// Junta o NINJA Design System do Thiago (design-system/ninja/, cópia fixa) com a nossa camada
// (tokens.json: motion, durações, saída) e as variantes compartilhadas (variantes.json) num objeto só.
// Precedência da v2 (contrato-integracao.json): decisões explícitas → regra aprovada do contexto →
// fundamentos e perfil → variante legada local. Cor, fonte, margem e decisões D1–D8 nunca são escritas
// aqui nem no tokens.json: são lidas da cópia do Thiago.
// Roda no navegador (preview, estúdio) e no Node (render, testes): recebe os JSON já lidos.

export const RAIZ_NINJA = 'ninja/';

// Perfil da v2 usado em cada formato de vídeo (D2: vídeo horizontal com perfil próprio, não a thumbnail).
export const PERFIL_DO_FORMATO = { '16x9': 'video_horizontal', '9x16': 'reels' };

// Nome curto de cada família, usado pelas peças (tokens.fontes.<chave>).
const CHAVE_DA_FAMILIA = { TipoNinja: 'tipo', Manrope: 'manrope' };
// A TipoNinja não tem % nem º (Luiza, 03/11): o navegador busca esses sinais na Manrope do Thiago.
const RESERVA = { TipoNinja: "'Manrope',Impact,sans-serif" };

// "@font-face{font-family:TipoNinja;src:url(../recursos/x.otf);font-weight:500}" → { familia, arquivo, peso }
export function lerFontFace(css) {
  const familia = /font-family:\s*['"]?([^;'"}]+)/.exec(css)?.[1]?.trim();
  const url = /src:\s*url\(\s*['"]?([^)'"]+)/.exec(css)?.[1]?.trim();
  const peso = Number(/font-weight:\s*(\d+)/.exec(css)?.[1] ?? 400);
  if (!familia || !url) throw new Error(`Não entendi a fonte do design system do Thiago: ${css}`);
  const arquivo = RAIZ_NINJA + url.replace(/^(\.\.\/|\.\/)+/, '');
  return { familia, arquivo, peso };
}

// Área útil de cada perfil da v2 (margens a partir das bordas do quadro).
function area(perfil) {
  if (perfil.margens) {
    const m = perfil.margens;
    return { esquerda: m.esquerda, direita: m.direita, topo: m.topo, base: m.base };
  }
  const s = perfil.area_segura;
  const lado = perfil.margens_laterais ?? 0;
  return {
    esquerda: s.x + lado,
    direita: perfil.largura - (s.x + s.largura) + lado,
    topo: s.y,
    base: perfil.altura - (s.y + s.altura),
  };
}

export function montarTokens({ nossos, fundamentos, marca, versao = {}, contrato, variantes = {} }) {
  if (!contrato) throw new Error('Falta o contrato de integração do NINJA Design System (v2).');
  const c = fundamentos.cores;
  const { preto, branco, ...destaques } = c;
  const fontes = {};
  for (const css of marca.fontes_css ?? []) {
    const f = lerFontFace(css);
    fontes[CHAVE_DA_FAMILIA[f.familia] ?? f.familia.toLowerCase()] = { ...f, reserva: RESERVA[f.familia] ?? 'sans-serif' };
  }
  const quadro = {};
  const areas = {};
  for (const [formato, id] of Object.entries(PERFIL_DO_FORMATO)) {
    const perfil = contrato.perfis[id];
    if (!perfil) throw new Error(`O contrato do NINJA Design System não tem o perfil "${id}".`);
    quadro[formato] = { largura: perfil.largura, altura: perfil.altura };
    areas[formato] = area(perfil);
  }
  return {
    ...nossos,
    ds: { marca: fundamentos.marca, versao: versao.versao ?? null, contrato: contrato.versao ?? null, commit: versao.commit?.slice(0, 7) ?? null },
    perfil: { ...PERFIL_DO_FORMATO },
    quadro,
    area: areas,
    cores: { preto, branco, ...(nossos.cores ?? {}), destaques },
    fontes,
    tipografia: fundamentos.tipografia,
    espacamentos: fundamentos.espacamentos,
    comportamentos: fundamentos.comportamentos,
    // Decisões da v2 lidas do contrato: as peças referenciam, nunca copiam.
    v2: {
      chapeu_video: contrato.chapeu_video,
      caixa_texto: contrato.caixa_texto,
      contraste: contrato.contraste,
      encaixe_noticia: contrato.encaixe_noticia,
      motion: contrato.motion,
      legado: contrato.legado,
    },
    variantes,
  };
}

// ler(caminho relativo à pasta design-system/) → JSON. No navegador, um fetch; no Node, readFile.
export async function carregarTokens(ler) {
  const versao = await ler('ninja.versao.json');
  const pasta = versao.pasta ? `${RAIZ_NINJA}${versao.pasta}/` : RAIZ_NINJA;
  const manifesto = await ler(`${pasta}manifesto.json`);
  const [nossos, fundamentos, marca, contrato, variantes] = await Promise.all([
    ler('tokens.json'),
    ler(`${RAIZ_NINJA}fundamentos.json`),
    ler(`${RAIZ_NINJA}marca.json`),
    ler(`${pasta}${manifesto.contrato_integracao ?? 'contrato-integracao.json'}`),
    ler('variantes.json'),
  ]);
  return montarTokens({ nossos, fundamentos, marca, versao, contrato, variantes });
}
