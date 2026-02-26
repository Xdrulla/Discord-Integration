<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import Avatar from '@/components/ui/Avatar.vue'
import { Sun, Moon, User, ChevronDown } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { isDark, toggle } = useDarkMode()

const dropdownOpen = ref(false)

const openDropdown = () => {
  dropdownOpen.value = true
  // Registra o listener apenas após o clique atual terminar de propagar
  setTimeout(() => {
    document.addEventListener('click', closeDropdown, { once: true })
  }, 0)
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const toggleDropdown = () => {
  if (dropdownOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const goToProfile = () => {
  closeDropdown()
  router.push('/profile')
}

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <header class="h-14 border-b border-border bg-background flex items-center justify-between px-4 md:px-6 gap-4">
    <!-- Left: slot para breadcrumb ou título -->
    <div class="flex-1 min-w-0">
      <slot />
    </div>

    <!-- Right: actions -->
    <div class="flex items-center gap-2">
      <!-- Dark mode toggle -->
      <button
        @click="toggle"
        class="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        :title="isDark ? 'Modo claro' : 'Modo escuro'"
      >
        <Moon v-if="isDark" class="h-4 w-4" />
        <Sun v-else class="h-4 w-4" />
      </button>

      <!-- User dropdown -->
      <div class="relative">
        <button
          @click.stop="toggleDropdown"
          class="flex items-center gap-2 h-9 px-2 rounded-md hover:bg-accent transition-colors"
        >
          <Avatar :fallback="auth.displayName" size="sm" />
          <span class="hidden md:block text-sm font-medium text-foreground max-w-32 truncate">
            {{ auth.displayName }}
          </span>
          <ChevronDown
            class="h-3 w-3 text-muted-foreground hidden md:block transition-transform duration-150"
            :class="dropdownOpen ? 'rotate-180' : ''"
          />
        </button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-1"
        >
          <div
            v-if="dropdownOpen"
            class="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-popover shadow-lg z-50 p-1"
            @click.stop
          >
            <div class="px-3 py-2 border-b border-border mb-1">
              <p class="text-sm font-medium text-foreground truncate">{{ auth.displayName }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ auth.user?.email }}</p>
            </div>
            <button
              @click="goToProfile"
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <User class="h-4 w-4" />
              Meu Perfil
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
