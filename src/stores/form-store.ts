import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Match {
  type: string;
  team: string;
  vs: string;
  tournament: string;
  stadium: string;
  atHome: boolean;
  date: string;
  isDateConfirmed: boolean;
}

export interface PersonalData {
  firstName: string;
  lastName: string;
  birthDate: string;
  documentNumber: string;
}

export const useFormStore = defineStore(
  'ticket-form',
  () => {
    const memberName = ref('');
    const phone = ref('');
    const telegram = ref('');
    const email = ref('');
    const ticketCategory = ref<string | null>(null);
    const personalData = ref<PersonalData>({
      firstName: '',
      lastName: '',
      birthDate: '',
      documentNumber: '',
    });

    // Not persisted
    const selectedMatch = ref<Match | null>(null);
    const submitted = ref(false);

    function getSubmitData() {
      const base = {
        memberName: memberName.value,
        phone: phone.value,
        telegram: telegram.value,
        email: email.value,
        match: selectedMatch.value,
        ticketCategory: ticketCategory.value,
      };

      if (selectedMatch.value && !selectedMatch.value.atHome) {
        return { ...base, personalData: { ...personalData.value } };
      }
      return base;
    }

    function resetForm() {
      ticketCategory.value = null;
      selectedMatch.value = null;
      submitted.value = false;
    }

    return {
      memberName,
      phone,
      telegram,
      email,
      ticketCategory,
      personalData,
      selectedMatch,
      submitted,
      getSubmitData,
      resetForm,
    };
  },
  {
    persist: {
      paths: [
        'memberName',
        'phone',
        'telegram',
        'email',
        'personalData',
      ],
    },
  },
);
