<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { Target, Save } from 'lucide-vue-next'
import dayjs from 'dayjs'

const { toast } = useToast()

// Usuários
const usuarios = ref([])
const loadingUsuarios = ref(true)

// Seleção
const selectedUserId = ref('')
const selectedMes = ref(dayjs().format('YYYY-MM'))

// Meta do usuário selecionado para o mês selecionado
const metaHorasDia = ref(8)
const loadingMeta = ref(false)
const saving = ref(false)

// Meses disponíveis (mês atual + 5 anteriores)
const mesesDisponiveis = computed(() => {
  const m = []
  for (let i = 0; i < 6; i++) {
    const d = dayjs().subtract(i, 'month')
    m.push({ value: d.format('YYYY-MM'), label: d.format('MMMM [de] YYYY') })
  }
  return m
})

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    usuarios.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.discordId)
      .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''))
    if (usuarios.value.length) {
      selectedUserId.value = usuarios.value[0].id
    }
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao carregar usuários.' })
  } finally {
    loadingUsuarios.value = false
  }
})

// Carrega meta do usuário/mês selecionado sempre que mudar a seleção
watch([selectedUserId, selectedMes], async ([uid, mes]) => {
  if (!uid || !mes) return
  loadingMeta.value = true
  try {
    const metaRef = doc(db, 'users', uid, 'metas', mes)
    const snap = await getDoc(metaRef)
    if (snap.exists()) {
      const data = snap.data()
      // Lê metaHorasDia se disponível, senão converte do formato antigo (metaMinutos como total mensal)
      if (data.metaHorasDia) {
        metaHorasDia.value = data.metaHorasDia
      } else {
        metaHorasDia.value = 8
      }
    } else {
      metaHorasDia.value = 8
    }
  } catch {
    metaHorasDia.value = 8
  } finally {
    loadingMeta.value = false
  }
}, { immediate: true })

const handleSave = async () => {
  if (!selectedUserId.value || !selectedMes.value) return
  saving.value = true
  try {
    // Salva apenas metaHorasDia — o backend multiplica por diasUteis para obter o total mensal
    const metaRef = doc(db, 'users', selectedUserId.value, 'metas', selectedMes.value)
    await setDoc(metaRef, {
      metaHorasDia: metaHorasDia.value,
    }, { merge: true })
    toast({ type: 'success', title: 'Salvo', message: 'Meta atualizada com sucesso.' })
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao salvar meta.' })
  } finally {
    saving.value = false
  }
}

const selectedUser = computed(() => usuarios.value.find(u => u.id === selectedUserId.value))
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <Target class="h-6 w-6 text-primary" />
        Metas por Colaborador
      </h1>
      <p class="text-sm text-muted-foreground mt-1">
        Configure metas individuais de horas por dia para cada colaborador em cada mês.
      </p>
    </div>

    <Card class="p-6">
      <div v-if="loadingUsuarios" class="space-y-4">
        <Skeleton v-for="i in 3" :key="i" class="h-16 w-full" />
      </div>

      <div v-else class="space-y-5 max-w-lg">
        <!-- Seleção de usuário -->
        <div class="space-y-1.5">
          <Label>Colaborador</Label>
          <Select v-model="selectedUserId" class="w-full">
            <option v-for="u in usuarios" :key="u.id" :value="u.id">
              {{ u.displayName ?? u.email }}
            </option>
          </Select>
          <p v-if="selectedUser?.discordId" class="text-xs text-muted-foreground">
            Discord ID: {{ selectedUser.discordId }}
          </p>
        </div>

        <!-- Seleção de mês -->
        <div class="space-y-1.5">
          <Label>Mês de referência</Label>
          <Select v-model="selectedMes" class="w-full">
            <option v-for="m in mesesDisponiveis" :key="m.value" :value="m.value" class="capitalize">
              {{ m.label }}
            </option>
          </Select>
        </div>

        <!-- Meta de horas/dia -->
        <div class="space-y-1.5">
          <Label>Horas por Dia (jornada)</Label>
          <div v-if="loadingMeta">
            <Skeleton class="h-10 w-full" />
          </div>
          <div v-else class="flex items-center gap-3">
            <Input v-model.number="metaHorasDia" type="number" min="1" max="24" step="0.5" class="w-28" />
            <span class="text-sm text-muted-foreground">horas/dia útil</span>
          </div>
          <p class="text-xs text-muted-foreground">
            Jornada diária deste colaborador. Use <strong>6h</strong> para estagiários ou valores como <strong>4h</strong> para contratos parciais.
            O total mensal é calculado automaticamente como <em>horas/dia × dias úteis do mês</em>.
          </p>
          <div v-if="!loadingMeta && metaHorasDia" class="mt-1.5 rounded-md bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground">
            Estimativa: ~{{ Math.round(metaHorasDia * 22) }}h/mês <span class="opacity-60">(considerando ≈22 dias úteis)</span>
          </div>
        </div>

        <Button :loading="saving" :disabled="!selectedUserId || loadingMeta" @click="handleSave">
          <Save class="h-4 w-4" />
          Salvar Meta
        </Button>
      </div>

      <div v-if="!loadingUsuarios && !usuarios.length" class="py-8 text-center text-muted-foreground text-sm">
        Nenhum colaborador com Discord ID configurado.
      </div>
    </Card>
  </div>
</template>
