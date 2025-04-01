import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"
import { converterParaMinutos, formatarMinutosParaHoras } from "./timeUtils"

const agruparPorUsuario = (data) => {
  const agrupado = {}
  data.forEach((item) => {
    const nome = item.usuario
    if (!agrupado[nome]) {
      agrupado[nome] = {
        registros: [],
        totalTrabalhado: 0,
        totalExtras: 0,
      }
    }

    agrupado[nome].registros.push(item)
    agrupado[nome].totalTrabalhado += converterParaMinutos(item.total_horas || "0h 0m")
    agrupado[nome].totalExtras += converterParaMinutos(item.banco_horas || "0h 0m")
  })
  return agrupado
}

export const exportCSV = (data) => {
  const agrupado = agruparPorUsuario(data)
  const csvData = []
  let totalGeralTrabalhado = 0
  let totalGeralExtras = 0

  for (const [usuario, grupo] of Object.entries(agrupado)) {
    grupo.registros.forEach(({ data, entrada, saida, total_pausas, total_horas }) => {
      csvData.push({
        Usuário: usuario,
        Data: data,
        Entrada: entrada,
        Saída: saida,
        Intervalo: total_pausas,
        "Horas Trabalhadas": total_horas,
      })
    })

    csvData.push({
      Usuário: usuario,
      Data: "",
      Entrada: "",
      Saída: "",
      Intervalo: "TOTAL",
      "Horas Trabalhadas": `Trabalhadas: ${formatarMinutosParaHoras(grupo.totalTrabalhado)}, Extras: ${formatarMinutosParaHoras(grupo.totalExtras)}`,
    })

    totalGeralTrabalhado += grupo.totalTrabalhado
    totalGeralExtras += grupo.totalExtras
    csvData.push({})
  }

  csvData.push({
    Usuário: "TOTAL GERAL",
    Data: "",
    Entrada: "",
    Saída: "",
    Intervalo: "",
    "Horas Trabalhadas": `Trabalhadas: ${formatarMinutosParaHoras(totalGeralTrabalhado)}, Extras: ${formatarMinutosParaHoras(totalGeralExtras)}`
  })

  const blob = new Blob([Papa.unparse(csvData)], { type: "text/csvcharset=utf-8" })
  saveAs(blob, "registros.csv")
}

export const exportPDF = (data) => {
  const doc = new jsPDF()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.text("📋 Relatório de Registros de Ponto", 14, 10)

  const agrupado = agruparPorUsuario(data)
  let totalGeralTrabalhado = 0
  let totalGeralExtras = 0
  let yPos = 20

  for (const [usuario, grupo] of Object.entries(agrupado)) {
    yPos += 10
    doc.setFont("helvetica", "bold")
    doc.text(`👤 Usuário: ${usuario}`, 14, yPos)
    doc.setFont("helvetica", "normal")

    const tableData = grupo.registros.map(({ data, entrada, saida, total_pausas, total_horas }) => [
      data, entrada, saida, total_pausas, total_horas,
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Data", "Entrada", "Saída", "Intervalo", "Horas Trabalhadas"]],
      body: tableData,
      theme: "striped",
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [90, 64, 182] },
      didDrawPage: (data) => {
        yPos = data.cursor.y
      },
    })

    yPos += 5
    doc.setFont("helvetica", "bold")
    doc.text(
      `Total Trabalhado: ${formatarMinutosParaHoras(grupo.totalTrabalhado)} | Horas Extras: ${formatarMinutosParaHoras(grupo.totalExtras)}`,
      14,
      yPos
    )
    doc.setFont("helvetica", "normal")

    totalGeralTrabalhado += grupo.totalTrabalhado
    totalGeralExtras += grupo.totalExtras
  }

  // Total geral
  yPos += 15
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(
    `🧾 TOTAL GERAL — Trabalhadas: ${formatarMinutosParaHoras(totalGeralTrabalhado)} | Extras: ${formatarMinutosParaHoras(totalGeralExtras)}`,
    14,
    yPos
  )

  doc.save("registros.pdf")
}
