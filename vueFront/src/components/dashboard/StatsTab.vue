<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/auth'
import { fetchRegistrosPaginated, fetchResumoMensal } from '@/services/registroService'
import { extrairMinutosDeString, formatarMinutosParaHoras } from '@/utils/timeUtils'
import Card from '@/components/ui/Card.vue'
import Select from '@/components/ui/Select.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import {
  Clock, TrendingUp, TrendingDown, Calendar,
  Target, AlertCircle, Sunrise, Coffee, Star,
} from 'lucide-vue-next'

dayjs.locale('pt-br')

defineProps({
  loading: Boolean,
})

const auth = useAuthStore()

const now = dayjs()
const selectedMonth = ref(now.month() + 1) // 1-12
const selectedYear  = ref(now.year())

// Para admin/rh: seletor de usuário
const usuarios = ref([])
const selectedDiscordId = ref(null)
const loadingUsuarios = ref(false)

onMounted(async () => {
  if (auth.isAdminOrRH) {
    loadingUsuarios.value = true
    try {
      const snap = await getDocs(collection(db, 'users'))
      usuarios.value = snap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter(u => u.discordId)
        .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''))
      // Pré-seleciona o próprio usuário se tiver discordId, senão o primeiro
      const self = usuarios.value.find(u => u.discordId === auth.discordId)
      selectedDiscordId.value = self?.discordId ?? usuarios.value[0]?.discordId ?? null
    } catch {
      // silencioso
    } finally {
      loadingUsuarios.value = false
    }
  } else {
    selectedDiscordId.value = auth.discordId
  }
})

// discordId efetivo para as queries
const effectiveDiscordId = computed(() =>
  auth.isAdminOrRH ? selectedDiscordId.value : auth.discordId
)

const months = [
  { value: 1,  label: 'Janeiro'   }, { value: 2,  label: 'Fevereiro' },
  { value: 3,  label: 'Março'     }, { value: 4,  label: 'Abril'     },
  { value: 5,  label: 'Maio'      }, { value: 6,  label: 'Junho'     },
  { value: 7,  label: 'Julho'     }, { value: 8,  label: 'Agosto'    },
  { value: 9,  label: 'Setembro'  }, { value: 10, label: 'Outubro'   },
  { value: 11, label: 'Novembro'  }, { value: 12, label: 'Dezembro'  },
]

const years = computed(() => {
  const y = []
  for (let i = now.year(); i >= now.year() - 3; i--) y.push(i)
  return y
})

// ── Resumo da API ─────────────────────────────────────────────────────────────
const resumo       = ref(null)
const loadingResumo = ref(false)

async function loadResumo() {
  if (!effectiveDiscordId.value) return
  try {
    loadingResumo.value = true
    resumo.value = await fetchResumoMensal(effectiveDiscordId.value, selectedYear.value, selectedMonth.value)
  } catch {
    resumo.value = null
  } finally {
    loadingResumo.value = false
  }
}

// ── Registros do mês selecionado ──────────────────────────────────────────────
const monthRecords = ref([])
const loadingRecords = ref(false)

// Busca metaHorasDia do Firestore para o usuário/mês selecionado
async function fetchMetaHorasDia() {
  try {
    const m = String(selectedMonth.value).padStart(2, '0')
    const mesAno = `${selectedYear.value}-${m}`
    // Para leitor: usa o próprio uid. Para admin/rh: procura o uid do usuário selecionado no array
    let uid = null
    if (auth.isAdminOrRH) {
      uid = usuarios.value.find(u => u.discordId === selectedDiscordId.value)?.uid ?? null
    } else {
      uid = auth.user?.uid ?? null
    }
    if (!uid) return 8
    const snap = await getDoc(doc(db, 'users', uid, 'metas', mesAno))
    if (snap.exists()) {
      return snap.data().metaHorasDia ?? 8
    }
  } catch { /* silencioso */ }
  return 8
}

async function loadMonthRecords() {
  if (!effectiveDiscordId.value) return
  loadingRecords.value = true
  monthRecords.value = []
  try {
    const m = String(selectedMonth.value).padStart(2, '0')
    const y = selectedYear.value
    const dataInicio = `${y}-${m}-01`
    const lastDay = dayjs(`${y}-${m}-01`).daysInMonth()
    const dataFim = `${y}-${m}-${String(lastDay).padStart(2, '0')}`

    const metaHorasDia = await fetchMetaHorasDia()

    const params = {
      discordId: effectiveDiscordId.value,
      dataInicioParam: dataInicio,
      dataFimParam: dataFim,
      metaHorasDia,
    }

    let cursor = null
    let more = true
    const all = []
    while (more) {
      const res = await fetchRegistrosPaginated({ ...params, cursorDoc: cursor })
      all.push(...res.records)
      cursor = res.lastDoc
      more = res.hasMore && res.records.length > 0
    }
    monthRecords.value = all
  } catch {
    monthRecords.value = []
  } finally {
    loadingRecords.value = false
  }
}

