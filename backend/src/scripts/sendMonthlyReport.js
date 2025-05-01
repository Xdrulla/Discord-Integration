const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const PDFDocument = require("pdfkit");
const getStream = require("get-stream");
const ExcelJS = require("exceljs");
const db = require("../config/firebase");
const { calcularTodosResumosMensais } = require("../utils/resumeUtils");
const nodemailer = require("nodemailer");

async function getAdminsToNotify() {
  const snapshot = await db.collection("users")
    .where("role", "==", "admin")
    .where("receberNotificacoes", "==", true)
    .get();

  return snapshot.docs.map(doc => doc.data());
}

async function gerarArquivoExcel(ano, mes) {
  const resumos = await calcularTodosResumosMensais(ano, mes);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Resumo Mensal");

  sheet.columns = [
    { header: "Nome", key: "nome", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Total", key: "total", width: 15 },
    { header: "Saldo", key: "saldo", width: 15 },
    { header: "Meta", key: "meta", width: 15 },
    { header: "Dia Útil", key: "util", width: 15 },
    { header: "Sábado", key: "sabado", width: 15 },
    { header: "Domingo/Feriado", key: "domingo", width: 18 }
  ];

  resumos.forEach((r) => {
    sheet.addRow({
      nome: r.nome,
      email: r.email,
      total: r.total_horas,
      saldo: r.saldo,
      meta: r.meta,
      util: r.extras.dia_util,
      sabado: r.extras.sabado,
      domingo: r.extras.domingo_feriado
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

async function gerarArquivoPDF(ano, mes) {
  const resumos = await calcularTodosResumosMensais(ano, mes);

  const doc = new PDFDocument({ size: "A4", margin: 30 });
  const stream = doc.pipe(require("stream").PassThrough());

  doc.fontSize(18).text(`Resumo Mensal - ${mes}/${ano}`, { align: "center" }).moveDown(1.5);

  resumos.forEach((r, index) => {
    doc
      .fontSize(12)
      .text(`${index + 1}. ${r.nome} (${r.email})`)
      .text(`- Total: ${r.total_horas}`)
      .text(`- Saldo: ${r.saldo}`)
      .text(`- Meta: ${r.meta}`)
      .text(`- Dia Útil: ${r.extras.dia_util}`)
      .text(`- Sábado: ${r.extras.sabado}`)
      .text(`- Domingo/Feriado: ${r.extras.domingo_feriado}`)
      .moveDown(1);
  });

  doc.end();
  const buffer = await getStream.buffer(stream);
  return buffer;
}

async function enviarEmailRelatorio(adminEmail, bufferExcel, bufferPDF, ano, mes) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SISTEMA,
      pass: process.env.EMAIL_SENHA
    }
  });

  await transporter.sendMail({
    from: `"Pontobot" <${process.env.EMAIL_SISTEMA}>`,
    to: adminEmail,
    subject: `📊 Relatório de Ponto ${mes}/${ano}`,
    text: "Segue em anexo o relatório mensal de ponto.",
    attachments: [
      {
        filename: `Resumo_${ano}_${mes}.xlsx`,
        content: bufferExcel
      },
      {
        filename: `Resumo_${ano}_${mes}.pdf`,
        content: bufferPDF
      }
    ]
  });
}

async function executarEnvio() {
  const hoje = dayjs().tz("America/Sao_Paulo");
  const dataReferencia = hoje.subtract(1, 'day');

  const ano = dataReferencia.year();
  const mes = dataReferencia.month() + 1;

  console.log(`🔁 Gerando relatório de ${mes}/${ano}...`);
  const bufferExcel = await gerarArquivoExcel(ano, mes);
  const bufferPDF = await gerarArquivoPDF(ano, mes);

  const admins = await getAdminsToNotify();

  for (const admin of admins) {
    await enviarEmailRelatorio(admin.email, bufferExcel, bufferPDF, ano, mes);
    console.log(`📨 Relatório enviado para ${admin.email}`);
  }

  console.log("✅ Relatórios enviados com sucesso!");
}

executarEnvio().catch(err => {
  console.error("❌ Erro ao enviar relatório:", err);
});
