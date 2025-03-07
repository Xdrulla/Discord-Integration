function calcularHorasTrabalhadas(entrada, saida, pausas) {
  const totalMinutos = (parseInt(saida.split(":")[0]) * 60 + parseInt(saida.split(":")[1])) -
    (parseInt(entrada.split(":")[0]) * 60 + parseInt(entrada.split(":")[1]));

  let minutosPausa = 0;

  if (pausas && pausas.length > 0) {
    pausas.forEach(p => {
      if (p.inicio && p.fim) {
        minutosPausa += (new Date(p.fim) - new Date(p.inicio)) / 60000;
      }
    });
  }

  return {
    totalHoras: formatarTempo(totalMinutos - minutosPausa),
    totalPausas: formatarTempo(minutosPausa)
  };
}

function formatarTempo(minutos) {
  return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
}

module.exports = { calcularHorasTrabalhadas, formatarTempo };
