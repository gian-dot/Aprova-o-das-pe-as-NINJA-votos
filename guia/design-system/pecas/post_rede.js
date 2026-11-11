// Post de rede social: cartão legível, preparado para texto longo, com foto opcional e números
// (comentários, compartilhamentos, curtidas) ligados por caixa de seleção em qualquer versão. v2: compartilha
// cartão e papéis de texto; preserva a identidade da rede e a autoria. Consulta 03/11: números desligados
// por padrão (Gian, Luiza); Instagram com vídeo saiu (o vídeo vai direto na timeline, Luiza).
import { esc } from '../base.js';
import { auto, bloco, cartao, familia, fundo, grifar, midia, semPontoFinal, temMidia, tratamentoDe, trechosDe } from '../componentes.js';

export const id = 'post_rede';

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const V = formato === '9x16';
  const ig = v.rede === 'Instagram';
  const texto = String(v.texto ?? '').trim();
  const longo = texto.length > 140;
  const largura = V ? 900 : longo ? 1200 : 1000;
  const m = familia(tokens, 'manrope');
  const perfil = temMidia(recursos, 'foto_perfil')
    ? midia(recursos, 'foto_perfil', { estilo: 'width:96px;height:96px;border-radius:50%;flex:none' })
    : '<div style="width:96px;height:96px;border-radius:50%;flex:none;background:#c9ced3"></div>';
  const selo = v.verificado ? ' <span style="color:#1d9bf0">●</span>' : '';
  const linha2 = ig ? esc(v.local ?? '') : [v.arroba ? `@${esc(String(v.arroba).replace(/^@/, ''))}` : '', esc(v.data ?? '')].filter(Boolean).join(' · ');
  const cab = `<div style="display:flex;gap:24px;align-items:center"><div>${perfil}</div><div><div style="${m};font-size:38px;color:#0f1419">${esc(v.nome ?? '')}${selo}</div><div style="${m};font-size:30px;color:#536471">${linha2}</div></div></div>`;
  const corpo = `<div data-ajustar="${V ? 760 : longo ? 520 : 420}" data-minimo="30" style="${m};font-size:${longo ? (V ? 42 : 40) : V ? 54 : 50}px;line-height:1.32;color:#0f1419;margin-top:28px">${grifar(semPontoFinal(texto), trechosDe(v.grifos))}</div>`;
  const imagem = temMidia(recursos, 'imagem') ? `<div style="margin-top:28px">${midia(recursos, 'imagem', { estilo: `display:block;width:100%;height:${V ? 460 : 420}px;border-radius:24px` })}</div>` : '';
  const nums = String(v.numeros ?? '').split('|').map((x) => x.trim());
  const numeros = v.mostrar_numeros
    ? `<div style="display:flex;gap:48px;margin-top:28px;${m};font-size:28px;color:#536471"><span>💬 ${esc(nums[0] ?? '')}</span><span>🔁 ${esc(nums[1] ?? '')}</span><span>♥ ${esc(nums[2] ?? '')}</span></div>`
    : '';
  const conteudo = ig ? cab + imagem + corpo : cab + corpo + imagem;
  const card = `<div class="a1 sombra" data-m="escala" style="border-radius:32px">${cartao(tokens, 'post', conteudo + numeros, { largura })}</div>`;
  const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(auto(v.tratamento) ?? 'desfoque'), foco: v.foco, duracao });
  return { fundo: f.fundo, html: f.camadas + bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: card }) };
}

export const exemplos = {
  'X · texto curto': { rede: 'X', nome: 'Nome Sobrenome', arroba: 'perfil', data: '2 nov', texto: 'Se o STF não agir até sexta, vamos às ruas. Ninguém fica pra trás', grifos: 'vamos às ruas', fundo: { arquivo: 'exemplo-2' } },
  'X · texto longo + números': { rede: 'X', nome: 'Nome Sobrenome', arroba: 'perfil', verificado: true, data: '2 nov', texto: 'Nota pública: a comunidade quilombola do Rio dos Macacos foi cercada hoje de manhã por homens armados. Pedimos que o Ministério Público e a Defensoria acompanhem o caso. Ninguém sai daqui sem resposta do governo', grifos: 'Ninguém sai daqui', mostrar_numeros: true, numeros: '2,1 mil | 8,4 mil | 31 mil', fundo: { arquivo: 'exemplo-2' } },
  'X · com foto': { rede: 'X', nome: 'Nome Sobrenome', arroba: 'perfil', data: '2 nov', texto: 'Olha o tamanho da fila pra vacina aqui no posto 👇', grifos: 'vacina', imagem: { arquivo: 'exemplo-3' }, fundo: { arquivo: 'exemplo-3' } },
  'Instagram · com foto': { rede: 'Instagram', nome: 'midianinja', local: 'Belém, PA', texto: 'Ato em Belém reúne 20 mil pessoas', grifos: '20 mil', imagem: { arquivo: 'exemplo-1' }, fundo: { arquivo: 'exemplo-1' } },
};
