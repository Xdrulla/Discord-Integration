<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { fetchBancoHorasHistorico } from '@/services/bancoHorasService'
import { formatarMinutosParaHoras } from '@/utils/timeUtils'
import Card from '@/components/ui/Card.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Avatar from '@/components/ui/Avatar.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { TrendingUp, TrendingDown, Minus, History, Users } from 'lucide-vue-next'

dayjs.locale('pt-br')

const props = defineProps({
  records: { type: Array, default: () => [] },
  loading: Boolean,
})

const auth = useAuthStore()
const { toast } = useToast()

// Histórico do próprio usuário
const historico = ref([])
const loadingHistorico = ref(true)

// Visão consolidada para admin/rh: { discordId, displayName, historico[] }
const todosUsuarios = ref([])
const loadingTodos = ref(true)

onMounted(async () => {
  try {
    // Sempre carrega o histórico do próprio usuário (leitor/admin/rh)
    if (auth.discordId) {
      historico.value = await fetchBancoHorasHistorico(auth.discordId)
    }
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao carregar histórico de banco de horas.' })
  } finally {
    loadingHistorico.value = false
  }

  // Para admin/rh: carrega histórico de todos os usuários
  if (auth.isAdminOrRH) {
    try {
      const snap = await getDocs(collection(db, 'users'))
      const usuarios = snap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter(u => u.discordId)

      const resultados = await Promise.all(
        usuarios.map(async (u) => {
          const hist = await fetchBancoHorasHistorico(u.discordId)
          const saldoTotal = hist.reduce((acc, h) => acc + (h.saldoMinutos ?? 0), 0)
          return {
            discordId: u.discordId,
            displayName: u.displayName ?? u.email?.split('@')[0] ?? u.discordId,
            historico: hist,
            saldoTotal,
          }
        })
      )
      todosUsuarios.value = resultados.sort((a, b) => b.saldoTotal - a.saldoTotal)
    } catch {
      // silencioso
    } finally {
      loadingTodos.value = false
    }
  } else {
    loadingTodos.value = false
  }
})

// ── Visão pessoal (todos os roles) ──────────────────────────────────────────

// Saldo acumulado = apenas meses fechados (não inclui mês atual em aberto)
const saldoTotalMin = computed(() =>
  historico.value.reduce((acc, h) => acc + (h.saldoMinutos ?? 0), 0)
)

const maxAbs = computed(() =>
  Math.max(...historico.value.map(h => Math.abs(h.saldoMinutos ?? 0)), 1)
)

const listaExibicao = computed(() =>
  historico.value.map(h => ({
    key: h.mesAno,
    label: dayjs(h.mesAno + '-01').format('MMMM [de] YYYY'),
    totalMin: h.saldoMinutos ?? 0,
    fechadoEm: h.fechadoEm ? dayjs(h.fechadoEm).format('DD/MM/YYYY') : null,
  }))
)

// ── Visão consolidada admin/rh ───────────────────────────────────────────────

// Total geral de todos os usuários (meses fechados)
const saldoConsolidadoMin = computed(() =>
  todosUsuarios.value.reduce((acc, u) => acc + u.saldoTotal, 0)
)

// Para a tabela de usuários × meses: coleta todos os meses presentes
const mesesPresentes = computed(() => {
  const set = new Set()
  todosUsuarios.value.forEach(u => u.historico.forEach(h => set.add(h.mesAno)))
  return [...set].sort((a, b) => b.localeCompare(a)).slice(0, 6)
})
</script>

<template>
  <div class="space-y-6">

    <!-- ── VISÃO PESSOAL (leitor e admin — RH não tem banco pessoal) ─────────── -->
    <div v-if="!auth.isRH && (!auth.isAdmin || historico.length > 0)" class="space-y-4">
      <h3 v-if="auth.isAdmin" class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Meu Banco de Horas
      </h3>

      <!-- Saldo pessoal -->
      <Card class="p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Saldo Acumulado (meses fechados)</p>
            <p
              class="text-4xl font-bold mt-1 font-mono"
              :class="saldoTotalMin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
            >
              {{ formatarMinutosParaHoras(saldoTotalMin) }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Apenas meses já fechados · mês atual na aba Estatísticas
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

      <!-- Histórico pessoal por mês -->
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
          Nenhum histórico disponível. Feche um mês para registrar o banco.
        </div>
      </Card>
    </div>

    <!-- ── VISÃO CONSOLIDADA (admin/rh) ───────────────────────────────────── -->
    <div v-if="auth.isAdminOrRH" class="space-y-4">
      <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Users class="h-4 w-4" />
        Banco de Horas — Todos os Usuários
      </h3>

      <!-- Total consolidado -->
      <Card class="p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Consolidado (meses fechados)</p>
            <p
              class="text-3xl font-bold mt-1 font-mono"
              :class="saldoConsolidadoMin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
            >
              {{ formatarMinutosParaHoras(saldoConsolidadoMin) }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">Soma de todos os colaboradores</p>
          </div>
        </div>
      </Card>

      <!-- Tabela por usuário -->
      <Card class="overflow-hidden">
        <div class="px-4 py-3 border-b border-border">
          <h3 class="font-medium text-sm text-foreground">Acumulado por Colaborador</h3>
        </div>

        <div v-if="loadingTodos" class="p-4 space-y-2">
          <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
        </div>

        <div v-else-if="todosUsuarios.length" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/50 border-b border-border">
              <tr>
                <th class="text-left px-4 py-2.5 text-muted-foreground font-medium">Colaborador</th>
                <th
                  v-for="mes in mesesPresentes"
                  :key="mes"
                  class="text-right px-4 py-2.5 text-muted-foreground font-medium capitalize"
                >
                  {{ dayjs(mes + '-01').format('MMM/YY') }}
                </th>
                <th class="text-right px-4 py-2.5 text-muted-foreground font-medium">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="u in todosUsuarios" :key="u.discordId" class="hover:bg-muted/30">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <Avatar :fallback="u.displayName" size="sm" />
                    <span class="text-sm font-medium text-foreground">{{ u.displayName }}</span>
                  </div>
                </td>
                <td
                  v-for="mes in mesesPresentes"
                  :key="mes"
                  class="px-4 py-3 text-right font-mono text-sm"
                  :class="(u.historico.find(h => h.mesAno === mes)?.saldoMinutos ?? 0) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'"
                >
                  {{ formatarMinutosParaHoras(u.historico.find(h => h.mesAno === mes)?.saldoMinutos ?? 0) }}
                </td>
                <td
                  class="px-4 py-3 text-right font-mono text-sm font-semibold"
                  :class="u.saldoTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ formatarMinutosParaHoras(u.saldoTotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="py-12 text-center text-muted-foreground text-sm">
          Nenhum histórico disponível. Feche um mês para registrar os bancos.
        </div>
      </Card>
    </div>

  </div>
</template>
