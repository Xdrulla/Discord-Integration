function calcularHorasTrabalhadas(entrada, saida, pausas) {
  try {
    if (!entrada || !saida) {
      console.error("❌ Erro: Entrada ou saída ausente no cálculo!", { entrada, saida });
      return { totalHoras: "0h 0m", totalPausas: "0h 0m" };
    }

    const [entradaHoras, entradaMinutos] = entrada.split(":").map(Number);
    const [saidaHoras, saidaMinutos] = saida.split(":").map(Number);

    if (isNaN(entradaHoras) || isNaN(entradaMinutos) || isNaN(saidaHoras) || isNaN(saidaMinutos)) {
      console.error("❌ Erro: Horários de entrada ou saída inválidos!", { entrada, saida });
      return { totalHoras: "0h 0m", totalPausas: "0h 0m" };
    }

    const minutosEntrada = entradaHoras * 60 + entradaMinutos;
    const minutosSaida = saidaHoras * 60 + saidaMinutos;

    let totalMinutos = minutosSaida - minutosEntrada;

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
