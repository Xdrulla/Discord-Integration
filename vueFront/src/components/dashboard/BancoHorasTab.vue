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

// Saldo total: soma histórico + registros do mês atual se ainda não fechados
const saldoHistoricoMin = computed(() =>
  historico.value.reduce((acc, h) => acc + (h.saldoMinutos ?? 0), 0)
)

// O fechamento ocorre no dia 1 do mês seguinte.
// mesAno="2026-02" fechado em 2026-02-01 = saldo acumulado até jan/2026.
// Se o histórico mais recente tem mesAno == mês atual, o mês atual já foi
// fechado e os registros locais do mês atual (ainda em aberto) devem ser somados.
const mesAtual = dayjs().format('YYYY-MM')
const mesAnoMaisRecente = computed(() => historico.value[0]?.mesAno ?? null)

const registrosMesAtual = computed(() =>
  props.records.filter(r => dayjs(r.data).format('YYYY-MM') === mesAtual)
)
const saldoMesAtualMin = computed(() =>
  registrosMesAtual.value.reduce((acc, r) => acc + (r.banco_horas_min ?? 0), 0)
)

// Soma os registros locais do mês atual apenas se o histórico já tem o doc do mês atual
// (i.e., o fechamento do mês anterior já ocorreu e o mês atual ainda está em aberto)
const deveIncluirMesAtualLocal = computed(() =>
  mesAnoMaisRecente.value === mesAtual
)

const saldoTotalMin = computed(() =>
  deveIncluirMesAtualLocal.value
    ? saldoHistoricoMin.value + saldoMesAtualMin.value
    : saldoHistoricoMin.value
)

const maxAbs = computed(() => {
  const vals = historico.value.map(h => Math.abs(h.saldoMinutos ?? 0))
  if (deveIncluirMesAtualLocal.value) vals.push(Math.abs(saldoMesAtualMin.value))
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

  // Adiciona linha do mês atual em aberto se o histórico já tem o doc do mês atual
  // (fechamento já ocorreu, mas o mês corrente ainda está em andamento)
  if (deveIncluirMesAtualLocal.value) {
    rows.unshift({
      key: mesAtual + '-aberto',
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
