<script setup>
import { inject } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps({ value: String, class: String })
const { active, setTab } = inject('tabs')
</script>

<template>
  <button
    type="button"
    :class="cn(
      'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      active.value === value
        ? 'bg-background text-foreground shadow'
        : 'hover:bg-background/50 hover:text-foreground',
      props.class
    )"
    @click="setTab(value)"
  >
    <slot />
  </button>
</template>
