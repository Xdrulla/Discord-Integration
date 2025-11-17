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
    { header: "Total Trabalhado", key: "total", width: 18 },
    { header: "Meta do Mês", key: "meta", width: 15 },
    { header: "Saldo do Mês", key: "saldoMes", width: 15 },
    { header: "Banco Acumulado", key: "bancoAcumulado", width: 18 },
    { header: "Saldo Total", key: "saldoTotal", width: 15 },
    { header: "Horas Dia Útil", key: "util", width: 15 },
    { header: "Horas Sábado", key: "sabado", width: 15 },
    { header: "Horas Dom/Feriado", key: "domingo", width: 18 }
  ];

  // Estiliza o cabeçalho
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  resumos.forEach((r) => {
    sheet.addRow({
      nome: r.nome,
      email: r.email,
      total: r.total_horas,
      meta: r.meta,
      saldoMes: r.saldoMesAtual || r.saldo,
      bancoAcumulado: r.bancoAcumuladoAnterior || "0h 0m",
      saldoTotal: r.saldoTotal || r.saldo,
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

  const doc = new PDFDocument({ 
    size: "A4", 
    margin: 40,
    bufferPages: false // Desabilitado para evitar páginas extras
  });
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=Resumo_${ano}_${mes}.pdf`);
  doc.pipe(res);

  let pageNumber = 1;

  // Helper para adicionar footer
  const addFooter = () => {
    const bottom = doc.page.height - 30;
    doc.fontSize(8)
      .fillColor('#999999')
      .text(
        `Página ${pageNumber}`,
        40,
        bottom,
        { align: 'center', width: doc.page.width - 80 }
      );
  };

  // Helper para verificar se precisa de nova página
  const checkPageBreak = (requiredSpace = 140) => {
    // Só quebra página se realmente não couber (margem de 80px do rodapé)
    if (doc.y + requiredSpace > doc.page.height - 80) {
      addFooter();
      doc.addPage();
      pageNumber++;
      // Reseta para o topo da nova página
      doc.y = 50;
      return true;
    }
    return false;
  };

  // ============ HEADER (Primeira Página) ============
  doc.rect(0, 0, doc.page.width, 90).fill('#4472C4');
  
  doc.fillColor('#FFFFFF')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('RELATORIO DE HORAS TRABALHADAS', 40, 20, { 
      align: 'center',
      width: doc.page.width - 80
    });
  
  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  doc.fontSize(14)
    .text(`${meses[mes - 1]} de ${ano}`, 40, 48, { 
      align: 'center',
      width: doc.page.width - 80
    });
  
  doc.fontSize(9)
    .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 40, 70, { 
      align: 'center',
      width: doc.page.width - 80
    });
  
  // Posiciona cursor após o header
  doc.fillColor('#000000');
  doc.y = 105;

  // ============ LEGENDA ============
  doc.fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#333333')
    .text('LEGENDA:', 40, doc.y, { underline: true, width: doc.page.width - 80 });
  
  doc.moveDown(0.5);

  doc.font('Helvetica')
    .fontSize(8)
    .fillColor('#000000');
  
  const legendaY = doc.y;
  doc.text('• Total Trabalhado: Soma de todas as horas registradas no mes', 50, legendaY, { 
    width: doc.page.width - 100, 
    lineGap: 2 
  });
  
  doc.text('• Meta do Mes: Horas que deveriam ser cumpridas (dias uteis x 8h)', 50, doc.y, { 
    width: doc.page.width - 100, 
    lineGap: 2 
  });
  
  doc.text('• Saldo do Mes: Diferenca entre horas trabalhadas e meta', 50, doc.y, { 
    width: doc.page.width - 100, 
    lineGap: 2 
  });
  
  doc.text('• Banco Acumulado: Saldo dos meses anteriores (ultimos 6 meses)', 50, doc.y, { 
    width: doc.page.width - 100, 
    lineGap: 2 
  });
  
  doc.text('• Saldo Total: Soma do saldo do mes + banco acumulado', 50, doc.y, { 
    width: doc.page.width - 100, 
    lineGap: 2 
  });
  
  doc.moveDown(1.5);

  // Linha separadora
  doc.moveTo(40, doc.y)
    .lineTo(doc.page.width - 40, doc.y)
    .strokeColor('#CCCCCC')
    .stroke();
  
  doc.moveDown(0.5);

  // ============ RESUMO POR USUÁRIO ============
  resumos.forEach((r, index) => {
    // Verifica se o próximo box cabe na página atual (box tem ~130px de altura total)
    checkPageBreak(135);

    const startY = doc.y;
    
    // Nome e Email (SEM header colorido)
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(`${index + 1}. ${r.nome}`, 40, startY);
    
    doc.moveDown(0.5);
    
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#666666')
      .text(r.email, 40, doc.y);
    
    doc.moveDown(0.9);
    
    // Box simples com borda
    const boxStartY = doc.y;
    const boxHeight = 110;
    
    doc.rect(40, boxStartY, doc.page.width - 80, boxHeight)
      .strokeColor('#CCCCCC')
      .lineWidth(1)
      .stroke();
    
    let currentY = boxStartY + 12;

    // Total Trabalhado
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Total Trabalhado:', 50, currentY);
    doc.font('Helvetica-Bold')
      .text(r.total_horas, 160, currentY);
    
    // Meta do Mês
    doc.font('Helvetica')
      .text('Meta do Mes:', 290, currentY);
    doc.font('Helvetica-Bold')
      .text(r.meta, 370, currentY);
    
    currentY += 16;

    // Saldo do Mês
    const saldoMes = r.saldoMesAtual || r.saldo;
    const saldoMesNumero = extrairMinutosDeString(saldoMes);
    
    doc.font('Helvetica')
      .fillColor('#000000')
      .text('Saldo do Mes:', 50, currentY);
    doc.font('Helvetica-Bold')
      .fillColor(saldoMesNumero >= 0 ? '#008000' : '#FF0000')
      .text(saldoMes, 160, currentY);
    
    currentY += 16;

    // Banco Acumulado
    const bancoAcumulado = r.bancoAcumuladoAnterior || "0h 0m";
    const bancoNumero = extrairMinutosDeString(bancoAcumulado);
    
    doc.font('Helvetica')
      .fillColor('#000000')
      .text('Banco Acumulado:', 50, currentY);
    doc.font('Helvetica-Bold')
      .fillColor(bancoNumero >= 0 ? '#4472C4' : '#FFA500')
      .text(bancoAcumulado, 160, currentY);
    
    currentY += 16;

    // Saldo Total
    const saldoTotal = r.saldoTotal || r.saldo;
    const saldoTotalNumero = extrairMinutosDeString(saldoTotal);
    
    doc.font('Helvetica-Bold')
      .fillColor('#000000')
      .text('SALDO TOTAL:', 50, currentY);
    doc.fontSize(10)
      .fillColor(saldoTotalNumero >= 0 ? '#008000' : '#FF0000')
      .text(saldoTotal, 160, currentY);
    
    currentY += 18;
    doc.fontSize(9);

    // Linha separadora
    doc.moveTo(50, currentY)
      .lineTo(doc.page.width - 50, currentY)
      .strokeColor('#DDDDDD')
      .stroke();
    
    currentY += 6;

    // Extras
    doc.font('Helvetica')
      .fillColor('#666666')
      .fontSize(8)
      .text(`Dias uteis: ${r.extras.dia_util}`, 50, currentY);
    doc.text(`Sabados: ${r.extras.sabado}`, 210, currentY);
    doc.text(`Dom/Feriados: ${r.extras.domingo_feriado}`, 360, currentY);

    // Move cursor para próxima seção
    doc.y = boxStartY + boxHeight + 12;
  });

  // Adiciona footer na última página
  addFooter();

  // Finaliza o documento
  doc.end();
};

/**
 * Helper: extrai minutos de string de horas
 */
function extrairMinutosDeString(horasStr) {
  if (!horasStr || typeof horasStr !== "string") return 0;
  
  const match = horasStr.trim().match(/^(-?)(\d+)h\s*(\d+(\.\d+)?)(m|min)?$/i);
  if (!match) return 0;
  
  const sinal = match[1] === "-" ? -1 : 1;
  const horas = parseInt(match[2]) || 0;
  const minutos = Math.round(parseFloat(match[3]) || 0);
  
  return sinal * (horas * 60 + minutos);
}
