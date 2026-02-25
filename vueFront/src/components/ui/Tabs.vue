<script setup>
import { provide, ref, watch } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps({
  defaultValue: String,
  modelValue: String,
  class: String,
})
const emit = defineEmits(['update:modelValue'])

// Usa modelValue se fornecido, senão defaultValue
const active = ref(props.modelValue ?? props.defaultValue)

// Sincroniza quando o pai muda o v-model
watch(() => props.modelValue, (val) => {
  if (val !== undefined) active.value = val
})

const setTab = (val) => {
  active.value = val
  emit('update:modelValue', val)
}

provide('tabs', { active, setTab })
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <slot />
  </div>
</template>
