<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import JustificationModal from '@/components/justification/JustificationModal.vue'
import AddManualRecordModal from '@/components/admin/AddManualRecordModal.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { Search, Plus, RefreshCw, ChevronDown, ChevronUp } from 'lucide-vue-next'

dayjs.locale('pt-br')

const props = defineProps({
  records: { type: Array, default: () => [] },
  loading: Boolean,
  loadingMore: Boolean,
  hasMore: Boolean,
  search: String,
  dateStart: String,
  dateEnd: String,
})
const emit = defineEmits(['update:search', 'update:dateStart', 'update:dateEnd', 'refresh', 'load-more'])

const auth = useAuthStore()

const expandedRows = ref(new Set())
const showJustModal = ref(false)
const showManualModal = ref(false)
const selectedRecord = ref(null)

const toggleRow = (id) => {
  if (expandedRows.value.has(id)) expandedRows.value.delete(id)
  else expandedRows.value.add(id)
}

const openJustification = (record) => {
  selectedRecord.value = record
  showJustModal.value = true
}

const hasExit = (record) => record.hora_saida && record.hora_saida !== '-'

const statusVariant = (record) => {
  if (!hasExit(record)) return 'warning'
  if (record.justificativa?.status === 'aprovado') return 'success'
  if (record.justificativa?.status === 'pendente') return 'warning'
  return 'secondary'
}

const statusLabel = (record) => {
  if (!hasExit(record)) return 'Em aberto'
  if (record.justificativa?.status === 'aprovado') return 'Justificado'
  if (record.justificativa?.status === 'pendente') return 'Pendente'
  return 'Completo'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Busca por usuário — somente admin -->
      <div v-if="auth.isAdmin" class="relative flex-1 min-w-48">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          :model-value="search"
          @update:model-value="emit('update:search', $event)"
          placeholder="Buscar usuário..."
          class="pl-9"
        />
      </div>

      <!-- Filtro por data — admin e leitor -->
      <div class="flex items-center gap-2">
        <Input
          :model-value="dateStart"
          @update:model-value="emit('update:dateStart', $event)"
          type="date"
          class="w-36"
          title="Data inicial"
        />
        <span class="text-muted-foreground text-sm">até</span>
        <Input
          :model-value="dateEnd"
          @update:model-value="emit('update:dateEnd', $event)"
          type="date"
          class="w-36"
          title="Data final"
        />
      </div>

      <Button variant="outline" size="sm" @click="emit('refresh')" :disabled="loading">
        <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        Atualizar
      </Button>

      <!-- Registro Manual — admin e leitor -->
      <Button size="sm" @click="showManualModal = true">
        <Plus class="h-4 w-4" />
        Registro Manual
      </Button>
    </div>

    <!-- Table Card -->
    <Card class="overflow-hidden">
      <!-- Loading skeletons -->
      <div v-if="loading" class="p-4 space-y-3">
        <Skeleton v-for="i in 8" :key="i" class="h-12 w-full" />
      </div>

      <!-- Table -->
      <div v-else-if="records.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-border bg-muted/50">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground w-8"></th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
              <th v-if="auth.isAdmin" class="text-left px-4 py-3 font-medium text-muted-foreground">Usuário</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Entrada</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Saída</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Horas</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Banco</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <template v-for="record in records" :key="record.id">
              <tr class="hover:bg-muted/30 transition-colors">
                <!-- Expand -->
                <td class="px-4 py-3">
                  <button
                    @click="toggleRow(record.id)"
                    class="text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown v-if="!expandedRows.has(record.id)" class="h-4 w-4" />
                    <ChevronUp v-else class="h-4 w-4" />
                  </button>
                </td>
                <!-- Data -->
                <td class="px-4 py-3 text-foreground">
                  {{ dayjs(record.data).format('DD/MM/YYYY') }}
                </td>
                <!-- Usuário -->
                <td v-if="auth.isAdmin" class="px-4 py-3 text-foreground max-w-36 truncate">
                  {{ record.displayName ?? record.usuario }}
                </td>
                <!-- Hora entrada -->
                <td class="px-4 py-3 text-foreground font-mono">
                  {{ record.hora_entrada ?? '—' }}
                </td>
                <!-- Hora saída -->
                <td class="px-4 py-3 font-mono" :class="record.hora_saida ? 'text-foreground' : 'text-muted-foreground'">
                  {{ record.hora_saida ?? '—' }}
                </td>
                <!-- Total horas -->
                <td class="px-4 py-3 font-mono text-foreground">
                  {{ record.total_horas ?? '—' }}
                </td>
                <!-- Banco horas -->
                <td class="px-4 py-3 font-mono font-semibold"
                  :class="(record.banco_horas_min ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ record.banco_horas ?? '—' }}
                </td>
                <!-- Status -->
                <td class="px-4 py-3">
                  <Badge :variant="statusVariant(record)">
                    {{ statusLabel(record) }}
                  </Badge>
                </td>
                <!-- Ações -->
                <td class="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="openJustification(record)"
                    class="text-xs"
                  >
                    Justificar
                  </Button>
                </td>
              </tr>

              <!-- Expanded row: detalhes de pausas -->
              <tr v-if="expandedRows.has(record.id)" class="bg-muted/20">
                <td :colspan="auth.isAdmin ? 9 : 8" class="px-8 py-3">
                  <div class="space-y-1 text-xs text-muted-foreground">
                    <p v-if="record.pausas?.length">
                      <span class="font-medium">Pausas:</span>
                      <span v-for="(p, i) in record.pausas" :key="i" class="ml-2">
                        {{ p.inicio }} – {{ p.fim ?? 'em curso' }}
                      </span>
                    </p>
                    <p v-if="record.justificativa">
                      <span class="font-medium">Justificativa:</span>
                      {{ record.justificativa.texto }}
                    </p>
                    <p v-if="!record.pausas?.length && !record.justificativa" class="italic">
                      Sem detalhes adicionais.
                    </p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Load more -->
        <div v-if="hasMore || loadingMore" class="border-t border-border px-4 py-3 flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            :disabled="loadingMore"
            @click="emit('load-more')"
          >
            <RefreshCw v-if="loadingMore" class="h-4 w-4 animate-spin" />
            {{ loadingMore ? 'Carregando...' : 'Carregar mais' }}
          </Button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <Search class="h-10 w-10 opacity-30" />
        <p class="text-sm">Nenhum registro encontrado.</p>
      </div>
    </Card>

    <!-- Modais -->
    <JustificationModal
      v-if="showJustModal"
      :record="selectedRecord"
      @close="showJustModal = false"
      @saved="emit('refresh')"
    />

    <AddManualRecordModal
      v-if="showManualModal"
      @close="showManualModal = false"
      @saved="emit('refresh')"
    />
  </div>
</template>
