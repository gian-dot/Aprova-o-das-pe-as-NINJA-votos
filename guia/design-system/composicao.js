// Junta a composição da peça, os componentes e os tokens num documento HyperFrames completo. O mesmo
// documento serve para o preview do app (num iframe) e para o render: o que a editora vê é o que sai.
// Ordem dentro do documento (v2): fontes → texto e caixas medidos → contraste → animação existente.
import { corDestaque, fontFaces } from './base.js';
import { cssBase } from './componentes.js';
import { ajustarChamada } from './limites.js';
import { pecas } from './pecas/index.js';

// Só as peças com componente aparecem no app; as outras fichas esperam o componente existir.
export const componentes = Object.fromEntries(pecas.map((c) => [c.id, c]));

export const FORMATOS = ['16x9', '9x16'];

// Nomes antigos de peças (antes do NINJA Design System) que continuam abrindo em projetos salvos.
export const APELIDOS = Object.fromEntries(
  Object.values(componentes).flatMap((c) => (c.apelidos ?? []).map((a) => [a, c.id])),
);

export function canonico(modelo) {
  return APELIDOS[modelo] ?? modelo;
}

// Gian (03/11): sem mídia, a peça sai com transparência (MOV); com foto ou vídeo, em MP4 H.264.
// Fundo preto com grão também é opaco.
export function saidaDa(peca) {
  const temMidia = (v) => Object.values(v ?? {}).some((x) => x && typeof x === 'object' && x.arquivo);
  const valores = [peca.valores, peca.derivar_9x16 === false ? peca.valores_9x16 : null];
  const componente = componentes[canonico(peca.modelo)];
  const opaca = valores.some((v) => v && (temMidia(v) || componente?.opaca?.(v)));
  return opaca ? 'video' : 'transparente';
}

// Pacote 360 (v2, T15): não é um template único; cada saída usa a própria composição e o próprio perfil.
// A thumbnail é o template aprovado do Thiago (noticia_ninja_thumbnail), feito fora do vídeo.
export function pacote360(peca) {
  return [
    { saida: 'reels', formato: '9x16', perfil: 'reels', composicao: canonico(peca.modelo) },
    { saida: 'video', formato: '16x9', perfil: 'video_horizontal', composicao: canonico(peca.modelo) },
    { saida: 'thumbnail', formato: '16x9', perfil: 'thumbnail_youtube', template: 'noticia_ninja_thumbnail' },
  ];
}

const FEATURES = '"calt" 0,"liga" 0,"clig" 0,"dlig" 0,"hlig" 0,"salt" 0,"swsh" 0,"cswh" 0,"titl" 0,' +
  Array.from({ length: 20 }, (_, i) => `"ss${String(i + 1).padStart(2, '0')}" 0`).join(',');

// recursos.ds(caminho) dá o endereço de um arquivo do design system; recursos.midias[id], o de cada foto ou
// vídeo da peça ({ url, tipo: 'video' | 'imagem', foco }); recursos.midia, o do fundo (projetos antigos);
// recursos.gsap, o do GSAP.
export function documento({ peca, formato, tokens, recursos, comuns = {} }) {
  const componente = componentes[canonico(peca.modelo)];
  if (!componente) throw new Error(`A peça "${peca.modelo}" ainda não tem componente no design system.`);
  if (!FORMATOS.includes(formato)) throw new Error(`Formato inválido: ${formato}`);
  const { largura, altura } = tokens.quadro[formato];
  const duracao = peca.duracao;
  const destaque = corDestaque(tokens, comuns);
  const valores = (formato === '9x16' && peca.derivar_9x16 === false && peca.valores_9x16) || peca.valores;
  const p = componente.montar({ valores, comuns, formato, tokens, recursos, duracao, destaque });
  // O HyperFrames só extrai quadros de <video> com data-start/data-duration: marca todos (grade, lados…).
  const marcar = (html) => String(html ?? '').replace(/<video(?![^>]*data-start)/g, `<video data-start="0" data-duration="${duracao}"`);
  p.fundo = marcar(p.fundo);
  p.html = marcar(p.html);
  const raiz = Object.entries(p.raiz ?? {}).map(([k, v]) => ` data-${k}="${String(v).replace(/"/g, '&quot;')}"`).join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${largura}, height=${altura}">
<script src="${recursos.gsap}"></script>
<script src="${recursos.ds('motion.js')}"></script>
<script src="${recursos.ds('runtime.js')}"></script>
<style>
${fontFaces(tokens, recursos.ds)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${largura}px;height:${altura}px;overflow:hidden;background:transparent}
#root{position:relative;width:100%;height:100%;overflow:hidden;--d:${destaque}}
#peca{position:absolute;inset:0}
${cssBase(tokens)}
${p.css ?? ''}
/* TipoNinja: alternativos e ligaturas desligados (fundamentos do Thiago) */
#peca,#peca *{font-feature-settings:${FEATURES} !important;font-variant-ligatures:none !important}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${duracao}" data-width="${largura}" data-height="${altura}">
${p.fundo ?? ''}
<div id="peca" class="clip" data-start="0" data-duration="${duracao}" data-layout-allow-overflow data-formato="${formato}" data-ds="${tokens.ds.versao}"${raiz}>${p.html}</div>
</div>
<script>
window.NinjaEncaixe = ${ajustarChamada.toString()};
NinjaRuntime.preparar(document.getElementById('peca'), { duracao: ${Number(duracao)}, registrar: true });
</script>
</body>
</html>
`;
}
