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
            outlined
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.phone"
            label="Номер телефона для связи"
            outlined
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.telegram"
            label="Ник в Telegram"
            outlined
            debounce="500"
            lazy-rules
            :rules="[requiredRule]"
          />

          <q-input
            v-model="formStore.email"
            label="Email"
            type="email"
            outlined
            hint="Внимательно проверяй почту, туда будут приходить оповещения по статусу заявки"
            debounce="500"
            lazy-rules
            :rules="[requiredRule, emailRule]"
          />

          <MatchSelect
            v-model="formStore.selectedMatch"
            :matches="matchesStore.matches"
            :loading="matchesStore.loading"
          />

          <q-select
            v-model="formStore.ticketCategory"
            label="Категория билета"
            outlined
            :options="ticketCategoryOptions"
            multiple
            emit-value
            map-options
            clearable
          />

          <PersonalDataBlock
            v-if="showPersonalData"
            v-model="formStore.personalData"
          />

          <q-btn
            label="Отправить заявку"
            type="submit"
            color="primary"
            class="q-mt-md full-width"
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
import { ref, computed, onMounted } from 'vue';
import type { QForm } from 'quasar';
import { useFormStore } from 'stores/form-store';
import { useMatchesStore } from 'stores/matches-store';
import AppHeader from 'components/AppHeader.vue';
import AppFooter from 'components/AppFooter.vue';
import MatchSelect from 'components/MatchSelect.vue';
import PersonalDataBlock from 'components/PersonalDataBlock.vue';

const formStore = useFormStore();
const matchesStore = useMatchesStore();
const formRef = ref<QForm | null>(null);

const ticketCategoryOptions = [
  'Нижний ряд ближе к угловому флагу',
  'Центр самый верх',
  'Третий или четвёртый ярус за воротами',
];

const showPersonalData = computed(
  () => formStore.selectedMatch !== null && !formStore.selectedMatch.atHome,
);

const requiredRule = (val: string) =>
  (!!val && val.trim().length > 0) || 'Обязательное поле';

const emailRule = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Введите корректный email';

async function onSubmit() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  const data = formStore.getSubmitData();
  console.log('Form submitted:', data);
  formStore.submitted = true;
}

function handleNewRequest() {
  formStore.resetForm();
}

onMounted(() => {
  matchesStore.fetchMatches();
});
</script>

<style scoped lang="sass">
.page-content
  max-width: 600px
  margin: 0 auto
</style>
