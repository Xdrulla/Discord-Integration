<script setup>
import { provide, ref } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: undefined },
})
const emit = defineEmits(['update:open'])

const internalOpen = ref(false)

const isOpen = props.open !== undefined
  ? () => props.open
  : () => internalOpen.value

const setOpen = (val) => {
  if (props.open !== undefined) {
    emit('update:open', val)
  } else {
    internalOpen.value = val
  }
}

provide('dialog', { isOpen, setOpen })
</script>

<template>
  <slot />
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen()"
        class="fixed inset-0 z-50 bg-black/80"
        @click="setOpen(false)"
      />
    </Transition>
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen()"
        class="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background rounded-xl border shadow-lg p-6"
        @click.stop
      >
        <slot name="content" />
      </div>
    </Transition>
  </Teleport>
</template>
