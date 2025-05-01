const dayjs = require("dayjs");
require("dayjs/locale/pt-br");

const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const { feriadosFixos } = require("./enum");

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function calcularHorasTrabalhadas(inicio, fim, pausas) {
  if (!inicio || !fim) {
    console.error("❌ Erro: Início ou fim ausente no cálculo!", { inicio, fim });
  }

  const inicioData = new Date(inicio);
  const fimData = new Date(fim);

  if (isNaN(inicioData.getTime()) || isNaN(fimData.getTime())) {
    console.error("❌ Erro: Datas de início ou fim inválidas!", { inicio, fim });
  }

  let totalMinutos = (fimData - inicioData) / 60000;
  let minutosPausa = 0;

  if (pausas && pausas.length > 0) {
    pausas.forEach(p => {
      if (p.inicio && p.fim) {
        const pausaInicio = new Date(p.inicio);
        const pausaFim = new Date(p.fim);

        if (!isNaN(pausaInicio.getTime()) && !isNaN(pausaFim.getTime())) {
          minutosPausa += (pausaFim - pausaInicio) / 60000;
        } else {
          console.error("❌ Erro: Formato de pausa inválido!", p);
        }
      }
    });
  }

  return {
    totalHoras: formatarTempo(Math.max(0, totalMinutos - minutosPausa)),
    totalPausas: formatarTempo(Math.max(0, minutosPausa))
  };
}

function formatarTempo(minutos) {
  return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
}

function extrairMinutosDeString(tempoString) {
  if (!tempoString || typeof tempoString !== "string") return 0;

  const match = tempoString.trim().match(/^(-?)(\d+)h\s*(\d+(\.\d+)?)(m|min)$/i);
  if (!match) return 0;

  const sinal = match[1] === "-" ? -1 : 1;
  const horas = parseInt(match[2]) || 0;
  const minutos = Math.round(parseFloat(match[3]) || 0);

  return sinal * (horas * 60 + minutos);
}

function formatarMinutosParaHoras(minutosTotais) {
  const sinal = minutosTotais < 0 ? "-" : "";
  const minutosAbs = Math.abs(minutosTotais);
  const horas = Math.floor(minutosAbs / 60);
  const minutos = minutosAbs % 60;
  return `${sinal}${horas}h ${minutos}m`;
};

async function getTipoDeDia(dataStr, discordId = null) {
  const data = dayjs(dataStr).format("YYYY-MM-DD");
  const diaSemana = dayjs(dataStr).day();
  const mesDia = dayjs(dataStr).format("MM-DD");

  try {
    const doc = await db.collection("datas_especiais").doc(data).get();
    if (doc.exists) {
      const dados = doc.data();
      if (!dados.usuarios || dados.usuarios.length === 0 || dados.usuarios.includes(discordId)) {
        return "feriado";
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro ao buscar datas especiais:", err.message);
  }

  if (diaSemana === 0) return "domingo";
  if (feriadosFixos.includes(mesDia)) return "feriado";
  if (diaSemana === 6) return "sabado";

  return "util";
}

async function contarDiasUteisValidos(ano, mes, discordId) {
  const totalDias = dayjs(`${ano}-${String(mes).padStart(2, "0")}-01`).daysInMonth();
  let diasUteis = 0;

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataAtual = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const tipo = await getTipoDeDia(dataAtual, discordId);
    if (tipo === "util") diasUteis++;
  }

  return diasUteis;
}

module.exports = {
  calcularHorasTrabalhadas,
  formatarTempo,
  extrairMinutosDeString,
  formatarMinutosParaHoras,
  getTipoDeDia,
  contarDiasUteisValidos
};
