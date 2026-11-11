// Áudio obtido: cinco encaixes, um para cada tipo de imagem disponível. A onda de áudio se mexe em loop;
// cada módulo (selo, onda, fala, identificação) é opcional. Aprovado por todos na consulta (5 de 5).
// v2: compartilha etiqueta, identificação e contraste; preserva onda, segmentos e sincronização.
import { caixaAlta, esc } from '../base.js';
import { auto, bloco, chapeu, empilhar, familia, fundo, funcao, linhasDe, midia, onda, papel } from '../componentes.js';

export const id = 'audio_obtido';

export function montar({ valores: v, formato, tokens, recursos, duracao }) {
  const V = formato === '9x16';
  const encaixe = v.encaixe ?? 'foto da pessoa';
  const comOnda = v.onda !== false;
  const fala = linhasDe(v.transcricao).map((l) => `<span class="ln">${esc(caixaAlta(l))}</span>`).join('');
  const falaHtml = (tam, ordem) => (fala ? `<div class="a${ordem}" data-m="linhas" style="${papel(tokens, 'titulo', formato, { tamanho: tam })};color:#fff">${fala}</div>` : '');
  const selo = chapeu(tokens, formato, v.selo, { variante: 'branco', classes: 'a1' });
  const quem = funcao(tokens, v.quem, { classes: 'a4' });

  if (encaixe === 'print de WhatsApp') {
    const m = familia(tokens, 'manrope');
    const zap = `<div class="a1 sombra" data-m="escala" style="background:#0b141a;border-radius:32px;padding:32px;width:${V ? 800 : 680}px;text-align:left"><div style="${m};font-size:32px;color:#e9edef;padding-bottom:24px;border-bottom:1px solid #222">${esc(v.contato || 'Contato salvo')}</div><div style="background:#005c4b;border-radius:16px;padding:24px;margin-top:24px;display:flex;align-items:center;gap:20px"><span style="${m};font-size:40px;color:#fff">▶</span>${onda(26, '#d1f4cc', 48)}<span style="${m};font-size:24px;color:#d1f4cc">${esc(v.tempo_audio || '0:42')}</span></div></div>`;
    const f = fundo(tokens, formato, recursos, { tratamento: 'grao' });
    return { fundo: '', html: f.camadas + bloco(tokens, formato, { posicao: 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([zap, [falaHtml(V ? 84 : 92, 2), 32], [quem, 24]]) }) };
  }
  if (encaixe === 'tela dividida') {
    const pessoa = midia(recursos, 'imagem', { estilo: 'position:absolute;inset:0;width:100%;height:100%;filter:grayscale(1) contrast(1.1) brightness(.75)', vazia: 'Foto da pessoa' });
    const metade = V ? 'left:0;right:0;top:0;height:50%' : 'left:0;top:0;bottom:0;width:50%';
    const lado = V ? 'left:70px;right:70px;top:1000px' : 'left:1020px;right:60px;top:0;bottom:0;justify-content:center';
    return {
      fundo: '',
      html: `<div class="grao" style="position:absolute;inset:0"></div><div style="${metade};overflow:hidden">${pessoa}</div>` +
        `<div class="w1" style="${V ? 'left:0;right:0;top:958px;height:4px' : 'left:958px;top:0;bottom:0;width:4px'};background:var(--d)"></div>` +
        `<div class="area" style="${lado}">${empilhar([selo, [comOnda ? `<div class="a2">${onda(V ? 30 : 36)}</div>` : '', 32], [falaHtml(V ? 84 : 96, 3), 48], [quem, 24]])}</div>`,
    };
  }
  const semImagem = encaixe === 'sem imagem';
  const desfocada = encaixe === 'foto desfocada';
  const trat = semImagem ? 'grao' : desfocada ? 'desfoque' : 'degrade';
  const f = fundo(tokens, formato, recursos, { tratamento: trat, foco: v.foco, duracao, id: 'imagem', ancoras: ['.ancora'] });
  // Foto da pessoa: P&B, como o fundo do Economist.
  const fotoFundo = encaixe === 'foto da pessoa' ? f.fundo.replace('style="', 'style="filter:grayscale(1) contrast(1.1) brightness(.75);') : f.fundo;
  const ondaHtml = comOnda ? `<div class="a2 ancora">${onda(V ? 36 : semImagem ? 72 : 56)}</div>` : '';
  const itens = semImagem ? [ondaHtml, [falaHtml(V ? 104 : 120, 3), 48], [quem, 24]] : [`<div class="ancora">${selo}</div>`, [ondaHtml, 24], [falaHtml(V ? 92 : 104, 3), 32], [quem, 24]];
  const posicao = auto(v.posicao) ?? (semImagem || desfocada || V ? 'centro' : 'base esquerda');
  return { fundo: fotoFundo, html: f.camadas + bloco(tokens, formato, { posicao, dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar(itens) }) };
}

export const opaca = (v) => v.encaixe === 'sem imagem' || v.encaixe === 'print de WhatsApp' || v.encaixe === 'tela dividida';

const FALA = '“Ninguém pode\nsaber disso”';
export const exemplos = {
  'Foto da pessoa': { encaixe: 'foto da pessoa', selo: 'Áudio obtido pela NINJA', transcricao: FALA, quem: 'Ex-assessor · ligação de 14/10', imagem: { arquivo: 'exemplo-pessoa' } },
  'Foto desfocada': { encaixe: 'foto desfocada', selo: 'Áudio obtido pela NINJA', transcricao: FALA, imagem: { arquivo: 'exemplo-2' } },
  'Print de WhatsApp': { encaixe: 'print de WhatsApp', transcricao: '“Apaga depois que ouvir”', contato: 'Contato salvo', tempo_audio: '0:42' },
  'Sem imagem': { encaixe: 'sem imagem', transcricao: FALA },
  'Tela dividida': { encaixe: 'tela dividida', selo: 'Áudio obtido pela NINJA', transcricao: FALA, imagem: { arquivo: 'exemplo-pessoa' } },
};