watch([selectedMonth, selectedYear, effectiveDiscordId], async () => {
  // Carrega resumo primeiro para ter a meta correta, depois os registros
  await loadResumo()
  loadMonthRecords()
}, { immediate: true })

const daysWorked = computed(() =>
  monthRecords.value.filter(r => r.hora_saida && r.hora_saida !== '-').length
)

// ── Valores do resumo (API tem prioridade, fallback local) ────────────────────
const totalTrabalhadoMin = computed(() =>
  resumo.value?.total_horas
    ? extrairMinutosDeString(resumo.value.total_horas)
    : monthRecords.value.reduce((acc, r) => acc + extrairMinutosDeString(r.total_horas ?? '0h 0m'), 0)
)

const metaMin = computed(() =>
  resumo.value?.meta ? extrairMinutosDeString(resumo.value.meta) : 0
)

const saldoMesMin = computed(() =>
  resumo.value?.saldoMesAtual
    ? extrairMinutosDeString(resumo.value.saldoMesAtual)
    : resumo.value?.saldo
      ? extrairMinutosDeString(resumo.value.saldo)
      : monthRecords.value.reduce((acc, r) => acc + (r.banco_horas_min ?? 0), 0)
)

const faltamMin = computed(() => {
  if (!metaMin.value) return 0
  const falta = metaMin.value - totalTrabalhadoMin.value
  return falta > 0 ? falta : 0
})

const avgMin = computed(() =>
  daysWorked.value ? Math.round(totalTrabalhadoMin.value / daysWorked.value) : 0
)

const extrasUtilMin       = computed(() => extrairMinutosDeString(resumo.value?.extras?.dia_util       ?? '0h 0m'))
const extrasSabadoMin     = computed(() => extrairMinutosDeString(resumo.value?.extras?.sabado         ?? '0h 0m'))
const extrasDomingoMin    = computed(() => extrairMinutosDeString(resumo.value?.extras?.domingo_feriado ?? '0h 0m'))

const hasExtras = computed(() => extrasSabadoMin.value > 0 || extrasDomingoMin.value > 0)

const statCards = computed(() => [
  {
    title: 'Horas Trabalhadas',
    value: formatarMinutosParaHoras(totalTrabalhadoMin.value),
    sub:   metaMin.value ? `Meta: ${formatarMinutosParaHoras(metaMin.value)}` : null,
    icon:  Clock,
    color: 'text-blue-500',
    bg:    'bg-blue-500/10',
  },
  {
    title: 'Banco do Mês',
    value: formatarMinutosParaHoras(saldoMesMin.value),
    sub:   null,
    icon:  saldoMesMin.value >= 0 ? TrendingUp : TrendingDown,
    color: saldoMesMin.value >= 0 ? 'text-green-500' : 'text-red-500',
    bg:    saldoMesMin.value >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
  },
  {
    title: 'Dias Trabalhados',
    value: String(daysWorked.value),
    sub:   null,
    icon:  Calendar,
    color: 'text-purple-500',
    bg:    'bg-purple-500/10',
  },
  {
    title: faltamMin.value > 0 ? 'Faltam para Meta' : 'Média Diária',
    value: formatarMinutosParaHoras(faltamMin.value > 0 ? faltamMin.value : avgMin.value),
    sub:   faltamMin.value > 0 ? 'Horas restantes no mês' : null,
    icon:  faltamMin.value > 0 ? AlertCircle : Target,
    color: 'text-orange-500',
    bg:    'bg-orange-500/10',
  },
])
</script>

