<template>
  <div class="personal-data-block full-width q-mt-md q-pa-md">
    <h2 class="text-subtitle1 q-mt-none q-mb-sm">Персональные данные</h2>
    <div class="app-secondary-text text-body2 q-mb-xs">
      Данные из документа, который у вас будет с собой, когда вы пойдёте
      забирать свой билет. Каждый билет забирается индивидуально при
      предъявлении документа.
    </div>
    <div class="app-secondary-text text-body2 q-mb-md">
      Только для выездных матчей.
    </div>

    <div class="column q-gutter-sm">
      <!--
        The rule guards against stealing focus on page load. This block is
        rendered only after the user picks an away match, so the focus move is
        the direct result of that action and lands on the next thing to fill in.
      -->
      <!-- eslint-disable vuejs-accessibility/no-autofocus -->
      <q-input
        :model-value="modelValue.firstName"
        name="firstName"
        label="Имя латиницей"
        autocomplete="given-name"
        autocapitalize="words"
        enterkeyhint="next"
        spellcheck="false"
        autofocus
        debounce="500"
        lazy-rules
        :rules="[requiredRule]"
        @update:model-value="update('firstName', ($event as string) ?? '')"
      />
      <!-- eslint-enable vuejs-accessibility/no-autofocus -->

      <q-input
        :model-value="modelValue.lastName"
        name="lastName"
        label="Фамилия латиницей"
        autocomplete="family-name"
        autocapitalize="words"
        enterkeyhint="next"
        spellcheck="false"
        debounce="500"
        lazy-rules
        :rules="[requiredRule]"
        @update:model-value="update('lastName', ($event as string) ?? '')"
      />

      <q-input
        :model-value="formattedBirthDate"
        name="birthDate"
        label="Дата рождения"
        input-class="cursor-pointer"
        lazy-rules
        :rules="[() => !!modelValue.birthDate || 'Обязательное поле']"
        readonly
        @click="showBirthDatePicker = true"
        @keyup.enter="showBirthDatePicker = true"
      >
        <template #append>
          <q-btn
            type="button"
            icon="event"
            aria-label="Выбрать дату рождения"
            flat
            round
            dense
          >
            <q-popup-proxy
              v-model="showBirthDatePicker"
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
                  <q-btn
                    v-close-popup
                    label="OK"
                    color="primary"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </template>
      </q-input>

      <q-input
        :model-value="modelValue.documentNumber"
        name="documentNumber"
        label="Номер документа"
        autocomplete="off"
        autocapitalize="characters"
        enterkeyhint="done"
        spellcheck="false"
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
import { computed, ref } from 'vue'

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
const showBirthDatePicker = ref(false)
</script>

<style scoped lang="sass">
.personal-data-block
  border: 1px solid $grey-4
  border-radius: 8px
</style>
