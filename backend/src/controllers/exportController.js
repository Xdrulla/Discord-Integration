const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { calcularTodosResumosMensais } = require("../utils/resumeUtils");

exports.exportarResumoGeralExcel = async (res, ano, mes) => {
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

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=Resumo_${ano}_${mes}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};

exports.exportarResumoGeralPDF = async (res, ano, mes) => {
  const resumos = await calcularTodosResumosMensais(ano, mes);

  const doc = new PDFDocument({ size: "A4", margin: 30 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=Resumo_${ano}_${mes}.pdf`);
  doc.pipe(res);

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
};
