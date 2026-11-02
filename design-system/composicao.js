// Junta o componente da peça e os tokens num documento HyperFrames completo. O mesmo documento
// serve para o preview do app (num iframe) e para o render: o que a editora vê é o que sai.
import { corDestaque, fontFaces } from './base.js';
import * as credito from './pecas/credito.js';
import * as mancheteCentral from './pecas/manchete_central.js';
import * as tarjaNome from './pecas/tarja_nome.js';

// Só as peças com componente aparecem no app; as outras fichas esperam o componente existir.
export const componentes = {
  [mancheteCentral.id]: mancheteCentral,
  [tarjaNome.id]: tarjaNome,
  [credito.id]: credito,
};

export const FORMATOS = ['16x9', '9x16'];

function json(dados) {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}

// recursos.ds(caminho) dá o endereço de um arquivo do design system; recursos.midia, o da mídia de
// fundo ({ url, tipo: 'video' | 'imagem' }) ou null; recursos.gsap, o do GSAP.
export function documento({ peca, formato, tokens, recursos, comuns = {} }) {
  const componente = componentes[peca.modelo];
  if (!componente) throw new Error(`A peça "${peca.modelo}" ainda não tem componente no design system.`);
  if (!FORMATOS.includes(formato)) throw new Error(`Formato inválido: ${formato}`);
  const { largura, altura } = tokens.quadro[formato];
  const duracao = peca.duracao;
  const destaque = corDestaque(tokens, comuns);
  const valores = (formato === '9x16' && peca.derivar_9x16 === false && peca.valores_9x16) || peca.valores;
  const p = componente.montar({ valores, comuns, formato, tokens, recursos, duracao, destaque });

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${largura}, height=${altura}">
<script src="${recursos.gsap}"></script>
<style>
${fontFaces(tokens, recursos.ds)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${largura}px;height:${altura}px;overflow:hidden;background:transparent}
#root{position:relative;width:100%;height:100%;overflow:hidden}
#peca{position:absolute;inset:0}
${p.css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${duracao}" data-width="${largura}" data-height="${altura}">
${p.fundo}
<div id="peca" class="clip" data-start="0" data-duration="${duracao}" data-layout-allow-overflow>${p.html}</div>
</div>
<script>
(function () {
  var animacoes = ${json(p.animacoes)};
  var tl = gsap.timeline({ paused: true });
  var vistos = {};
  animacoes.forEach(function (a) {
    var para = Object.assign({}, a.para, { duration: a.duracao, ease: a.ease });
    if (!a.de) { tl.to(a.alvo, para, a.em); return; }
    // A segunda animação do mesmo elemento não pode aplicar o estado inicial no quadro 0.
    if (vistos[a.alvo]) para.immediateRender = false;
    vistos[a.alvo] = true;
    tl.fromTo(a.alvo, a.de, para, a.em);
  });
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
})();
</script>
</body>
</html>
`;
}
