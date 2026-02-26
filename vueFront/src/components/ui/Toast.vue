<script setup>
import { cn } from '@/utils/cn'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const props = defineProps({
  type: { type: String, default: 'default' },
  title: String,
  message: String,
  class: String,
})

const emit = defineEmits(['close'])

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
}

const styles = {
  success: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  default: 'border-border bg-card text-foreground',
}

const Icon = icons[props.type]
</script>

<template>
  <div :class="cn(
    'relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
    styles[type],
    props.class
  )">
    <component :is="Icon" class="h-5 w-5 shrink-0 mt-0.5" />
    <div class="flex-1 min-w-0">
      <p v-if="title" class="text-sm font-semibold">{{ title }}</p>
      <p v-if="message" class="text-sm opacity-90">{{ message }}</p>
    </div>
    <button @click="emit('close')" class="shrink-0 rounded-sm opacity-70 hover:opacity-100">
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
