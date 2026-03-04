<template>
  <q-page class="q-pa-md">
    <div class="column items-center q-gutter-md page-content">
      <!-- SUCCESS STATE -->
      <template v-if="formStore.submitted">
        <div class="full-width column items-center q-mt-xl q-pt-xl">
          <div class="text-h5 q-mb-lg">Спасибо за заявку</div>
          <q-btn
            label="Отправить ещё одну"
            color="primary"
            text-color="white"
            no-caps
            @click="handleNewRequest"
          />
        </div>
      </template>

      <!-- FORM STATE -->
      <template v-else>
        <AppHeader />

        <div class="text-body1 q-mb-sm full-width">
          Одна заявка — один билет. Билеты ТОЛЬКО для членов фан-клуба.
        </div>

        <q-form
          ref="formRef"
          class="full-width column q-gutter-y-sm"
          greedy
          @submit.prevent="onSubmit"
        >
          <q-input
            v-model="formStore.memberName"
            label="Выберите себя из списка"
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.phone"
            label="Номер телефона для связи"
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.telegram"
            label="Ник в Telegram"
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.email"
            label="Email"
            type="email"
            hint="Внимательно проверяй почту, туда будут приходить оповещения по статусу заявки"
            debounce="500"
            lazy-rules
            :rules="[requiredRule, emailRule]"
          />

          <div class="row q-gutter-x-md q-mt-lg">
            <q-checkbox v-model="formStore.showAway" label="Гостевые" dense />
            <q-checkbox v-model="formStore.showWomen" label="Женские" dense />
            <q-checkbox v-model="formStore.showCantera" label="Кантера" dense />
          </div>

          <q-banner
            v-if="matchesStore.error"
            class="text-white bg-negative q-mt-sm"
            rounded
          >
            Не удалось загрузить матчи: {{ matchesStore.error }}
            <template #action>
              <q-btn
                flat
                label="Повторить"
                @click="matchesStore.fetchMatches()"
              />
            </template>
          </q-banner>

          <MatchSelect
            v-model="formStore.selectedMatch"
            :matches="filteredMatches"
            :loading="matchesStore.loading"
          />

          <q-select
            v-model="formStore.ticketCategory"
            label="Категория билета"
            :options="TICKET_CATEGORIES"
            emit-value
            map-options
            clearable
            hint="Мы можем выразить желание на одну из доступных категорий, но клуб может решить по-своему"
          />

          <PersonalDataBlock
            v-if="showPersonalData"
            v-model="formStore.personalData"
            class="q-mt-lg"
          />

          <q-btn
            label="Отправить заявку"
            type="submit"
            class="q-mt-xl full-width"
            color="primary"
            text-color="white"
            size="lg"
            no-caps
          />
        </q-form>

        <AppFooter />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import AppFooter from 'components/AppFooter.vue'
import AppHeader from 'components/AppHeader.vue'
import MatchSelect from 'components/MatchSelect.vue'
import PersonalDataBlock from 'components/PersonalDataBlock.vue'
import type { QForm } from 'quasar'
import { emailRule, requiredRule } from 'src/utils/validation'
import { TICKET_CATEGORIES, useFormStore } from 'stores/form-store'
import { useMatchesStore } from 'stores/matches-store'
import { computed, onMounted, ref } from 'vue'

const formStore = useFormStore()
const matchesStore = useMatchesStore()
const formRef = ref<QForm | null>(null)

const filteredMatches = computed(() =>
  matchesStore.matches.filter(m => {
    if (!formStore.showAway && !m.atHome) return false
    if (!formStore.showWomen && m.isWomen) return false
    if (!formStore.showCantera && m.isCantera) return false
    return true
  }),
)

const showPersonalData = computed(
  () => formStore.selectedMatch !== null && !formStore.selectedMatch.atHome,
)

async function onSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const data = formStore.getSubmitData()
  // TODO: remove
  console.log('Form submitted:', data)
  formStore.submitted = true
}

function handleNewRequest() {
  formStore.resetForm()
}

onMounted(() => {
  matchesStore.fetchMatches()
})
</script>

<style scoped lang="sass">
.page-content
  max-width: 600px
  margin: 0 auto
</style>
