// Urna da página de aprovação das peças: guarda votos e comentários numa planilha do Google.
// Instalação: script.google.com → Novo projeto → cole este arquivo → Implantar → Nova implantação →
// tipo "App da Web", executar como "Eu", quem pode acessar "Qualquer pessoa" → copie o endereço.
// Os votos vão para a aba "votos" da planilha abaixo (criada sozinha se não existir).

const PLANILHA_ID = '1-Yyh2sHVNoCPzENJPUdI1GY8-S2gCcGBDPhqI08qA94';
const ABA = 'votos';
const DECISOES = ['aprovada', 'ajustar', 'refazer', 'nenhuma', ''];

function planilha_() {
  const ss = SpreadsheetApp.openById(PLANILHA_ID);
  if (!ss.getSheetByName(ABA)) {
    const aba = ss.insertSheet(ABA);
    aba.appendRow(['data', 'peca', 'nome', 'decisao', 'comentario']);
    aba.setFrozenRows(1);
  }
  return ss;
}

function responder_(dados) {
  return ContentService.createTextOutput(JSON.stringify(dados)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const linhas = planilha_().getSheetByName(ABA).getDataRange().getValues().slice(1);
  const votos = linhas.map((r) => ({ em: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), peca: String(r[1]), nome: String(r[2]), decisao: String(r[3]), comentario: String(r[4]) }));
  return responder_({ votos });
}

// Texto curto, sem caracteres de controle e sem virar fórmula na planilha.
function limpar_(texto, max) {
  const t = String(texto == null ? '' : texto).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (erro) {
    return responder_({ ok: false, erro: 'Pedido inválido.' });
  }
  const peca = String(d.peca || '');
  const nome = limpar_(d.nome, 60);
  const decisao = String(d.decisao || '');
  const comentario = limpar_(d.comentario, 1500);
  if (!/^[a-z0-9-]{1,80}$/.test(peca) || !nome || DECISOES.indexOf(decisao) < 0 || (!decisao && !comentario)) {
    return responder_({ ok: false, erro: 'Pedido inválido.' });
  }
  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    planilha_().getSheetByName(ABA).appendRow([new Date(), peca, nome, decisao, comentario]);
  } finally {
    trava.releaseLock();
  }
  return responder_({ ok: true });
}
