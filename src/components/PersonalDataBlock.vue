<template>
  <div class="personal-data-block full-width q-mt-md q-pa-md">
    <div class="text-subtitle1 q-mb-sm">Персональные данные</div>
    <div class="text-body2 q-mb-xs text-grey-8">
      Данные из документа, который у вас будет с собой, когда вы пойдёте
      забирать свой билет. Каждый билет забирается индивидуально при
      предъявлении документа.
    </div>
    <div class="text-body2 q-mb-md text-grey-8">
      Только для выездных матчей.
    </div>

    <div class="column q-gutter-sm">
      <q-input
        :model-value="modelValue.firstName"
        label="Имя латиницей"
        debounce="500"
        lazy-rules
        :rules="[requiredRule]"
        @update:model-value="update('firstName', ($event as string) ?? '')"
      />

      <q-input
        :model-value="modelValue.lastName"
        label="Фамилия латиницей"
        debounce="500"
        lazy-rules
        :rules="[requiredRule]"
        @update:model-value="update('lastName', ($event as string) ?? '')"
      />

      <q-input
        :model-value="formattedBirthDate"
        label="Дата рождения"
        lazy-rules
        :rules="[() => !!modelValue.birthDate || 'Обязательное поле']"
        readonly
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                :model-value="modelValue.birthDate"
                mask="YYYY-MM-DD"
                @update:model-value="
                  update('birthDate', ($event as string) ?? '')
                "
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="OK" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        :model-value="modelValue.documentNumber"
        label="Номер документа"
        debounce="500"
        lazy-rules
        :rules="[requiredRule]"
        @update:model-value="update('documentNumber', ($event as string) ?? '')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatBirthDate } from 'src/utils/date'
import { requiredRule } from 'src/utils/validation'
import type { PersonalData } from 'stores/form-store'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: PersonalData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PersonalData]
}>()

function update(field: keyof PersonalData, value: string) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

const formattedBirthDate = computed(() =>
  formatBirthDate(props.modelValue.birthDate),
)
</script>

<style scoped lang="sass">
.personal-data-block
  border: 1px solid $grey-4
  border-radius: 8px
</style>
