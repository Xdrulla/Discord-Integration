export function ajustarFusoHorario(horario) {
  if (!horario || horario === "-") return "-";

  try {
    const dataUtc = new Date(`1970-01-01T${horario}:00Z`);
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(dataUtc);
  } catch (error) {
    console.error("Erro ao converter fuso horário:", error);
    return horario;
  }
}

export function formatarTempo(minutos) {
  if (!minutos || isNaN(minutos)) return "0h 0m";
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = Math.round(minutos % 60);
  return `${horas}h ${minutosRestantes}m`;
}

export function extrairMinutosDeString(tempoString) {
  if (!tempoString) return 0;
  if (typeof tempoString === "object" && tempoString.totalHoras) {
    tempoString = tempoString.totalHoras;
  }
  if (typeof tempoString !== "string") return 0;

  const partes = tempoString.match(/(\d+)h\s*(\d+(\.\d+)?)m/);
  if (partes) {
    const horas = parseInt(partes[1]) || 0;
    const minutos = parseFloat(partes[2]) || 0;
    return horas * 60 + minutos;
  }
  return 0;
}

export function calcularTotalPausas(pausas) {
  if (!pausas || pausas.length === 0) return "0h 0m";
  let totalMinutos = pausas.reduce((total, p) => {
    if (!p.duracao) return total;
    const partes = p.duracao.match(/(\d+)h(\d+(\.\d+)?)m/);
    if (partes) {
      const horas = parseInt(partes[1]) || 0;
      const minutos = parseFloat(partes[2]) || 0;
      return total + horas * 60 + minutos;
    }
    return total;
  }, 0);
  return formatarTempo(totalMinutos);
}