<template>
  <div class="space-y-4">
    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 items-center">
      <!-- Seletor de colaborador (admin/rh) -->
      <div v-if="auth.isAdminOrRH" class="flex items-center gap-2">
        <label class="text-sm text-muted-foreground shrink-0">Colaborador:</label>
        <Select v-model="selectedDiscordId" class="w-48" :disabled="loadingUsuarios">
          <option v-for="u in usuarios" :key="u.discordId" :value="u.discordId">
            {{ u.displayName ?? u.email }}
          </option>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-muted-foreground">Mês:</label>
        <Select v-model="selectedMonth" class="w-36">
          <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-muted-foreground">Ano:</label>
        <Select v-model="selectedYear" class="w-24">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </Select>
      </div>
    </div>

    <!-- Cards principais -->
    <div v-if="loadingResumo || loadingRecords" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton v-for="i in 4" :key="i" class="h-28" />
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        v-for="card in statCards"
        :key="card.title"
        class="p-5 flex items-start gap-4"
      >
        <div :class="['h-10 w-10 rounded-lg flex items-center justify-center shrink-0', card.bg]">
          <component :is="card.icon" :class="['h-5 w-5', card.color]" />
        </div>
        <div>
          <p class="text-sm text-muted-foreground">{{ card.title }}</p>
          <p class="text-2xl font-bold text-foreground mt-0.5">{{ card.value }}</p>
          <p v-if="card.sub" class="text-xs text-muted-foreground mt-0.5">{{ card.sub }}</p>
        </div>
      </Card>
    </div>

    <!-- Breakdown por tipo de dia -->
    <Card class="overflow-hidden">
      <div class="px-4 py-3 border-b border-border">
        <h3 class="font-medium text-sm text-foreground">Horas por tipo de dia</h3>
      </div>
      <div v-if="loadingResumo || loadingRecords" class="p-4 space-y-2">
        <Skeleton v-for="i in 3" :key="i" class="h-12 w-full" />
      </div>
      <div v-else class="divide-y divide-border">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Sunrise class="h-4 w-4 text-blue-500" />
            </div>
            <span class="text-sm text-foreground">Dias Úteis</span>
          </div>
          <span class="font-mono text-sm font-semibold text-foreground">
            {{ resumo?.extras?.dia_util ?? '—' }}
          </span>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Coffee class="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <span class="text-sm text-foreground">Sábados</span>
              <span v-if="extrasSabadoMin > 0" class="ml-2 text-xs text-orange-500 font-medium">extra</span>
            </div>
          </div>
          <span class="font-mono text-sm font-semibold" :class="extrasSabadoMin > 0 ? 'text-orange-500' : 'text-foreground'">
            {{ resumo?.extras?.sabado ?? '—' }}
          </span>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Star class="h-4 w-4 text-red-500" />
            </div>
            <div>
              <span class="text-sm text-foreground">Domingos / Feriados</span>
              <span v-if="extrasDomingoMin > 0" class="ml-2 text-xs text-red-500 font-medium">extra</span>
            </div>
          </div>
          <span class="font-mono text-sm font-semibold" :class="extrasDomingoMin > 0 ? 'text-red-500' : 'text-foreground'">
            {{ resumo?.extras?.domingo_feriado ?? '—' }}
          </span>
        </div>
      </div>
    </Card>

    <!-- Tabela de registros do mês -->
    <Card class="overflow-hidden">
      <div class="px-4 py-3 border-b border-border">
        <h3 class="font-medium text-foreground text-sm">
          Registros de {{ months.find(m => m.value === Number(selectedMonth))?.label }} {{ selectedYear }}
        </h3>
      </div>
      <div v-if="loadingRecords" class="p-4 space-y-2">
        <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
      </div>
      <div v-else-if="monthRecords.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/50 border-b border-border">
            <tr>
              <th class="text-left px-4 py-2.5 text-muted-foreground font-medium">Data</th>
              <th class="text-left px-4 py-2.5 text-muted-foreground font-medium">Tipo</th>
              <th class="text-left px-4 py-2.5 text-muted-foreground font-medium">Entrada</th>
              <th class="text-left px-4 py-2.5 text-muted-foreground font-medium">Saída</th>
              <th class="text-left px-4 py-2.5 text-muted-foreground font-medium">Horas</th>
              <th class="text-left px-4 py-2.5 text-muted-foreground font-medium">Banco</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="r in monthRecords" :key="r.id" class="hover:bg-muted/30">
              <td class="px-4 py-2.5">{{ dayjs(r.data).format('DD/MM') }}</td>
              <td class="px-4 py-2.5">
                <span
                  class="text-xs font-medium px-1.5 py-0.5 rounded"
                  :class="{
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400':   dayjs(r.data).day() !== 0 && dayjs(r.data).day() !== 6,
                    'bg-orange-500/10 text-orange-600 dark:text-orange-400': dayjs(r.data).day() === 6,
                    'bg-red-500/10 text-red-600 dark:text-red-400':      dayjs(r.data).day() === 0,
                  }"
                >
                  {{ dayjs(r.data).day() === 0 ? 'Domingo' : dayjs(r.data).day() === 6 ? 'Sábado' : 'Útil' }}
                </span>
              </td>
              <td class="px-4 py-2.5 font-mono">{{ r.hora_entrada ?? '—' }}</td>
              <td class="px-4 py-2.5 font-mono">{{ r.hora_saida ?? '—' }}</td>
              <td class="px-4 py-2.5 font-mono">{{ r.total_horas ?? '—' }}</td>
              <td
                class="px-4 py-2.5 font-mono font-semibold"
                :class="(r.banco_horas_min ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ r.banco_horas ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="py-12 text-center text-muted-foreground text-sm">
        Nenhum registro neste período.
      </div>
    </Card>
  </div>
</template>
