const db = require("../config/firebase");
const { extrairMinutosDeString, getTipoDeDia, formatarMinutosParaHoras, contarDiasUteisValidos } = require("./timeUtils");

async function calcularResumoMensal(discordId, ano, mes) {
  const prefixoData = `${ano}-${String(mes).padStart(2, "0")}`;

  const snapshot = await db.collection("registros")
    .where("discordId", "==", discordId)
    .get();

  const registros = snapshot.docs
    .map((doc) => doc.data())
    .filter((r) =>
      r.data &&
      r.data.startsWith(prefixoData) &&
      (r.status === "aprovado" || !r.status)
    );

  let totalMinutos = 0;
  let extras = { util: 0, sabado: 0, domingo_feriado: 0 };
  let pendentes = 0;
  let aprovadas = 0;

  for (const reg of registros) {
    const minutos = extrairMinutosDeString(reg.total_horas);
    const tipo = await getTipoDeDia(reg.data);

    if (tipo === "sabado") extras.sabado += minutos;
    else if (tipo === "domingo" || tipo === "feriado") extras.domingo_feriado += minutos;
    else extras.util += minutos;

    totalMinutos += minutos;
    if (reg.justificativa?.status === "pendente") pendentes++;
    if (reg.justificativa?.status === "aprovado") aprovadas++;
  }

  const diasUteis = await contarDiasUteisValidos(ano, mes, discordId);
  let metaMinutos = diasUteis * 8 * 60;

  try {
    const userSnapshot = await db.collection("users").where("discordId", "==", discordId).limit(1).get();
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const metasRef = userDoc.ref.collection("metas").doc(prefixoData);
      const metasDoc = await metasRef.get();

      if (metasDoc.exists && metasDoc.data().metaMinutos) {
        metaMinutos = metasDoc.data().metaMinutos;
      }
    }
  } catch (err) {
    console.warn("⚠️ Erro ao buscar meta personalizada:", err.message);
  }

  const saldo = totalMinutos - metaMinutos;

  return {
    usuario: registros[0]?.usuario || discordId,
    total_horas: formatarMinutosParaHoras(totalMinutos),
    saldo: formatarMinutosParaHoras(saldo),
    meta: formatarMinutosParaHoras(metaMinutos),
    extras: {
      sabado: formatarMinutosParaHoras(extras.sabado),
      domingo_feriado: formatarMinutosParaHoras(extras.domingo_feriado),
      dia_util: formatarMinutosParaHoras(extras.util),
    },
    pendentes,
    aprovadas,
  };
}

async function calcularTodosResumosMensais(ano, mes) {
  const usuariosSnapshot = await db.collection("users").get();

  const usuarios = usuariosSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      nome: data.usuario || data.email.split("@")[0],
      email: data.email,
      discordId: data.discordId,
      role: data.role || "leitor"
    };
  });

  const resumos = [];

  for (const user of usuarios) {
    try {
      if (!user.discordId) continue;
      const resumo = await calcularResumoMensal(user.discordId, ano, mes);
      if (resumo.usuario !== user.discordId) {
        resumos.push({
          ...resumo,
          nome: resumo.usuario,
          email: user.email
        });
      }
    } catch (e) {
      console.warn(`⚠️ Erro ao gerar resumo para ${user.email}:`, e.message);
    }
  }

  return resumos;
}

module.exports = {
  calcularResumoMensal,
  calcularTodosResumosMensais,
};