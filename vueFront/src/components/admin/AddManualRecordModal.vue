<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { addManualRecord } from '@/services/manualRecordService'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'saved'])
const auth = useAuthStore()
const { toast } = useToast()

const form = ref({
  discordId: auth.isAdminOrRH ? '' : (auth.discordId ?? ''),
  usuario: auth.isAdminOrRH ? '' : (auth.displayName ?? ''),
  data: '',
  hora_entrada: '',
  hora_saida: '',
  total_pausas: '',
})
const loading = ref(false)

const handleSave = async () => {
  if (!form.value.data || !form.value.hora_entrada) {
    toast({ type: 'warning', title: 'Atenção', message: 'Preencha a data e horário de entrada.' })
    return
  }
  if (auth.isAdminOrRH && !form.value.discordId) {
    toast({ type: 'warning', title: 'Atenção', message: 'Informe o Discord ID do usuário.' })
    return
  }

  loading.value = true
  try {
    const payload = {
      discordId: form.value.discordId,
      usuario: form.value.usuario,
      data: form.value.data,
      entrada: `${form.value.data} ${form.value.hora_entrada}`,
      saida: form.value.hora_saida ? `${form.value.data} ${form.value.hora_saida}` : null,
      total_pausas: form.value.total_pausas || '0h 0m',
    }

    const res = await addManualRecord(payload)
    if (res?.success === false) {
      toast({ type: 'error', title: 'Erro', message: res.error || 'Falha ao criar registro.' })
      return
    }
    toast({ type: 'success', title: 'Sucesso', message: 'Registro manual enviado.' })
    emit('saved')
    emit('close')
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao criar registro.' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" @click.self="emit('close')">
      <div class="bg-background rounded-xl border border-border shadow-xl w-full max-w-sm">
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 class="font-semibold text-foreground">Registro Manual</h2>
          <button @click="emit('close')" class="text-muted-foreground hover:text-foreground">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 space-y-4">
          <!-- Discord ID — admin e rh preenchem -->
          <div v-if="auth.isAdminOrRH" class="space-y-1.5">
            <Label>Discord ID *</Label>
            <Input v-model="form.discordId" placeholder="123456789..." />
          </div>
          <div v-if="auth.isAdminOrRH" class="space-y-1.5">
            <Label>Usuário</Label>
            <Input v-model="form.usuario" placeholder="Nome do usuário" />
          </div>

          <!-- Para leitores, mostra o próprio nome apenas como info -->
          <div v-if="!auth.isAdminOrRH" class="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Registrando para: <span class="font-medium text-foreground">{{ auth.displayName || auth.discordId }}</span>
          </div>

          <div class="space-y-1.5">
            <Label>Data *</Label>
            <Input v-model="form.data" type="date" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label>Entrada *</Label>
              <Input v-model="form.hora_entrada" type="time" />
            </div>
            <div class="space-y-1.5">
              <Label>Saída</Label>
              <Input v-model="form.hora_saida" type="time" />
            </div>
          </div>
          <div class="space-y-1.5">
            <Label>Pausas (ex: 1h 30m)</Label>
            <Input v-model="form.total_pausas" placeholder="0h 0m" />
          </div>
        </div>

        <div class="flex justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" size="sm" @click="emit('close')">Cancelar</Button>
          <Button size="sm" :loading="loading" @click="handleSave">Criar</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
