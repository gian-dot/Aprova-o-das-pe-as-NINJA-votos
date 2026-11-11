// Composições do app, na ordem da página de aprovação (abrir → situar → provar → explicar → citar → fechar).
// Em espera, sem componente (decisão do Thiago e do Gian): transições e fundos. Fora: CTA e legenda (a
// equipe estiliza a legenda no Premiere; ver docs/specs/2026-11-04-consulta-encerrada-e-modelos.md).
import * as chamadaCentral from './chamada_central.js';
import * as perguntaGancho from './pergunta_gancho.js';
import * as mancheteVeiculo from './manchete_veiculo.js';
import * as capitulo from './capitulo.js';
import * as etiquetaTema from './etiqueta_tema.js';
import * as palavraConceito from './palavra_conceito.js';
import * as tarjaNome from './tarja_nome.js';
import * as localizacao from './localizacao.js';
import * as linhaTempo from './linha_tempo.js';
import * as documento from './documento.js';
import * as postRede from './post_rede.js';
import * as audioObtido from './audio_obtido.js';
import * as printTela from './print_tela.js';
import * as telaDividida from './tela_dividida.js';
import * as numero from './numero.js';
import * as numeroVideo from './numero_video.js';
import * as grafico from './grafico.js';
import * as comparacao from './comparacao.js';
import * as sabeNaoSabe from './sabe_nao_sabe.js';
import * as checagem from './checagem.js';
import * as citacao from './citacao.js';
import * as credito from './credito.js';
import * as cartaoFinal from './cartao_final.js';

export const pecas = [
  chamadaCentral, perguntaGancho, mancheteVeiculo, capitulo, etiquetaTema, palavraConceito,
  tarjaNome, localizacao, linhaTempo,
  documento, postRede, audioObtido, printTela, telaDividida,
  numero, numeroVideo, grafico, comparacao, sabeNaoSabe, checagem,
  citacao, credito,
  cartaoFinal,
];
