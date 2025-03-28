import ReactSwal from "./ReactSwal"

export const savePassword = () => {
  ReactSwal.fire({
    text: 'Senha alterada com sucesso!',
    icon: 'success',
    showConfirmButton: false,
    showCancelButtom: false,
    timer: 2000,
  })
}

export const notifyRealtimeUpdate = () => {
  ReactSwal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title: "Registros atualizados automaticamente",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  })
}


export const successDiscordIdUpdate = () => {
  ReactSwal.fire({
    text: "Discord ID atualizado com sucesso!",
    icon: "success",
    showConfirmButton: false,
    timer: 2000,
  });
};

export const errorDiscordIdUpdate = () => {
  ReactSwal.fire({
    text: "Erro ao atualizar o Discord ID. Tente novamente.",
    icon: "error",
    showConfirmButton: false,
    timer: 2500,
  });
};

export const confirmDeleteJustificativa = () => {
  return ReactSwal.fire({
    title: "Tem certeza?",
    text: "Esta ação não poderá ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sim, excluir",
    cancelButtonText: "Cancelar",
  });
};
