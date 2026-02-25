<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { fetchBancoHorasHistorico } from '@/services/bancoHorasService'
import { formatarMinutosParaHoras, extrairMinutosDeString } from '@/utils/timeUtils'
import Card from '@/components/ui/Card.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { TrendingUp, TrendingDown, Minus, History } from 'lucide-vue-next'

dayjs.locale('pt-br')

const props = defineProps({
  records: { type: Array, default: () => [] },
  loading: Boolean,
})

const auth = useAuthStore()
const { toast } = useToast()

const historico = ref([])
const loadingHistorico = ref(true)

onMounted(async () => {
  try {
    historico.value = await fetchBancoHorasHistorico(auth.discordId)
  } catch (err) {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao carregar histórico de banco de horas.' })
  } finally {
    loadingHistorico.value = false
  }
})

// Saldo total: soma histórico fechado + saldo dos registros do mês atual ainda não fechados
const saldoHistoricoMin = computed(() =>
  historico.value.reduce((acc, h) => acc + (h.saldoMinutos ?? 0), 0)
)

// Registros do mês atual (ainda não fechados no histórico)
const mesAtual = dayjs().format('YYYY-MM')
const registrosMesAtual = computed(() =>
  props.records.filter(r => dayjs(r.data).format('YYYY-MM') === mesAtual)
)
const saldoMesAtualMin = computed(() =>
  registrosMesAtual.value.reduce((acc, r) => acc + (r.banco_horas_min ?? 0), 0)
)

// Se o mês atual já aparece no histórico fechado, não somamos duas vezes
const mesAtualNoHistorico = computed(() =>
  historico.value.some(h => h.mesAno === mesAtual)
)

const saldoTotalMin = computed(() => {
  if (mesAtualNoHistorico.value) return saldoHistoricoMin.value
  return saldoHistoricoMin.value + saldoMesAtualMin.value
})

const maxAbs = computed(() => {
  const vals = historico.value.map(h => Math.abs(h.saldoMinutos ?? 0))
  if (!mesAtualNoHistorico.value) vals.push(Math.abs(saldoMesAtualMin.value))
  return Math.max(...vals, 1)
})

// Monta lista para exibição: histórico fechado + mês atual se não fechado
const listaExibicao = computed(() => {
  const rows = historico.value.map(h => ({
    key: h.mesAno,
    label: dayjs(h.mesAno + '-01').format('MMMM [de] YYYY'),
    totalMin: h.saldoMinutos ?? 0,
    fechado: true,
    fechadoEm: h.fechadoEm ? dayjs(h.fechadoEm).format('DD/MM/YYYY') : null,
  }))

  if (!mesAtualNoHistorico.value) {
    rows.unshift({
      key: mesAtual,
      label: dayjs().format('MMMM [de] YYYY') + ' (em aberto)',
      totalMin: saldoMesAtualMin.value,
      fechado: false,
      fechadoEm: null,
    })
  }

  return rows
})
</script>

<template>
  <div class="space-y-4">
    <!-- Saldo total -->
    <Card class="p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Saldo Total Acumulado</p>
          <p
            class="text-4xl font-bold mt-1 font-mono"
            :class="saldoTotalMin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
          >
            {{ formatarMinutosParaHoras(saldoTotalMin) }}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            Histórico fechado + mês atual
          </p>
        </div>
        <div
          :class="[
            'h-16 w-16 rounded-2xl flex items-center justify-center',
            saldoTotalMin > 0 ? 'bg-green-500/10' : saldoTotalMin < 0 ? 'bg-red-500/10' : 'bg-muted'
          ]"
        >
          <TrendingUp v-if="saldoTotalMin > 0" class="h-8 w-8 text-green-500" />
          <TrendingDown v-else-if="saldoTotalMin < 0" class="h-8 w-8 text-red-500" />
          <Minus v-else class="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    </Card>

    <!-- Histórico por mês -->
    <Card class="overflow-hidden">
      <div class="px-4 py-3 border-b border-border flex items-center gap-2">
        <History class="h-4 w-4 text-muted-foreground" />
        <h3 class="font-medium text-sm text-foreground">Histórico por Mês</h3>
      </div>

      <div v-if="loadingHistorico || loading" class="p-4 space-y-2">
        <Skeleton v-for="i in 6" :key="i" class="h-14 w-full" />
      </div>

      <div v-else-if="listaExibicao.length" class="divide-y divide-border">
        <div
          v-for="g in listaExibicao"
          :key="g.key"
          class="flex items-center justify-between px-4 py-3"
        >
          <div>
            <span class="text-sm text-foreground capitalize">{{ g.label }}</span>
            <span v-if="g.fechadoEm" class="block text-xs text-muted-foreground">
              Fechado em {{ g.fechadoEm }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="g.totalMin >= 0 ? 'bg-green-500' : 'bg-red-500'"
                :style="{ width: (Math.abs(g.totalMin) / maxAbs * 100) + '%' }"
              />
            </div>
            <span
              class="font-mono text-sm font-semibold w-20 text-right"
              :class="g.totalMin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
            >
              {{ formatarMinutosParaHoras(g.totalMin) }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="py-12 text-center text-muted-foreground text-sm">
        Nenhum histórico disponível.
      </div>
    </Card>
  </div>
</template>
