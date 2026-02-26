<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { upsertJustificativa, deleteJustificativa, uploadJustificativaFile } from '@/services/justificativaService'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'
import { X, Paperclip, Trash2 } from 'lucide-vue-next'
import dayjs from 'dayjs'

const props = defineProps({
  record: { type: Object, required: true },
})
const emit = defineEmits(['close', 'saved'])

const auth = useAuthStore()
const { toast } = useToast()

const texto = ref(props.record.justificativa?.texto ?? '')
const file = ref(null)
const loading = ref(false)
const deleting = ref(false)

const handleFileChange = (e) => {
  file.value = e.target.files[0] ?? null
}

const handleSave = async () => {
  if (!texto.value.trim()) {
    toast({ type: 'warning', title: 'Atenção', message: 'Descreva a justificativa.' })
    return
  }

  loading.value = true
  try {
    let fileUrl = props.record.justificativa?.fileUrl ?? null
    if (file.value) {
      const res = await uploadJustificativaFile(file.value)
      fileUrl = res.url
    }

    await upsertJustificativa({
      registroId: props.record.id,
      texto: texto.value,
      fileUrl,
    })

    toast({ type: 'success', title: 'Sucesso', message: 'Justificativa salva!' })
    emit('saved')
    emit('close')
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao salvar justificativa.' })
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  deleting.value = true
  try {
    await deleteJustificativa({ registroId: props.record.id })
    toast({ type: 'success', title: 'Removido', message: 'Justificativa removida.' })
    emit('saved')
    emit('close')
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao remover justificativa.' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" @click.self="emit('close')">
      <!-- Modal -->
      <div class="bg-background rounded-xl border border-border shadow-xl w-full max-w-md animate-fade-in">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 class="font-semibold text-foreground">Justificativa</h2>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ dayjs(record.data).format('DD/MM/YYYY') }}
            </p>
          </div>
          <button @click="emit('close')" class="text-muted-foreground hover:text-foreground">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 space-y-4">
          <!-- Status atual -->
          <div v-if="record.justificativa" class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">Status atual:</span>
            <Badge :variant="record.justificativa.status === 'aprovado' ? 'success' : 'warning'">
              {{ record.justificativa.status }}
            </Badge>
          </div>

          <!-- Texto -->
          <div class="space-y-1.5">
            <Label>Descrição</Label>
            <textarea
              v-model="texto"
              rows="4"
              class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              placeholder="Descreva o motivo da justificativa..."
            />
          </div>

          <!-- Arquivo -->
          <div class="space-y-1.5">
            <Label>Anexo (opcional)</Label>
            <label class="flex items-center gap-2 cursor-pointer">
              <div class="flex items-center gap-2 border border-input rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent w-full">
                <Paperclip class="h-4 w-4 shrink-0" />
                <span class="truncate">{{ file ? file.name : 'Selecionar arquivo' }}</span>
              </div>
              <input type="file" class="sr-only" @change="handleFileChange" accept=".pdf,.jpg,.jpeg,.png" />
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-2 p-4 border-t border-border">
          <Button
            v-if="record.justificativa"
            variant="destructive"
            size="sm"
            :loading="deleting"
            @click="handleDelete"
          >
            <Trash2 class="h-4 w-4" />
            Remover
          </Button>
          <div v-else />

          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="emit('close')">Cancelar</Button>
            <Button size="sm" :loading="loading" @click="handleSave">Salvar</Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
