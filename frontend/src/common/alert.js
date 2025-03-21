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
