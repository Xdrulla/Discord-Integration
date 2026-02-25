<script setup>
import { cn } from '@/utils/cn'

const props = defineProps({
  src: String,
  alt: String,
  fallback: String,
  size: { type: String, default: 'default' },
  class: String,
})

const sizes = {
  sm: 'h-8 w-8 text-xs',
  default: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

const initials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
</script>

<template>
  <div :class="cn(
    'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
    sizes[size],
    props.class
  )">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
    />
    <span v-else class="flex h-full w-full items-center justify-center font-semibold text-muted-foreground">
      {{ fallback ? initials(fallback) : '?' }}
    </span>
  </div>
</template>
