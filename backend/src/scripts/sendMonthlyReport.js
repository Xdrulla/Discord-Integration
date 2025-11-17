const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const PDFDocument = require("pdfkit");
const getStream = require("get-stream");
const ExcelJS = require("exceljs");
const db = require("../config/firebase");
const { calcularTodosResumosMensais, calcularResumoMensal } = require("../utils/resumeUtils");
const bancoHorasService = require("../services/bancoHoras.service");
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

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

async function gerarArquivoPDF(ano, mes) {
  const resumos = await calcularTodosResumosMensais(ano, mes);

  const doc = new PDFDocument({ 
    size: "A4", 
    margin: 40,
    bufferPages: false // Desabilitado para evitar páginas extras
  });
  
  const stream = doc.pipe(require("stream").PassThrough());

  let pageNumber = 1;

  // Helper para adicionar footer
  const addFooter = () => {
    const bottom = doc.page.height - 30;
    doc.fontSize(8)
      .fillColor('#999999')
      .text(
        `Pagina ${pageNumber}`,
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
  const buffer = await getStream.buffer(stream);
  return buffer;
}

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

async function enviarEmailRelatorio(adminEmail, bufferExcel, bufferPDF, ano, mes) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SISTEMA,
      pass: process.env.EMAIL_SENHA
    }
  });

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  await transporter.sendMail({
    from: `"Pontobot - Sistema de Ponto" <${process.env.EMAIL_SISTEMA}>`,
    to: adminEmail,
    subject: `📊 Relatório de Horas - ${meses[mes - 1]}/${ano}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4472C4; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">📊 Relatório Mensal</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">${meses[mes - 1]} de ${ano}</p>
        </div>
        
        <div style="padding: 30px; background: #f5f5f5;">
          <p style="font-size: 16px; color: #333;">Olá,</p>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Segue em anexo o relatório detalhado de horas trabalhadas referente ao mês de <strong>${meses[mes - 1]}/${ano}</strong>.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4472C4;">
            <h3 style="margin: 0 0 15px 0; color: #4472C4;">📋 Arquivos incluídos:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>PDF:</strong> Relatório completo com formatação visual e legendas explicativas</li>
              <li><strong>Excel:</strong> Planilha para análise e processamento dos dados</li>
            </ul>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 13px;">
              <strong>ℹ️ Novidade:</strong> O relatório agora inclui o <strong>Banco de Horas Acumulado</strong> dos últimos 6 meses e o <strong>Saldo Total</strong> de cada colaborador.
            </p>
          </div>

          <p style="font-size: 13px; color: #999; margin-top: 30px;">
            Este é um e-mail automático. Em caso de dúvidas, entre em contato com o RH.
          </p>
        </div>
        
        <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">Pontobot © ${ano} - Sistema de Controle de Ponto</p>
          <p style="margin: 5px 0 0 0;">Gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Relatorio_Horas_${meses[mes - 1]}_${ano}.pdf`,
        content: bufferPDF
      },
      {
        filename: `Relatorio_Horas_${meses[mes - 1]}_${ano}.xlsx`,
        content: bufferExcel
      }
    ]
  });
}

/**
 * Fecha o banco de horas de todos os usuários para o mês
 * @param {number} ano - Ano
 * @param {number} mes - Mês (1-12)
 * @returns {Promise<Object>} Resultado do fechamento
 */
