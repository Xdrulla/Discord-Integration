export function ajustarFusoHorario(horario) {
  return horario || "-";
}

export function formatarTempo(minutos) {
  if (!minutos || isNaN(minutos)) return "0h 0m";
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = Math.round(minutos % 60);
  return `${horas}h ${minutosRestantes}m`;
}

export function extrairMinutosDeString(tempoString) {
  if (!tempoString || typeof tempoString !== "string") return 0;

  const match = tempoString.trim().match(/^(-?)(\d+)h\s*(\d+(\.\d+)?)(m|min)$/i);
  if (!match) return 0;

  const sinal = match[1] === "-" ? -1 : 1;
  const horas = parseInt(match[2]) || 0;
  const minutos = Math.round(parseFloat(match[3]) || 0);

  return sinal * (horas * 60 + minutos);
}

export function formatarTotalPausas(tempoString) {
  if (!tempoString || typeof tempoString !== "string") return "0h 0m";

  const partes = tempoString.match(/(\d+)h\s*(\d+(\.\d+)?)m/);
  if (partes) {
    const horas = parseInt(partes[1]) || 0;
    let minutos = parseFloat(partes[2]) || 0;

    minutos = Math.round(minutos)

    return `${horas}h ${minutos}m`;
  }
  return "0h 0m";
}

export const converterParaMinutos = (tempo) => {
  if (!tempo) return 0;

  const isNegativo = tempo.startsWith("-");
  const [horas, minutos] = tempo.replace("-", "").match(/\d+/g)?.map(Number) || [0, 0];

  const total = (horas * 60) + minutos;
  return isNegativo ? -total : total;
};

export const formatarMinutosParaHoras = (minutosTotais) => {
  const sinal = minutosTotais < 0 ? "-" : "";
  const minutosAbs = Math.abs(minutosTotais);
  const horas = Math.floor(minutosAbs / 60);
  const minutos = minutosAbs % 60;
  return `${sinal}${horas}h ${minutos}m`;
};

export function horaStringParaMinutos(hora) {
  if (!hora || typeof hora !== "string") return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}
