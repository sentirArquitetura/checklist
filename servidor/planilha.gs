/**
 * Sentir Arquitetura — registro dos checklists em uma planilha do Google.
 *
 * Recebe o que a landing page envia (core/funil.ts) e grava uma linha por
 * visitante na aba "Checklists":
 *   - no cadastro, a linha nasce com nome, WhatsApp e e-mail;
 *   - em "Visualizar Resultado", a mesma linha ganha o resultado.
 * Se o visitante refaz o checklist e visualiza de novo, a linha é atualizada.
 *
 * Como publicar (passo a passo completo no README):
 *   1. Na planilha: Extensões → Apps Script. Apague tudo e cole este arquivo.
 *   2. Implantar → Nova implantação → App da Web.
 *      Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 *   3. Copie a URL que termina em /exec para endpointLeads em src/app/core/config.ts.
 */

/** E-mail que recebe um aviso a cada resultado novo. Vazio = sem aviso. */
const EMAIL_AVISO = '';

const ABA = 'Checklists';

const COLUNAS = [
  'Cadastrado em',
  'Atualizado em',
  'Etapa',
  'Nome',
  'WhatsApp',
  'E-mail',
  'Sinais (de 10)',
  'Sinais marcados',
  'Resultado',
  'Origem',
  'ID',
];

const COLUNA_ETAPA = COLUNAS.indexOf('Etapa') + 1;
const COLUNA_ID = COLUNAS.indexOf('ID') + 1;

const ETAPA_CADASTRO = 'Só cadastro';
const ETAPA_RESULTADO = 'Viu o resultado';

function doPost(e) {
  const trava = LockService.getScriptLock();
  trava.waitLock(10000);

  try {
    const dados = JSON.parse(e.postData.contents);
    if (!dados.id || !dados.nome || !dados.whatsapp) {
      return responder({ ok: false, erro: 'dados incompletos' });
    }

    const aba = obterAba();
    const linhaExistente = acharLinha(aba, String(dados.id));
    const etapaAnterior = linhaExistente
      ? aba.getRange(linhaExistente, COLUNA_ETAPA).getValue()
      : '';

    const viuResultado = dados.etapa === 'resultado';
    // Um cadastro repetido não apaga um resultado que já estava na linha.
    if (!viuResultado && etapaAnterior === ETAPA_RESULTADO) {
      return responder({ ok: true });
    }

    const linha = [
      dataOuAgora(dados.cadastradoEm),
      new Date(),
      viuResultado ? ETAPA_RESULTADO : ETAPA_CADASTRO,
      texto(dados.nome),
      texto(dados.whatsapp),
      texto(dados.email),
      viuResultado ? Number(dados.total) || 0 : '',
      viuResultado ? texto(dados.sinais) : '',
      viuResultado ? (dados.alerta ? 'Alerta: 3 ou mais sinais' : 'Menos de 3 sinais') : '',
      texto(dados.origem),
      texto(dados.id),
    ];

    if (linhaExistente) {
      aba.getRange(linhaExistente, 1, 1, linha.length).setValues([linha]);
    } else {
      aba.appendRow(linha);
    }

    if (EMAIL_AVISO && viuResultado && etapaAnterior !== ETAPA_RESULTADO) {
      avisarPorEmail(linha);
    }

    return responder({ ok: true });
  } catch (erro) {
    return responder({ ok: false, erro: String(erro) });
  } finally {
    trava.releaseLock();
  }
}

/** Abrir a URL /exec no navegador mostra isto: serve para conferir que está no ar. */
function doGet() {
  return responder({ ok: true, servico: 'Checklist Sentir' });
}

function obterAba() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
    aba.getRange('A:B').setNumberFormat('dd/MM/yyyy HH:mm');
  }
  return aba;
}

/** Número da linha com esse ID, ou 0 se ainda não existe. */
function acharLinha(aba, id) {
  const ultima = aba.getLastRow();
  if (ultima < 2) return 0;
  const ids = aba.getRange(2, COLUNA_ID, ultima - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return i + 2;
  }
  return 0;
}

/**
 * Texto vindo da internet, pronto para a planilha: limitado em tamanho e sem
 * virar fórmula (um valor que começa com = + - @ seria executado pelo Sheets).
 */
function texto(valor) {
  const limpo = String(valor == null ? '' : valor).trim().slice(0, 300);
  return /^[=+\-@]/.test(limpo) ? "'" + limpo : limpo;
}

function dataOuAgora(iso) {
  const data = new Date(iso);
  return isNaN(data.getTime()) ? new Date() : data;
}

function avisarPorEmail(linha) {
  const [, , , nome, whatsapp, email, total, sinais, resultado] = linha;
  const corpo = [
    'Novo checklist respondido na landing page.',
    '',
    'Nome: ' + nome,
    'WhatsApp: ' + whatsapp,
    'E-mail: ' + (email || '(não informado)'),
    '',
    'Sinais: ' + total + ' de 10',
    'Marcados: ' + (sinais || '(nenhum)'),
    'Resultado: ' + resultado,
    '',
    'Planilha: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  ].join('\n');

  MailApp.sendEmail(EMAIL_AVISO, 'Checklist Sentir: ' + nome, corpo);
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
