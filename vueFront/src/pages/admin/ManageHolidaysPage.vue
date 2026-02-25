<script setup>
import { ref, onMounted } from 'vue'
import { fetchSpecialDates, addSpecialDate, deleteSpecialDate } from '@/services/specialDateService'
import { useToast } from '@/composables/useToast'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { CalendarDays, Plus, Trash2 } from 'lucide-vue-next'
import dayjs from 'dayjs'

const { toast } = useToast()
const dates = ref([])
const loading = ref(true)
const saving = ref(false)

const form = ref({
  data: '',
  descricao: '',
  tipo: 'feriado',
})

onMounted(async () => {
  await loadDates()
})

const loadDates = async () => {
  try {
    loading.value = true
    dates.value = await fetchSpecialDates()
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao carregar datas.' })
  } finally {
    loading.value = false
  }
}

const handleAdd = async () => {
  if (!form.value.data || !form.value.descricao) {
    toast({ type: 'warning', title: 'Atenção', message: 'Preencha todos os campos.' })
    return
  }
  saving.value = true
  try {
    await addSpecialDate(form.value)
    toast({ type: 'success', title: 'Sucesso', message: 'Data adicionada.' })
    form.value = { data: '', descricao: '', tipo: 'feriado' }
    await loadDates()
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao adicionar data.' })
  } finally {
    saving.value = false
  }
}

const handleDelete = async (item) => {
  try {
    // DELETE /datas-especiais/:data — passa a data como parâmetro de rota
    await deleteSpecialDate(item.data)
    toast({ type: 'success', title: 'Removido', message: 'Data removida.' })
    await loadDates()
  } catch {
    toast({ type: 'error', title: 'Erro', message: 'Falha ao remover data.' })
  }
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <CalendarDays class="h-6 w-6 text-primary" />
        Gerenciar Feriados
      </h1>
      <p class="text-sm text-muted-foreground mt-1">
        Adicione ou remova datas especiais do sistema.
      </p>
    </div>

    <!-- Add form -->
    <Card class="p-4">
      <h3 class="font-medium text-sm text-foreground mb-4">Adicionar Nova Data</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="space-y-1.5">
          <Label>Data *</Label>
          <Input v-model="form.data" type="date" />
        </div>
        <div class="space-y-1.5">
          <Label>Descrição *</Label>
          <Input v-model="form.descricao" placeholder="Ex: Natal" />
        </div>
        <div class="space-y-1.5">
          <Label>Tipo</Label>
          <select
            v-model="form.tipo"
            class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="feriado">Feriado</option>
            <option value="ponto-facultativo">Ponto Facultativo</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>
      <Button class="mt-4" :loading="saving" @click="handleAdd">
        <Plus class="h-4 w-4" />
        Adicionar
      </Button>
    </Card>

    <!-- List -->
    <Card class="overflow-hidden">
      <div class="px-4 py-3 border-b border-border">
        <h3 class="font-medium text-sm text-foreground">Datas Cadastradas</h3>
      </div>

      <div v-if="loading" class="p-4 space-y-2">
        <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
      </div>

      <div v-else-if="dates.length" class="divide-y divide-border">
        <div
          v-for="item in dates"
          :key="item.id ?? item.data"
          class="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
        >
          <div>
            <p class="text-sm font-medium text-foreground">{{ item.descricao }}</p>
            <p class="text-xs text-muted-foreground">
              {{ dayjs(item.data).format('DD/MM/YYYY') }} · {{ item.tipo }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground hover:text-destructive"
            @click="handleDelete(item)"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div v-else class="py-12 text-center text-muted-foreground text-sm">
        Nenhuma data especial cadastrada.
      </div>
    </Card>
  </div>
</template>
