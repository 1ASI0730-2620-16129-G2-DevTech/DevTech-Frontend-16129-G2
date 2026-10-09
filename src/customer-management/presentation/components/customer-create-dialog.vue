<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {DOCUMENT_LENGTH, DocumentType} from "../../domain/model/document-type.js";

const props = defineProps({
  visible: {type: Boolean, default: false},
  saving: {type: Boolean, default: false},
  errorMessage: {type: String, default: ""}
});
const emit = defineEmits(["update:visible", "save"]);

const {t} = useI18n();

function emptyForm() {
  return {fullName: "", phone: "", documentType: DocumentType.DNI, documentNumber: "", address: ""};
}

const form = reactive(emptyForm());
const submitted = ref(false);

watch(() => props.visible, (visible) => {
  if (visible) {
    Object.assign(form, emptyForm());
    submitted.value = false;
  }
});

const documentTypeOptions = Object.values(DocumentType).map((value) => ({value, label: value}));
const documentLength = computed(() => DOCUMENT_LENGTH[form.documentType]);

const nameInvalid = computed(() => submitted.value && !form.fullName.trim());
const phoneInvalid = computed(() => submitted.value && !/^\d{9}$/.test(form.phone.replace(/\s/g, "")));
const documentInvalid = computed(() => submitted.value
    && !new RegExp(`^\\d{${documentLength.value}}$`).test(form.documentNumber.trim()));

function close() {
  emit("update:visible", false);
}

function save() {
  submitted.value = true;
  if (nameInvalid.value || phoneInvalid.value || documentInvalid.value) return;
  emit("save", {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    documentType: form.documentType,
    documentNumber: form.documentNumber.trim(),
    address: form.address.trim()
  });
}
</script>

<template>
  <pv-dialog :visible="visible" modal :closable="false" :draggable="false" class="customer-dialog wt-dialog"
             :style="{width: '40rem'}" :breakpoints="{'960px': '90vw'}"
             @update:visible="emit('update:visible', $event)">
    <template #header>
      <div class="dialog-header">
        <h2>{{ t('customers.form.title') }}</h2>
        <button type="button" class="close-button" :aria-label="t('customers.form.cancel')" @click="close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>
    </template>

    <form class="customer-form" @submit.prevent="save">
      <div class="field full">
        <label for="customer-name">{{ t('customers.form.full-name') }}</label>
        <pv-input-text id="customer-name" v-model="form.fullName" :invalid="nameInvalid" fluid/>
        <small v-if="nameInvalid" class="field-error">{{ t('customers.form.full-name-required') }}</small>
      </div>

      <div class="field">
        <label for="customer-document-type">{{ t('customers.form.document-type') }}</label>
        <pv-select v-model="form.documentType" input-id="customer-document-type" :options="documentTypeOptions"
                   option-label="label" option-value="value" fluid/>
      </div>
      <div class="field">
        <label for="customer-document">{{ t('customers.form.document') }}</label>
        <pv-input-text id="customer-document" v-model="form.documentNumber" inputmode="numeric"
                       :maxlength="documentLength" :invalid="documentInvalid" fluid/>
        <small v-if="documentInvalid" class="field-error">
          {{ t('customers.form.document-invalid', {type: form.documentType, length: documentLength}) }}
        </small>
      </div>

      <div class="field">
        <label for="customer-phone">{{ t('customers.form.phone') }}</label>
        <pv-input-text id="customer-phone" v-model="form.phone" inputmode="tel" placeholder="987 654 321"
                       :invalid="phoneInvalid" fluid/>
        <small v-if="phoneInvalid" class="field-error">{{ t('customers.form.phone-invalid') }}</small>
      </div>
      <div class="field">
        <label for="customer-address">{{ t('customers.form.address') }}</label>
        <pv-input-text id="customer-address" v-model="form.address" fluid/>
      </div>

      <p v-if="errorMessage" class="form-error full">{{ errorMessage }}</p>
    </form>

    <template #footer>
      <div class="wt-dialog-actions">
        <pv-button :label="t('customers.form.cancel')" class="wt-cancel" @click="close"/>
        <pv-button :label="t('customers.form.save')" class="wt-save" :loading="saving" @click="save"/>
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.dialog-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.dialog-header h2 { margin: 0; font-size: 1.6rem; font-weight: 700; color: #123b7a; }
.close-button { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border: 0; border-radius: 50%;
  background: #e8edf3; color: #123b7a; cursor: pointer; }
.close-button .pi { font-size: 1rem; font-weight: 700; }
.customer-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 2rem; padding-top: .25rem; }
.field { display: flex; flex-direction: column; gap: .4rem; }
.field.full, .form-error.full { grid-column: 1 / -1; }
.field label { font-weight: 600; color: #123b7a; }
.field :deep(.p-inputtext), .field :deep(.p-select) { border-radius: .75rem; border-color: #1f2937; color: #123b7a; font-weight: 600; }
.field-error { font-size: .75rem; color: #b42318; }
.form-error { margin: 0; padding: .6rem .8rem; border-radius: .5rem; background: #fdecec; color: #b42318; font-size: .8rem; }
@media (max-width: 640px) { .customer-form { grid-template-columns: 1fr; } }
</style>
