<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { toast } = useToast()

const activeTab = ref('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    toast({ type: 'warning', title: 'Atenção', message: 'Preencha todos os campos.' })
    return
  }

  loading.value = true
  try {
    if (activeTab.value === 'login') {
      await auth.login(email.value, password.value)
      router.push('/dashboard')
    } else {
      if (password.value !== confirmPassword.value) {
        toast({ type: 'error', title: 'Erro', message: 'As senhas não coincidem.' })
        return
      }
      if (password.value.length < 6) {
        toast({ type: 'error', title: 'Erro', message: 'A senha deve ter ao menos 6 caracteres.' })
        return
      }
      await auth.register(email.value, password.value)
      router.push('/dashboard')
    }
  } catch (err) {
    const messages = {
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'E-mail ou senha inválidos.',
      'auth/email-already-in-use': 'E-mail já cadastrado.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    }
    toast({
      type: 'error',
      title: 'Erro de autenticação',
      message: messages[err.code] ?? 'Ocorreu um erro. Tente novamente.',
    })
  } finally {
    loading.value = false
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <!-- Background decoration -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
    </div>

    <div class="w-full max-w-md space-y-6 animate-fade-in">
      <!-- Logo -->
      <div class="text-center space-y-2">
        <div class="mx-auto h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          G
        </div>
        <h1 class="text-2xl font-bold text-foreground">GoEPIK</h1>
        <p class="text-sm text-muted-foreground">Sistema de Ponto Digital</p>
      </div>

      <!-- Card -->
      <Card class="p-6 space-y-5">
        <!-- Tabs -->
        <div class="flex rounded-lg bg-muted p-1 gap-1">
          <button
            v-for="tab in [{ key: 'login', label: 'Entrar' }, { key: 'register', label: 'Criar conta' }]"
            :key="tab.key"
            @click="switchTab(tab.key)"
            :class="[
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-background text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-1.5">
            <Label for="email">E-mail</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="space-y-1.5">
            <Label for="password">Senha</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                class="pr-10"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'register'" class="space-y-1.5">
            <Label for="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="new-password"
              required
            />
          </div>

          <Button
            type="submit"
            class="w-full"
            :loading="loading"
          >
            {{ activeTab === 'login' ? 'Entrar' : 'Criar conta' }}
          </Button>
        </form>
      </Card>
    </div>

    <!-- Toasts -->
    <Teleport to="body">
      <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <!-- handled by ToastContainer in App.vue -->
      </div>
    </Teleport>
  </div>
</template>
