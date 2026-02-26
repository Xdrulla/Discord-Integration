<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import { User, Lock, Hash, Save } from 'lucide-vue-next'

const auth = useAuthStore()
const { toast } = useToast()

// Profile form
const displayName = ref(auth.displayName ?? '')
const discordId = ref(auth.discordId ?? '')
const savingProfile = ref(false)

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const savingPassword = ref(false)

const handleSaveProfile = async () => {
  savingProfile.value = true
  try {
    if (displayName.value !== auth.displayName) {
      await auth.updateDisplayName(displayName.value)
    }
    if (discordId.value !== auth.discordId) {
      await auth.updateDiscordId(discordId.value)
    }
    toast({ type: 'success', title: 'Perfil atualizado', message: 'Suas informações foram salvas.' })
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao salvar perfil.' })
  } finally {
    savingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    toast({ type: 'warning', title: 'Atenção', message: 'Preencha todos os campos.' })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast({ type: 'error', title: 'Erro', message: 'As senhas não coincidem.' })
    return
  }
  if (newPassword.value.length < 6) {
    toast({ type: 'error', title: 'Erro', message: 'A nova senha deve ter ao menos 6 caracteres.' })
    return
  }

  savingPassword.value = true
  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    toast({ type: 'success', title: 'Sucesso', message: 'Senha alterada com sucesso.' })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    const msg = err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
      ? 'Senha atual incorreta.'
      : 'Falha ao alterar senha.'
    toast({ type: 'error', title: 'Erro', message: msg })
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <User class="h-6 w-6 text-primary" />
        Meu Perfil
      </h1>
      <p class="text-sm text-muted-foreground mt-1">
        Gerencie suas informações pessoais e configurações de conta.
      </p>
    </div>

    <!-- Profile info card -->
    <Card class="p-6 space-y-5">
      <div class="flex items-center gap-4">
        <Avatar :fallback="auth.displayName" size="lg" />
        <div>
          <p class="font-semibold text-foreground">{{ auth.displayName }}</p>
          <p class="text-sm text-muted-foreground">{{ auth.user?.email }}</p>
          <Badge :variant="auth.isAdmin ? 'default' : 'secondary'" class="mt-1">
            {{ auth.isAdmin ? 'Admin' : 'Leitor' }}
          </Badge>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
        <div class="space-y-1.5">
          <Label for="displayName">
            <User class="h-3.5 w-3.5 inline mr-1" />
            Nome de exibição
          </Label>
          <Input id="displayName" v-model="displayName" placeholder="Seu nome" />
        </div>

        <div class="space-y-1.5">
          <Label for="discordId">
            <Hash class="h-3.5 w-3.5 inline mr-1" />
            Discord ID
          </Label>
          <Input id="discordId" v-model="discordId" placeholder="123456789..." />
        </div>
      </div>

      <Button :loading="savingProfile" @click="handleSaveProfile">
        <Save class="h-4 w-4" />
        Salvar Perfil
      </Button>
    </Card>

    <!-- Change password card -->
    <Card class="p-6 space-y-4">
      <div class="flex items-center gap-2">
        <Lock class="h-5 w-5 text-muted-foreground" />
        <h2 class="font-semibold text-foreground">Alterar Senha</h2>
      </div>

      <div class="space-y-3">
        <div class="space-y-1.5">
          <Label for="currentPwd">Senha atual</Label>
          <Input id="currentPwd" v-model="currentPassword" type="password" placeholder="••••••••" />
        </div>

        <div class="space-y-1.5">
          <Label for="newPwd">Nova senha</Label>
          <Input id="newPwd" v-model="newPassword" type="password" placeholder="••••••••" />
        </div>

        <div class="space-y-1.5">
          <Label for="confirmPwd">Confirmar nova senha</Label>
          <Input id="confirmPwd" v-model="confirmPassword" type="password" placeholder="••••••••" />
        </div>
      </div>

      <Button variant="outline" :loading="savingPassword" @click="handleChangePassword">
        <Lock class="h-4 w-4" />
        Alterar Senha
      </Button>
    </Card>
  </div>
</template>
