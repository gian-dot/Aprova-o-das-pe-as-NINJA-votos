// Junta o NINJA Design System do Thiago (design-system/ninja/, cópia fixa) com a nossa camada
// (tokens.json: motion, durações, saída, tratamentos de vídeo) num objeto só, no formato que as peças usam.
// Precedência do Thiago: fundamentos da marca → perfil da mídia → template. A nossa camada só acrescenta
// o que ele ainda não define; cor, fonte e margem nunca são escritas aqui nem no tokens.json.
// Roda no navegador (preview) e no Node (render, testes): recebe os JSON já lidos.

export const RAIZ_NINJA = 'ninja/';

// Perfil do Thiago usado em cada formato de vídeo da Máquina. 16x9 de vídeo ainda não existe no design
// system dele: usamos o da thumbnail (mesma dimensão) até ele aprovar um perfil de vídeo (proposta enviada).
export const PERFIL_DO_FORMATO = { '16x9': 'thumbnail_youtube', '9x16': 'reels' };

// Nome curto de cada família, usado pelas peças (tokens.fontes.<chave>).
const CHAVE_DA_FAMILIA = { TipoNinja: 'tipo', Manrope: 'manrope' };
const RESERVA = { TipoNinja: 'Impact, sans-serif' };

// "@font-face{font-family:TipoNinja;src:url(../recursos/x.otf);font-weight:500}" → { familia, arquivo, peso }
export function lerFontFace(css) {
  const familia = /font-family:\s*['"]?([^;'"}]+)/.exec(css)?.[1]?.trim();
  const url = /src:\s*url\(\s*['"]?([^)'"]+)/.exec(css)?.[1]?.trim();
  const peso = Number(/font-weight:\s*(\d+)/.exec(css)?.[1] ?? 400);
  if (!familia || !url) throw new Error(`Não entendi a fonte do design system do Thiago: ${css}`);
  const arquivo = RAIZ_NINJA + url.replace(/^(\.\.\/|\.\/)+/, '');
  return { familia, arquivo, peso };
}

function area(perfil, dimensao) {
  const s = perfil.area_segura ?? { x: 0, y: 0, largura: dimensao.largura, altura: dimensao.altura };
  const m = perfil.margens_conteudo ?? {};
  return {
    esquerda: s.x + (m.esquerda ?? 0),
    direita: dimensao.largura - (s.x + s.largura) + (m.direita ?? 0),
    topo: s.y + (m.topo ?? 0),
    base: dimensao.altura - (s.y + s.altura) + (m.base ?? 0),
  };
}

export function montarTokens({ nossos, fundamentos, marca, manifesto = {} }) {
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
    const perfil = fundamentos.perfis[id];
    if (!perfil) throw new Error(`O design system do Thiago não tem o perfil "${id}".`);
    quadro[formato] = { ...perfil.dimensao };
    areas[formato] = area(perfil, perfil.dimensao);
  }
  return {
    ...nossos,
    ds: { marca: fundamentos.marca, versao: manifesto.versao ?? null, contrato: manifesto.contrato ?? null },
    quadro,
    area: areas,
    cores: { preto, branco, ...(nossos.cores ?? {}), destaques },
    fontes,
    tipografia: fundamentos.tipografia,
    espacamentos: fundamentos.espacamentos,
    comportamentos: fundamentos.comportamentos,
  };
}

// ler(caminho relativo à pasta design-system/) → JSON. No navegador, um fetch; no Node, readFile.
export async function carregarTokens(ler) {
  const [nossos, fundamentos, marca, manifesto] = await Promise.all([
    ler('tokens.json'),
    ler(`${RAIZ_NINJA}fundamentos.json`),
    ler(`${RAIZ_NINJA}marca.json`),
    ler(`${RAIZ_NINJA}manifesto.json`),
  ]);
  return montarTokens({ nossos, fundamentos, marca, manifesto });
}
