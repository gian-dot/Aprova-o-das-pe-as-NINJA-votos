// Pergunta-gancho / título em tarja. Cada linha da editora é uma faixa que mede o próprio texto (D8: padding
// 18 e texto centralizado visualmente); opção de caixa única (38). A palavra-chave ganha grifo ou cor
// depois que o texto para. Consulta 03/11: entrada mais suave (todos acharam brusca) e, no 9x16, faixas
// de verdade por linha (antes a linha do meio virava um bloco só).
import { caixaAlta } from '../base.js';
import { auto, bloco, caixa, chapeu, empilhar, fundo, grifar, linhasDe, semPontoFinal, tratamentoDe, trechosDe } from '../componentes.js';

export const id = 'pergunta_gancho';

export function montar({ valores: v, formato, tokens, recursos, duracao, destaque }) {
  const branca = v.cor_tarja === 'branca';
  const trechos = trechosDe(caixaAlta(v.palavras_destaque ?? ''));
  const classe = v.estilo_destaque === 'cor' ? 'dt' : 'hl';
  const linhas = linhasDe(semPontoFinal(caixaAlta(v.texto ?? ''))).map((l) => grifar(l, trechos, classe));
  const modo = v.caixa === 'única' ? 'unica' : 'faixas';
  const tarja = caixa(tokens, formato, linhas, {
    variante: modo, papel: 'titulo_tarja', fundo: branca ? '#fff' : '#000', corTexto: branca ? '#000' : '#fff',
    alinhar: String(auto(v.posicao) ?? 'centro').includes('esquerda') ? 'left' : 'center',
    classes: 'a2', atributos: modo === 'faixas' ? 'data-suave' : 'data-m="escala"',
  });
  const ch = chapeu(tokens, formato, v.chapeu, { variante: v.cor_chapeu === 'branco' ? 'branco' : 'destaque', classes: 'w1', destaque });
  const f = fundo(tokens, formato, recursos, { tratamento: tratamentoDe(v.tratamento), foco: v.foco, duracao });
  const html = bloco(tokens, formato, { posicao: auto(v.posicao) ?? 'centro', dx: v.deslocar_x, dy: v.deslocar_y, html: empilhar([ch, tarja], 20) });
  return { fundo: f.fundo, html: f.camadas + html };
}

export const exemplos = {
  'Tarja preta': { texto: 'Dinheiro\nprivado,\nFlávio?', palavras_destaque: 'privado', estilo_destaque: 'cor', fundo: { arquivo: 'exemplo-2' } },
  'Tarja branca com grifo': { texto: 'Você sabia que\nos políticos escolhem\nos eleitores?', palavras_destaque: 'escolhem', cor_tarja: 'branca', fundo: { arquivo: 'exemplo-1' } },
  'Com chapéu e véu': { chapeu: 'A pergunta da semana', texto: 'Quem paga\na conta da seca?', palavras_destaque: 'seca', estilo_destaque: 'cor', tratamento: 'véu 55%', fundo: { arquivo: 'exemplo-3' } },
  'Caixa única': { texto: 'Quem paga\na conta da seca?', palavras_destaque: 'seca', caixa: 'única', fundo: { arquivo: 'exemplo-3' } },
};
