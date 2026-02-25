<script setup>
import { ref } from 'vue'
import SidebarMenu from './SidebarMenu.vue'
import Topbar from './Topbar.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const sidebarCollapsed = ref(false)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <SidebarMenu
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <!-- Main area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <Topbar>
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
