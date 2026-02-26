<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchRegistros } from '@/services/registroService'
import { formatarMinutosParaHoras, extrairMinutosDeString } from '@/utils/timeUtils'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Avatar from '@/components/ui/Avatar.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { Users } from 'lucide-vue-next'

dayjs.locale('pt-br')

const { toast } = useToast()
const loading = ref(true)
const allRecords = ref([])

onMounted(async () => {
  try {
    allRecords.value = await fetchRegistros({ diasRetroativos: 30, maxResults: 200 })
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao carregar dados gerais.' })
  } finally {
    loading.value = false
  }
})

const byUser = computed(() => {
  const map = {}
  const now = dayjs()
  const m = now.month()
  const y = now.year()

  for (const r of allRecords.value) {
    const d = dayjs(r.data)
    if (d.month() !== m || d.year() !== y) continue

    const key = r.discordId ?? r.usuario
    if (!map[key]) {
      map[key] = {
        name: r.displayName ?? r.usuario,
        bancoMin: 0,
        totalMin: 0,
        dias: 0,
      }
    }
    // banco_horas_min é numérico; total_horas é string "Xh Ym"
    map[key].bancoMin += r.banco_horas_min ?? 0
    map[key].totalMin += extrairMinutosDeString(r.total_horas ?? '0h 0m')
    if (r.hora_saida && r.hora_saida !== '-') map[key].dias++
  }

  return Object.values(map).sort((a, b) => b.totalMin - a.totalMin)
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <Users class="h-5 w-5 text-primary" />
      <h2 class="font-semibold text-foreground capitalize">
        Resumo Geral — {{ dayjs().format('MMMM [de] YYYY') }}
      </h2>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Skeleton v-for="i in 6" :key="i" class="h-32" />
    </div>

    <div v-else-if="byUser.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="user in byUser"
        :key="user.name"
        class="p-4 space-y-3"
      >
        <div class="flex items-center gap-3">
          <Avatar :fallback="user.name" />
          <div class="min-w-0">
            <p class="font-medium text-sm text-foreground truncate">{{ user.name }}</p>
            <p class="text-xs text-muted-foreground">{{ user.dias }} dias trabalhados</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1 border-t border-border">
          <div>
            <p class="text-xs text-muted-foreground">Total Horas</p>
            <p class="text-sm font-mono font-semibold text-foreground">
              {{ formatarMinutosParaHoras(user.totalMin) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Banco</p>
            <p
              class="text-sm font-mono font-semibold"
              :class="user.bancoMin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
            >
              {{ formatarMinutosParaHoras(user.bancoMin) }}
            </p>
          </div>
        </div>
      </Card>
    </div>

    <div v-else class="flex flex-col items-center py-16 text-muted-foreground gap-2">
      <Users class="h-10 w-10 opacity-30" />
      <p class="text-sm">Nenhum dado disponível neste período.</p>
    </div>
  </div>
</template>
