<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { fetchRegistrosPaginated } from '@/services/registroService'
import dayjs from 'dayjs'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import RecordsTab from '@/components/dashboard/RecordsTab.vue'
import StatsTab from '@/components/dashboard/StatsTab.vue'
import BancoHorasTab from '@/components/dashboard/BancoHorasTab.vue'
import GeneralTab from '@/components/dashboard/GeneralTab.vue'
import PendingJustificationsModal from '@/components/justification/PendingJustificationsModal.vue'
import { LayoutDashboard, BarChart3, Clock, Users, AlertTriangle } from 'lucide-vue-next'

const auth = useAuthStore()
const { toast } = useToast()

const activeTab = ref(auth.isRH ? 'stats' : 'records')
const records = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const lastDoc = ref(null)

// Justificativas pendentes (apenas admin/rh)
const pendentesCount = ref(0)
const pendentesRecords = ref([])
const showPendentesModal = ref(false)

async function carregarPendentes() {
  if (!auth.isAdmin && !auth.isRH) return
  try {
    const q = query(collection(db, 'registros'), where('justificativa.status', '==', 'pendente'))
    const snap = await getDocs(q)
    pendentesRecords.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    pendentesCount.value = pendentesRecords.value.length
  } catch {
    // silencioso
  }
}

// Meta de horas/dia do leitor (para cálculo correto do banco na aba Registros)
const metaHorasDia = ref(8)

async function fetchMetaHorasDia() {
  if (auth.isAdminOrRH || !auth.discordId) return
  try {
    const mesAno = dayjs().format('YYYY-MM')
    const usersSnap = await getDocs(
      query(collection(db, 'users'), where('discordId', '==', auth.discordId))
    )
    if (usersSnap.empty) return
    const uid = usersSnap.docs[0].id
    const metaDoc = await getDoc(doc(db, 'users', uid, 'metas', mesAno))
    if (metaDoc.exists() && metaDoc.data().metaHorasDia) {
      metaHorasDia.value = metaDoc.data().metaHorasDia
    }
  } catch {
    // usa padrão 8h
  }
}

// Filtros
const searchQuery = ref('')
const dateStart = ref('')
const dateEnd = ref('')

// Filtro local por usuário (admin) — data é resolvida no Firestore
const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value
  const q = searchQuery.value.toLowerCase()
  return records.value.filter(r =>
    r.usuario?.toLowerCase().includes(q) ||
    r.displayName?.toLowerCase().includes(q)
  )
})

function buildParams(cursor = null) {
  const params = {}
  if (!auth.isAdminOrRH && auth.discordId) params.discordId = auth.discordId
  if (dateStart.value) params.dataInicioParam = dateStart.value
  // Quando apenas dateEnd é definida sem dateStart, busca desde um período bem amplo
  if (!dateStart.value && dateEnd.value) params.dataInicioParam = '2020-01-01'
  if (dateEnd.value) params.dataFimParam = dateEnd.value
  if (cursor) params.cursorDoc = cursor
  if (!auth.isAdminOrRH) params.metaHorasDia = metaHorasDia.value
  return params
}

// Quando filtro de data está ativo, busca TODAS as páginas do intervalo de uma vez
// para evitar problemas de cursor com filtro local por dataFim
const dateFilterActive = computed(() => !!(dateStart.value || dateEnd.value))

