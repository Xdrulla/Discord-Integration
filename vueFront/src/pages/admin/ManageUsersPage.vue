<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import Switch from '@/components/ui/Switch.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Badge from '@/components/ui/Badge.vue'
import { Users, ChevronDown, ChevronUp } from 'lucide-vue-next'

const { toast } = useToast()
const users = ref([])
const loading = ref(true)
const expandedRows = ref(new Set())

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao carregar usuários.' })
  } finally {
    loading.value = false
  }
})

const handleRoleChange = async (userId, newRole) => {
  try {
    await updateDoc(doc(db, 'users', userId), { role: newRole })
    const idx = users.value.findIndex(u => u.id === userId)
    if (idx !== -1) users.value[idx].role = newRole
    toast({ type: 'success', title: 'Sucesso', message: 'Permissão atualizada.' })
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar permissão.' })
  }
}

const handleNotifChange = async (userId, field, value) => {
  try {
    await updateDoc(doc(db, 'users', userId), { [field]: value })
    const idx = users.value.findIndex(u => u.id === userId)
    if (idx !== -1) users.value[idx][field] = value
    toast({ type: 'success', title: 'Sucesso', message: 'Notificação atualizada.' })
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar notificação.' })
  }
}

const toggleRow = (id) => {
  if (expandedRows.value.has(id)) expandedRows.value.delete(id)
  else expandedRows.value.add(id)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <Users class="h-6 w-6 text-primary" />
        Gerenciar Usuários
      </h1>
      <p class="text-sm text-muted-foreground mt-1">
        Gerencie permissões e preferências de notificação dos usuários.
      </p>
    </div>

    <Card class="overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="p-4 space-y-3">
        <Skeleton v-for="i in 5" :key="i" class="h-14 w-full" />
      </div>

      <template v-else>
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-border bg-muted/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Permissão</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Notif. Admin</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Notif. Leitor</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="user in users" :key="user.id" class="hover:bg-muted/30">
              <td class="px-4 py-3 text-foreground max-w-48 truncate">{{ user.email }}</td>
              <td class="px-4 py-3 text-foreground">{{ user.displayName ?? '—' }}</td>
              <td class="px-4 py-3">
                <Select
                  :model-value="user.role ?? 'leitor'"
                  class="w-28"
                  @update:model-value="handleRoleChange(user.id, $event)"
                >
                  <option value="admin">Admin</option>
                  <option value="rh">RH</option>
                  <option value="leitor">Leitor</option>
                </Select>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <Switch
                    :model-value="!!user.receberNotificacoes"
                    :disabled="user.role !== 'admin'"
                    @update:model-value="handleNotifChange(user.id, 'receberNotificacoes', $event)"
                  />
                  <span class="text-xs text-muted-foreground">
                    {{ user.role !== 'admin' ? 'N/A' : user.receberNotificacoes ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <Switch
                    :model-value="!!user.receberNotificacoesLeitor"
                    :disabled="user.role !== 'leitor'"
                    @update:model-value="handleNotifChange(user.id, 'receberNotificacoesLeitor', $event)"
                  />
                  <span class="text-xs text-muted-foreground">
                    {{ user.role !== 'leitor' ? 'N/A' : user.receberNotificacoesLeitor ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden divide-y divide-border">
        <div v-for="user in users" :key="user.id" class="p-4">
          <button
            class="flex w-full items-center justify-between text-left"
            @click="toggleRow(user.id)"
          >
            <div>
              <p class="text-sm font-medium text-foreground">{{ user.email }}</p>
              <Badge :variant="user.role === 'admin' ? 'default' : user.role === 'rh' ? 'warning' : 'secondary'" class="mt-1">
                {{ user.role ?? 'leitor' }}
              </Badge>
            </div>
            <ChevronDown v-if="!expandedRows.has(user.id)" class="h-4 w-4 text-muted-foreground" />
            <ChevronUp v-else class="h-4 w-4 text-muted-foreground" />
          </button>

          <div v-if="expandedRows.has(user.id)" class="mt-4 space-y-4 pl-1">
            <div>
              <p class="text-xs text-muted-foreground mb-1">Permissão</p>
              <Select
                :model-value="user.role ?? 'leitor'"
                class="w-full"
                @update:model-value="handleRoleChange(user.id, $event)"
              >
                <option value="admin">Admin</option>
                <option value="rh">RH</option>
                <option value="leitor">Leitor</option>
              </Select>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Notificações (Admin)</span>
                <div class="flex items-center gap-2">
                  <Switch
                    :model-value="!!user.receberNotificacoes"
                    :disabled="user.role !== 'admin'"
                    @update:model-value="handleNotifChange(user.id, 'receberNotificacoes', $event)"
                  />
                  <span class="text-xs text-muted-foreground">
                    {{ user.role !== 'admin' ? 'N/A' : user.receberNotificacoes ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Notificações (Leitor)</span>
                <div class="flex items-center gap-2">
                  <Switch
                    :model-value="!!user.receberNotificacoesLeitor"
                    :disabled="user.role !== 'leitor'"
                    @update:model-value="handleNotifChange(user.id, 'receberNotificacoesLeitor', $event)"
                  />
                  <span class="text-xs text-muted-foreground">
                    {{ user.role !== 'leitor' ? 'N/A' : user.receberNotificacoesLeitor ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </template>

      <div v-if="!loading && !users.length" class="py-16 text-center text-muted-foreground text-sm">
        Nenhum usuário encontrado.
      </div>
    </Card>
  </div>
</template>
