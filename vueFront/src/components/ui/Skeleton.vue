<script setup>
import { cn } from '@/utils/cn'
const props = defineProps({ class: String })
</script>

<template>
  <div :class="cn('animate-pulse rounded-md bg-primary/10', props.class)" />
</template>
