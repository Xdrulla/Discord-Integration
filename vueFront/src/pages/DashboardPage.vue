<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { fetchRegistrosPaginated } from '@/services/registroService'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import RecordsTab from '@/components/dashboard/RecordsTab.vue'
import StatsTab from '@/components/dashboard/StatsTab.vue'
import BancoHorasTab from '@/components/dashboard/BancoHorasTab.vue'
import GeneralTab from '@/components/dashboard/GeneralTab.vue'
import { LayoutDashboard, BarChart3, Clock, Users } from 'lucide-vue-next'

const auth = useAuthStore()
const { toast } = useToast()

const activeTab = ref('records')
const records = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const lastDoc = ref(null)

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
  if (!auth.isAdmin && auth.discordId) params.discordId = auth.discordId
  if (dateStart.value) params.dataInicioParam = dateStart.value
  if (dateEnd.value) params.dataFimParam = dateEnd.value
  if (cursor) params.cursorDoc = cursor
  return params
}

async function loadRecords() {
  try {
    loading.value = true
    records.value = []
    lastDoc.value = null
    hasMore.value = false

    const result = await fetchRegistrosPaginated(buildParams())
    records.value = result.records
    lastDoc.value = result.lastDoc
    hasMore.value = result.hasMore
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

// Quando o filtro de data mudar, refaz a query no Firestore
watch([dateStart, dateEnd], () => {
  loadRecords()
})

let socket = null

onMounted(async () => {
  await loadRecords()
  socket = io(import.meta.env.VITE_API_URL)
  socket.on('registro-atualizado', () => {
    loadRecords()
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

    <!-- Tabs -->
    <Tabs v-model="activeTab">
      <TabsList class="flex-wrap h-auto gap-1">
        <TabsTrigger value="records">
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
        <TabsTrigger v-if="auth.isAdmin" value="general">
          <Users class="h-3.5 w-3.5" />
          Resumo Geral
        </TabsTrigger>
      </TabsList>

      <TabsContent value="records">
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
        <StatsTab :records="records" :loading="loading" />
      </TabsContent>

      <TabsContent value="banco-horas">
        <BancoHorasTab :records="records" :loading="loading" />
      </TabsContent>

      <TabsContent v-if="auth.isAdmin" value="general">
        <GeneralTab :loading="loading" />
      </TabsContent>
    </Tabs>
  </div>
</template>