async function fecharBancoHorasTodosUsuarios(ano, mes) {
  console.log(`🏦 Fechando banco de horas de ${mes}/${ano} para todos os usuários...`);
  
  try {
    const usuariosSnapshot = await db.collection("users").get();
    const resultados = [];
    let sucessos = 0;
    let erros = 0;

    for (const doc of usuariosSnapshot.docs) {
      const userData = doc.data();
      
      if (!userData.discordId) {
        console.log(`⚠️ Usuário ${userData.email} não possui discordId, pulando...`);
        continue;
      }

      try {
        const resumo = await calcularResumoMensal(userData.discordId, ano, mes);
        const resultado = await bancoHorasService.fecharMes(userData.discordId, resumo);
        
        resultados.push({
          usuario: userData.email.split("@")[0],
          discordId: userData.discordId,
          success: true,
          saldoMes: resultado.mesAtual,
          bancoAnterior: resultado.bancoAnterior,
          saldoTotal: resultado.saldoTotal
        });
        
        sucessos++;
        console.log(`✅ ${userData.email.split("@")[0]}: Saldo do mês = ${resultado.mesAtual} min`);
      } catch (error) {
        console.error(`❌ Erro ao fechar mês para ${userData.email}:`, error.message);
        resultados.push({
          usuario: userData.email.split("@")[0],
          discordId: userData.discordId,
          success: false,
          error: error.message
        });
        erros++;
      }
    }

    console.log(`\n📊 Fechamento concluído: ${sucessos} sucessos, ${erros} erros`);
    
    return {
      success: true,
      total: resultados.length,
      sucessos,
      erros,
      resultados
    };
  } catch (error) {
    console.error("❌ Erro ao fechar banco de horas:", error);
    throw error;
  }
}

async function executarEnvio() {
  const hoje = dayjs().tz("America/Sao_Paulo");
  
  // Remove a validação de data/hora para permitir chamada manual via n8n
  // if (!(hoje.date() === 30 && hoje.hour() === 23)) {
  //   return;
  // }
  
  // Usa o mês anterior como referência
  const dataReferencia = hoje.subtract(1, 'day');
  const ano = dataReferencia.year();
  const mes = dataReferencia.month() + 1;

  console.log(`\n🚀 Iniciando envio de relatórios mensais: ${mes}/${ano}`);
  console.log(`📅 Data/Hora: ${hoje.format('DD/MM/YYYY HH:mm:ss')}\n`);

  try {
    // PASSO 1: Fechar banco de horas de todos os usuários
    console.log("=" .repeat(50));
    console.log("PASSO 1: FECHAMENTO DE BANCO DE HORAS");
    console.log("=" .repeat(50));
    
    const resultadoFechamento = await fecharBancoHorasTodosUsuarios(ano, mes);
    
    console.log("\n" + "=" .repeat(50));
    console.log("PASSO 2: GERAÇÃO DE RELATÓRIOS");
    console.log("=" .repeat(50) + "\n");

    // PASSO 2: Gerar relatórios (agora com banco de horas incluído)
    const bufferExcel = await gerarArquivoExcel(ano, mes);
    const bufferPDF = await gerarArquivoPDF(ano, mes);

    console.log("\n" + "=" .repeat(50));
    console.log("PASSO 3: ENVIO DE E-MAILS");
    console.log("=" .repeat(50) + "\n");

    // PASSO 3: Enviar emails para admins
    const admins = await getAdminsToNotify();
    
    if (admins.length === 0) {
      console.log("⚠️ Nenhum admin configurado para receber notificações");
      return {
        success: true,
        message: "Relatórios gerados, mas nenhum email enviado (sem admins configurados)",
        fechamento: resultadoFechamento
      };
    }

    let emailsEnviados = 0;
    for (const admin of admins) {
      try {
        await enviarEmailRelatorio(admin.email, bufferExcel, bufferPDF, ano, mes);
        console.log(`✅ Email enviado para: ${admin.email}`);
        emailsEnviados++;
      } catch (error) {
        console.error(`❌ Erro ao enviar email para ${admin.email}:`, error.message);
      }
    }

    console.log("\n" + "=" .repeat(50));
    console.log("✅ PROCESSO CONCLUÍDO COM SUCESSO");
    console.log("=" .repeat(50));
    console.log(`📧 Emails enviados: ${emailsEnviados}/${admins.length}`);
    console.log(`🏦 Bancos fechados: ${resultadoFechamento.sucessos}/${resultadoFechamento.total}`);
    console.log("=" .repeat(50) + "\n");

    return {
      success: true,
      ano,
      mes,
      emailsEnviados,
      totalAdmins: admins.length,
      fechamento: resultadoFechamento
    };

  } catch (error) {
    console.error("\n❌ ERRO NO PROCESSO:", error);
    throw error;
  }
}

module.exports = { executarEnvio, fecharBancoHorasTodosUsuarios };