async function loadRecords() {
  try {
    loading.value = true
    records.value = []
    lastDoc.value = null
    hasMore.value = false

    if (dateFilterActive.value) {
      // Busca todas as páginas do intervalo selecionado
      let cursor = null
      let more = true
      const all = []
      while (more) {
        const res = await fetchRegistrosPaginated(buildParams(cursor))
        all.push(...res.records)
        cursor = res.lastDoc
        more = res.hasMore && res.records.length > 0
      }
      records.value = all
      hasMore.value = false
    } else {
      const result = await fetchRegistrosPaginated(buildParams())
      records.value = result.records
      lastDoc.value = result.lastDoc
      hasMore.value = result.hasMore
    }
  } catch (err) {
    console.error('[Dashboard] erro ao carregar registros:', err?.code, err?.message)
    toast({ type: 'error', title: 'Erro ao carregar', message: err?.message ?? 'Falha ao carregar registros.' })
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  try {
    loadingMore.value = true
    const result = await fetchRegistrosPaginated(buildParams(lastDoc.value))
    records.value = [...records.value, ...result.records]
    lastDoc.value = result.lastDoc
    hasMore.value = result.hasMore
  } catch (err) {
    console.error('[Dashboard] erro ao carregar mais:', err?.code, err?.message)
    toast({ type: 'error', title: 'Erro', message: 'Falha ao carregar mais registros.' })
  } finally {
    loadingMore.value = false
  }
}

// Quando o filtro de data mudar, só refaz a query quando ambas as datas estiverem
// preenchidas (ou ambas vazias). Evita busca com apenas uma data informada.
watch([dateStart, dateEnd], ([start, end]) => {
  if ((start && end) || (!start && !end)) {
    loadRecords()
  }
})

let socket = null

onMounted(async () => {
  await fetchMetaHorasDia()
  await Promise.all([loadRecords(), carregarPendentes()])
  socket = io(import.meta.env.VITE_API_URL)
  socket.on('registro-atualizado', () => {
    loadRecords()
    carregarPendentes()
  })
})

onUnmounted(() => {
  socket?.disconnect()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <LayoutDashboard class="h-6 w-6 text-primary" />
        Dashboard
      </h1>
      <p class="text-sm text-muted-foreground mt-1">
        Acompanhe seus registros de ponto e estatísticas
      </p>
    </div>

    <!-- Banner de justificativas pendentes (admin/rh) -->
    <div
      v-if="(auth.isAdmin || auth.isRH) && pendentesCount > 0"
      class="flex items-center gap-3 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 px-4 py-3 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors"
      @click="showPendentesModal = true"
    >
      <AlertTriangle class="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
      <p class="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
        {{ pendentesCount }} justificativa{{ pendentesCount > 1 ? 's' : '' }} pendente{{ pendentesCount > 1 ? 's' : '' }} de aprovação — clique para revisar
      </p>
    </div>

    <!-- Modal de justificativas pendentes -->
    <PendingJustificationsModal
      v-if="showPendentesModal"
      :pendentes="pendentesRecords"
      @close="showPendentesModal = false"
      @saved="showPendentesModal = false; carregarPendentes()"
    />

    <!-- Tabs -->
    <Tabs v-model="activeTab">
      <TabsList class="flex-wrap h-auto gap-1">
        <TabsTrigger v-if="!auth.isRH" value="records">
          <LayoutDashboard class="h-3.5 w-3.5" />
          Registros
        </TabsTrigger>
        <TabsTrigger value="stats">
          <BarChart3 class="h-3.5 w-3.5" />
          Estatísticas
        </TabsTrigger>
        <TabsTrigger value="banco-horas">
          <Clock class="h-3.5 w-3.5" />
          Banco de Horas
        </TabsTrigger>
        <TabsTrigger v-if="auth.isAdmin || auth.isRH" value="general">
          <Users class="h-3.5 w-3.5" />
          Resumo Geral
        </TabsTrigger>
      </TabsList>

      <TabsContent v-if="!auth.isRH" value="records">
        <RecordsTab
          :records="filteredRecords"
          :loading="loading"
          :loading-more="loadingMore"
          :has-more="hasMore"
          :search="searchQuery"
          :date-start="dateStart"
          :date-end="dateEnd"
          @update:search="searchQuery = $event"
          @update:dateStart="dateStart = $event"
          @update:dateEnd="dateEnd = $event"
          @refresh="loadRecords"
          @load-more="loadMore"
        />
      </TabsContent>

      <TabsContent value="stats">
        <StatsTab :loading="loading" />
      </TabsContent>

      <TabsContent value="banco-horas">
        <BancoHorasTab :records="records" :loading="loading" />
      </TabsContent>

      <TabsContent v-if="auth.isAdmin || auth.isRH" value="general">
        <GeneralTab :loading="loading" />
      </TabsContent>
    </Tabs>
  </div>
</template>
