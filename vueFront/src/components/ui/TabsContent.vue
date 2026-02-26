<script setup>
import { inject, computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps({ value: String, class: String })
const { active } = inject('tabs')

const isVisible = computed(() => active.value === props.value)
</script>

<template>
  <div
    v-if="isVisible"
    :class="cn('mt-2', props.class)"
  >
    <slot />
  </div>
</template>
