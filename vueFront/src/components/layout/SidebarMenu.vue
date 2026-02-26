<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard, Users, CalendarDays, Target, LogOut, ChevronLeft, ChevronRight
} from 'lucide-vue-next'

const props = defineProps({
  collapsed: Boolean,
})
const emit = defineEmits(['toggle'])

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const navItems = computed(() => {
  const items = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
  ]
  if (auth.isAdmin) {
    items.push(
      { to: '/admin/manage-users', label: 'Usuários', icon: Users },
      { to: '/admin/goals', label: 'Metas', icon: Target },
      { to: '/admin/manage-holidays', label: 'Feriados', icon: CalendarDays },
    )
  }
  return items
})

const isActive = (path) => route.path.startsWith(path)

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside
    :class="cn(
      'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-60'
    )"
  >
    <!-- Logo -->
    <div :class="cn('flex items-center border-b border-sidebar-border h-14 px-4', collapsed ? 'justify-center' : 'gap-3')">
      <div class="h-8 w-8 shrink-0 rounded-lg bg-sidebar-primary flex items-center justify-center text-white font-bold text-sm">
        G
      </div>
      <span v-if="!collapsed" class="text-sidebar-foreground font-semibold text-sm truncate">GoEPIK</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive(item.to)
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2'
        )"
        :title="collapsed ? item.label : undefined"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="p-2 border-t border-sidebar-border space-y-1">
      <button
        @click="handleLogout"
        :class="cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors',
          collapsed && 'justify-center px-2'
        )"
        :title="collapsed ? 'Sair' : undefined"
      >
        <LogOut class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed">Sair</span>
      </button>

      <!-- Collapse toggle -->
      <button
        @click="emit('toggle')"
        :class="cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
          collapsed && 'justify-center px-2'
        )"
        :title="collapsed ? 'Expandir' : 'Recolher'"
      >
        <ChevronRight v-if="collapsed" class="h-4 w-4 shrink-0" />
        <template v-else>
          <ChevronLeft class="h-4 w-4 shrink-0" />
          <span>Recolher</span>
        </template>
      </button>
    </div>
  </aside>
</template>
