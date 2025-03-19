function calcularHorasTrabalhadas(inicio, fim, pausas) {
  try {
    if (!inicio || !fim) {
      console.error("❌ Erro: Início ou fim ausente no cálculo!", { inicio, fim });
      return { totalHoras: "0h 0m", totalPausas: "0h 0m" };
    }

    const inicioData = new Date(inicio);
    const fimData = new Date(fim);

    if (isNaN(inicioData.getTime()) || isNaN(fimData.getTime())) {
      console.error("❌ Erro: Datas de início ou fim inválidas!", { inicio, fim });
      return { totalHoras: "0h 0m", totalPausas: "0h 0m" };
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

    if (isNaN(totalMinutos) || isNaN(minutosPausa)) {
      return { totalHoras: "0h 0m", totalPausas: "0h 0m" };
    }

    return {
      totalHoras: formatarTempo(Math.max(0, totalMinutos - minutosPausa)),
      totalPausas: formatarTempo(Math.max(0, minutosPausa))
    };
  } catch (error) {
    console.error("❌ Erro inesperado ao calcular horas trabalhadas:", error);
    return { totalHoras: "0h 0m", totalPausas: "0h 0m" };
  }
}

function formatarTempo(minutos) {
  return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
}

module.exports = { calcularHorasTrabalhadas, formatarTempo };
