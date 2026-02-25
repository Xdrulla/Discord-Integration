<script setup>
import { cn } from '@/utils/cn'
const props = defineProps({ class: String })
</script>

<template>
  <div :class="cn('rounded-xl border bg-card text-card-foreground shadow', props.class)">
    <slot />
  </div>
</template>
