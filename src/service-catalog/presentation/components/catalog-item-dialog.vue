<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";

const props = defineProps({
  visible: {type: Boolean, default: false},
  /** i18n key of the dialog title. */
  titleKey: {type: String, required: true},
  /** Existing categories, offered as suggestions; a new one can be typed. */
  categories: {type: Array, default: () => []},
  saving: {type: Boolean, default: false},
  errorMessage: {type: String, default: ""}
});
const emit = defineEmits(["update:visible", "save"]);

const {t} = useI18n();

function emptyForm() {
  return {name: "", category: "", basePrice: 0, estimatedHours: 24, active: true};
}

const form = reactive(emptyForm());
const submitted = ref(false);

watch(() => props.visible, (visible) => {
  if (visible) {
    Object.assign(form, emptyForm());
    submitted.value = false;
  }
});

const statusOptions = computed(() => [
  {value: true, label: t("catalog.status.active")},
  {value: false, label: t("catalog.status.inactive")}
]);
const nameInvalid = computed(() => submitted.value && !form.name.trim());
const categoryInvalid = computed(() => submitted.value && !String(form.category ?? "").trim());

function close() {
  emit("update:visible", false);
}

function save() {
  submitted.value = true;
  if (nameInvalid.value || categoryInvalid.value) return;
  emit("save", {
    name: form.name.trim(),
    category: String(form.category).trim(),
    basePrice: form.basePrice ?? 0,
    estimatedHours: form.estimatedHours ?? 1,
    active: form.active
  });
}
</script>

<template>
  <pv-dialog :visible="visible" modal :closable="false" :draggable="false" class="catalog-dialog wt-dialog"
             :style="{width: '40rem'}" :breakpoints="{'960px': '90vw'}"
             @update:visible="emit('update:visible', $event)">
    <template #header>
      <div class="dialog-header">
        <h2>{{ t(titleKey) }}</h2>
        <button type="button" class="close-button" :aria-label="t('catalog.form.cancel')" @click="close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>
    </template>

    <form class="catalog-form" @submit.prevent="save">
      <div class="field">
        <label for="catalog-name">{{ t('catalog.form.name') }}</label>
        <pv-input-text id="catalog-name" v-model="form.name" :invalid="nameInvalid" fluid/>
        <small v-if="nameInvalid" class="field-error">{{ t('catalog.form.name-required') }}</small>
      </div>
      <div class="field">
        <label for="catalog-category">{{ t('catalog.form.category') }}</label>
        <pv-select v-model="form.category" input-id="catalog-category" :options="categories" editable
                   :invalid="categoryInvalid" fluid/>
        <small v-if="categoryInvalid" class="field-error">{{ t('catalog.form.category-required') }}</small>
      </div>

      <div class="field">
        <label for="catalog-price">{{ t('catalog.form.base-price') }}</label>
        <pv-input-number v-model="form.basePrice" input-id="catalog-price" mode="currency" currency="PEN"
                         locale="es-PE" :min="0" :max="9999" fluid/>
      </div>
      <div class="field">
        <label for="catalog-hours">{{ t('catalog.form.estimated-hours') }}</label>
        <pv-input-number v-model="form.estimatedHours" input-id="catalog-hours" :min="1" :max="720"
                         suffix=" H" :allow-empty="false" fluid/>
      </div>

      <div class="field">
        <label for="catalog-status">{{ t('catalog.form.status') }}</label>
        <pv-select v-model="form.active" input-id="catalog-status" :options="statusOptions"
                   option-label="label" option-value="value" fluid/>
      </div>

      <p v-if="errorMessage" class="form-error full">{{ errorMessage }}</p>
    </form>

    <template #footer>
      <div class="wt-dialog-actions">
        <pv-button :label="t('catalog.form.cancel')" class="wt-cancel" @click="close"/>
        <pv-button :label="t('catalog.form.save')" class="wt-save" :loading="saving" @click="save"/>
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
.catalog-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 2rem; padding-top: .25rem; }
.field { display: flex; flex-direction: column; gap: .4rem; }
.form-error.full { grid-column: 1 / -1; }
.field label { font-weight: 600; color: #123b7a; }
.field :deep(.p-inputtext), .field :deep(.p-select) { border-radius: .75rem; border-color: #1f2937; color: #123b7a; font-weight: 600; }
.field-error { font-size: .75rem; color: #b42318; }
.form-error { margin: 0; padding: .6rem .8rem; border-radius: .5rem; background: #fdecec; color: #b42318; font-size: .8rem; }
@media (max-width: 640px) { .catalog-form { grid-template-columns: 1fr; } }
</style>
