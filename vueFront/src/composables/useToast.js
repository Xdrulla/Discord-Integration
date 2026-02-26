import { ref } from 'vue'

const toasts = ref([])
let counter = 0

export function useToast() {
  const toast = ({ type = 'default', title, message, duration = 4000 }) => {
    const id = ++counter
    toasts.value.push({ id, type, title, message })
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  const remove = (id) => {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return {
    toasts,
    toast,
    remove,
    success: (title, message) => toast({ type: 'success', title, message }),
    error: (title, message) => toast({ type: 'error', title, message }),
    warning: (title, message) => toast({ type: 'warning', title, message }),
    info: (title, message) => toast({ type: 'info', title, message }),
  }
}
