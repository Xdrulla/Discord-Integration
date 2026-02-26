<script setup>
import { ref } from 'vue'
import SidebarMenu from './SidebarMenu.vue'
import Topbar from './Topbar.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

// Desktop: sidebar colapsada ou expandida
const sidebarCollapsed = ref(false)
// Mobile: drawer aberto ou fechado
const mobileOpen = ref(false)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">

    <!-- Overlay mobile (fecha o drawer ao clicar fora) -->
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-30 bg-black/50 md:hidden"
        @click="mobileOpen = false"
      />
    </Transition>

    <!-- Sidebar — fixo em mobile (drawer), normal em desktop -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-40 md:relative md:z-auto transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <SidebarMenu
        :collapsed="sidebarCollapsed"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
        @close-mobile="mobileOpen = false"
      />
    </div>

    <!-- Main area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Topbar @open-sidebar="mobileOpen = true">
        <slot name="header" />
      </Topbar>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <RouterView />
      </main>
    </div>

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>
