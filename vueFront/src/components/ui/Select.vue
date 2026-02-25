<script setup>
import { cn } from '@/utils/cn'

const props = defineProps({
  modelValue: [String, Number],
  class: String,
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :class="cn(
      'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
    @change="emit('update:modelValue', $event.target.value)"
  >
    <slot />
  </select>
</template>
