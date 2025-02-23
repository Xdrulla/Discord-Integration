import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export const exportCSV = (data) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "registros.csv");
};

export const exportPDF = (data) => {
  const doc = new jsPDF();
  doc.text("Registros de Ponto", 14, 10);

  const tableData = data.map(({ usuario, data, entrada, saida, total_pausas, total_horas }) => [
    usuario, data, entrada, saida, total_pausas, typeof total_horas === "object" ? total_horas.totalHoras : total_horas
  ]);

  autoTable(doc, {
    head: [["Usuário", "Data", "Entrada", "Saída", "Intervalo", "Horas Trabalhadas"]],
    body: tableData,
  });

  doc.save("registros.pdf");
};
