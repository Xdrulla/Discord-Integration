<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { Target, Save } from 'lucide-vue-next'

const { toast } = useToast()
const loading = ref(true)
const saving = ref(false)

const goals = ref({
  horasDiarias: 8,
  horasMensais: 160,
  toleranciaMinutos: 15,
})

onMounted(async () => {
  // O backend não possui endpoint de metas — apenas exibe configuração local
  loading.value = false
})

const handleSave = async () => {
  saving.value = true
  try {
    // Salva localmente no localStorage como fallback
    localStorage.setItem('goepik_goals', JSON.stringify(goals.value))
    toast({ type: 'success', title: 'Salvo', message: 'Metas atualizadas com sucesso.' })
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao salvar metas.' })
  } finally {
    saving.value = false
  }
}

// Carrega do localStorage se disponível
const saved = localStorage.getItem('goepik_goals')
if (saved) {
  try { Object.assign(goals.value, JSON.parse(saved)) } catch { /* ignorar */ }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <Target class="h-6 w-6 text-primary" />
        Metas
      </h1>
      <p class="text-sm text-muted-foreground mt-1">
        Configure as metas de horas para os colaboradores.
      </p>
    </div>

    <Card class="p-6">
      <div v-if="loading" class="space-y-4">
        <Skeleton v-for="i in 3" :key="i" class="h-16 w-full" />
      </div>

      <div v-else class="space-y-5 max-w-sm">
        <div class="space-y-1.5">
          <Label>Horas Diárias</Label>
          <Input v-model.number="goals.horasDiarias" type="number" min="1" max="24" />
          <p class="text-xs text-muted-foreground">Meta de horas por dia de trabalho.</p>
        </div>

        <div class="space-y-1.5">
          <Label>Horas Mensais</Label>
          <Input v-model.number="goals.horasMensais" type="number" min="1" />
          <p class="text-xs text-muted-foreground">Meta total de horas por mês.</p>
        </div>

        <div class="space-y-1.5">
          <Label>Tolerância (minutos)</Label>
          <Input v-model.number="goals.toleranciaMinutos" type="number" min="0" max="60" />
          <p class="text-xs text-muted-foreground">Tolerância de atraso em minutos.</p>
        </div>

        <Button :loading="saving" @click="handleSave">
          <Save class="h-4 w-4" />
          Salvar Metas
        </Button>
      </div>
    </Card>
  </div>
</template>
