<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import JustificationModal from './JustificationModal.vue'
import Badge from '@/components/ui/Badge.vue'
import { X, AlertTriangle } from 'lucide-vue-next'
import dayjs from 'dayjs'

defineProps({
  pendentes: { type: Array, required: true },
})
const emit = defineEmits(['close', 'saved'])

const auth = useAuthStore()
const selectedRecord = ref(null)

const statusVariant = (s) => {
  if (s === 'aprovado') return 'success'
  if (s === 'reprovado') return 'destructive'
  return 'warning'
}

const handleSaved = () => {
  selectedRecord.value = null
  emit('saved')
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" @click.self="emit('close')">
      <!-- Modal -->
      <div class="bg-background rounded-xl border border-border shadow-xl w-full max-w-lg flex flex-col max-h-[80vh] animate-fade-in">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-yellow-500" />
            <div>
              <h2 class="font-semibold text-foreground">Justificativas Pendentes</h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ pendentes.length }} pendente{{ pendentes.length > 1 ? 's' : '' }} de aprovação
              </p>
            </div>
          </div>
          <button @click="emit('close')" class="text-muted-foreground hover:text-foreground">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- List -->
        <div class="overflow-y-auto flex-1 divide-y divide-border">
          <div
            v-for="record in pendentes"
            :key="record.id"
            class="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
            @click="selectedRecord = record"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-sm text-foreground truncate">
                  {{ record.usuario || record.displayName || record.discordId }}
                </span>
                <span class="text-xs text-muted-foreground shrink-0">
                  {{ dayjs(record.data).format('DD/MM/YYYY') }}
                </span>
                <Badge :variant="statusVariant(record.justificativa?.status)" class="shrink-0">
                  {{ record.justificativa?.status ?? 'pendente' }}
                </Badge>
              </div>
              <p v-if="record.justificativa?.text" class="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {{ record.justificativa.text }}
              </p>
              <p v-else class="text-xs text-muted-foreground/60 mt-0.5 italic">Sem descrição</p>
            </div>
            <span class="text-xs text-primary font-medium shrink-0 self-center">Revisar →</span>
          </div>

          <div v-if="!pendentes.length" class="py-12 text-center text-muted-foreground text-sm">
            Nenhuma justificativa pendente.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de justificativa individual (abre sobre o modal de lista) -->
    <JustificationModal
      v-if="selectedRecord"
      :record="selectedRecord"
      @close="selectedRecord = null"
      @saved="handleSaved"
    />
  </Teleport>
</template>
