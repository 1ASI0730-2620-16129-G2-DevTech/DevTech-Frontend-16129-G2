<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {ServiceType} from "../../domain/model/service-type.js";
import {ORDER_STATUS_SEQUENCE} from "../../domain/model/order-status.js";
import {DeliveryMethod} from "../../domain/model/delivery-method.js";
import {PaymentStatus} from "@/payments/domain/model/payment-status.js";
import {PAYMENT_METHODS, PaymentMethod} from "@/payments/domain/model/payment-method.js";

const props = defineProps({
  visible: {type: Boolean, default: false},
  customers: {type: Array, default: () => []},
  /** Names of the garments of the catalog, offered when adding garments to the order. */
  garmentTypes: {type: Array, default: () => []},
  saving: {type: Boolean, default: false},
  errorMessage: {type: String, default: ""}
});
const emit = defineEmits(["update:visible", "save"]);

const {t} = useI18n();

/** Limits of a garment line, the same ones the Order Management backend checks. */
const MAX_QUANTITY = 1000;

function emptyItem() {
  return {type: "", quantity: 1, careInstructions: ""};
}

function emptyForm() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return {
    customer: null,
    receptionDate: today,
    estimatedDeliveryDate: tomorrow,
    serviceType: ServiceType.WASHING,
    items: [emptyItem()],
    status: ORDER_STATUS_SEQUENCE[0],
    paymentStatus: PaymentStatus.PENDING,
    deliveryMethod: DeliveryMethod.PICKUP,
    paymentMethod: PaymentMethod.YAPE,
    amount: null
  };
}

const form = reactive(emptyForm());
const submitted = ref(false);
const customerSuggestions = ref([]);

watch(() => props.visible, (visible) => {
  if (visible) {
    Object.assign(form, emptyForm());
    submitted.value = false;
  }
});

const serviceOptions = computed(() => Object.values(ServiceType)
    .map((value) => ({value, label: t(`orders.service.${value}`)})));
const statusOptions = computed(() => ORDER_STATUS_SEQUENCE
    .map((value) => ({value, label: t(`orders.status.${value}`)})));
const paymentStatusOptions = computed(() => [PaymentStatus.PENDING, PaymentStatus.COMPLETED]
    .map((value) => ({value, label: t(`payments.status.${value}`)})));
const deliveryOptions = computed(() => Object.values(DeliveryMethod)
    .map((value) => ({value, label: t(`orders.form.delivery.${value}`)})));
const paymentMethodOptions = computed(() => PAYMENT_METHODS
    .map((value) => ({value, label: t(`orders.payment-method.${value}`)})));

const customerMissing = computed(() => submitted.value && !form.customer?.id);
// The payment gateway of the backend only charges positive amounts.
const amountInvalid = computed(() => submitted.value && !(form.amount > 0));

const garmentOptions = computed(() => props.garmentTypes.map((name) => ({value: name, label: name})));

function itemTypeInvalid(item) {
  return submitted.value && String(item.type ?? "").trim() === "";
}
function itemQuantityInvalid(item) {
  return submitted.value && !(Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= MAX_QUANTITY);
}
const itemsInvalid = computed(() => form.items.length === 0
    || form.items.some((item) => itemTypeInvalid(item) || itemQuantityInvalid(item)));

function addItem() {
  form.items.push(emptyItem());
}
function removeItem(index) {
  if (form.items.length > 1) form.items.splice(index, 1);
}
const datesInvalid = computed(() => submitted.value && form.estimatedDeliveryDate && form.receptionDate
    && startOfDay(form.estimatedDeliveryDate) < startOfDay(form.receptionDate));

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function searchCustomers(event) {
  const query = event.query ?? "";
  customerSuggestions.value = props.customers.filter((customer) => customer.matches(query));
}

function close() {
  emit("update:visible", false);
}

function save() {
  submitted.value = true;
  if (!form.customer?.id || !form.receptionDate || !form.estimatedDeliveryDate || datesInvalid.value
      || amountInvalid.value || itemsInvalid.value) return;
  emit("save", {
    customer: form.customer,
    receptionDate: form.receptionDate,
    estimatedDeliveryDate: form.estimatedDeliveryDate,
    serviceType: form.serviceType,
    items: form.items.map((item) => ({
      type: String(item.type).trim(),
      quantity: item.quantity,
      careInstructions: String(item.careInstructions ?? "").trim()
    })),
    status: form.status,
    paymentStatus: form.paymentStatus,
    deliveryMethod: form.deliveryMethod,
    paymentMethod: form.paymentMethod,
    amount: form.amount
  });
}
</script>

<template>
  <pv-dialog :visible="visible" modal :closable="false" :draggable="false" class="order-dialog wt-dialog"
             :style="{width: '49rem'}" :breakpoints="{'960px': '90vw'}"
             @update:visible="emit('update:visible', $event)">
    <template #header>
      <div class="dialog-header">
        <h2>{{ t('orders.form.title') }}</h2>
        <button type="button" class="close-button" :aria-label="t('orders.form.cancel')" @click="close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </div>
    </template>

    <form class="order-form" @submit.prevent="save">
      <div class="field full">
        <label for="order-customer">{{ t('orders.form.customer') }}</label>
        <pv-auto-complete v-model="form.customer" input-id="order-customer" :suggestions="customerSuggestions"
                          option-label="fullName" :placeholder="t('orders.form.customer-placeholder')"
                          :invalid="customerMissing" force-selection fluid @complete="searchCustomers">
          <template #option="{option}">
            <div class="customer-option">
              <span>{{ option.fullName }}</span>
              <small>{{ t('orders.form.document') }} {{ option.documentNumber }}</small>
            </div>
          </template>
        </pv-auto-complete>
        <small v-if="customerMissing" class="field-error">{{ t('orders.form.customer-required') }}</small>
      </div>

      <div class="field">
        <label for="order-reception">{{ t('orders.form.reception-date') }}</label>
        <pv-date-picker v-model="form.receptionDate" input-id="order-reception" date-format="dd/mm/yy"
                        show-icon icon-display="input" fluid/>
      </div>
      <div class="field">
        <label for="order-delivery-date">{{ t('orders.form.delivery-date') }}</label>
        <pv-date-picker v-model="form.estimatedDeliveryDate" input-id="order-delivery-date" date-format="dd/mm/yy"
                        :min-date="form.receptionDate" :invalid="datesInvalid" show-icon icon-display="input" fluid/>
        <small v-if="datesInvalid" class="field-error">{{ t('orders.form.dates-invalid') }}</small>
      </div>

      <div class="field">
        <label for="order-service">{{ t('orders.form.service') }}</label>
        <pv-select v-model="form.serviceType" input-id="order-service" :options="serviceOptions"
                   option-label="label" option-value="value" fluid/>
      </div>
      <div class="field">
        <label for="order-delivery-method">{{ t('orders.form.delivery-method') }}</label>
        <pv-select v-model="form.deliveryMethod" input-id="order-delivery-method" :options="deliveryOptions"
                   option-label="label" option-value="value" fluid/>
      </div>

      <fieldset class="items full">
        <legend>{{ t('orders.form.items.title') }}</legend>
        <div v-for="(item, index) in form.items" :key="index" class="item-row">
          <div class="field">
            <label :for="`order-item-type-${index}`">{{ t('orders.form.items.type') }}</label>
            <pv-select v-model="item.type" :input-id="`order-item-type-${index}`" :options="garmentOptions"
                       option-label="label" option-value="value" editable
                       :placeholder="t('orders.form.items.type-placeholder')" :invalid="itemTypeInvalid(item)" fluid/>
          </div>
          <div class="field quantity">
            <label :for="`order-item-quantity-${index}`">{{ t('orders.form.items.quantity') }}</label>
            <pv-input-number v-model="item.quantity" :input-id="`order-item-quantity-${index}`" :min="1"
                             :max="MAX_QUANTITY" :allow-empty="false" :invalid="itemQuantityInvalid(item)"
                             show-buttons fluid/>
          </div>
          <div class="field">
            <label :for="`order-item-care-${index}`">{{ t('orders.form.items.care') }}</label>
            <pv-input-text v-model="item.careInstructions" :id="`order-item-care-${index}`" maxlength="500"
                           :placeholder="t('orders.form.items.care-placeholder')" fluid/>
          </div>
          <button type="button" class="remove-item" :disabled="form.items.length === 1"
                  :aria-label="t('orders.form.items.remove')" :title="t('orders.form.items.remove')"
                  @click="removeItem(index)">
            <i class="pi pi-trash" aria-hidden="true"></i>
          </button>
        </div>
        <small v-if="submitted && itemsInvalid" class="field-error">{{ t('orders.form.items.invalid') }}</small>
        <pv-button type="button" :label="t('orders.form.items.add')" icon="pi pi-plus" text class="add-item"
                   @click="addItem"/>
      </fieldset>

      <div class="field">
        <label for="order-status">{{ t('orders.form.order-status') }}</label>
        <pv-select v-model="form.status" input-id="order-status" :options="statusOptions"
                   option-label="label" option-value="value" fluid/>
      </div>
      <div class="field">
        <label for="order-payment-status">{{ t('orders.form.payment-status') }}</label>
        <pv-select v-model="form.paymentStatus" input-id="order-payment-status" :options="paymentStatusOptions"
                   option-label="label" option-value="value" fluid/>
      </div>

      <div class="field">
        <label for="order-payment-method">{{ t('orders.form.payment-method') }}</label>
        <pv-select v-model="form.paymentMethod" input-id="order-payment-method" :options="paymentMethodOptions"
                   option-label="label" option-value="value" fluid/>
      </div>
      <div class="field">
        <label for="order-amount">{{ t('orders.form.amount') }}</label>
        <pv-input-number v-model="form.amount" input-id="order-amount" mode="currency" currency="PEN" locale="es-PE"
                         :min="0" :min-fraction-digits="2" :invalid="amountInvalid" fluid/>
        <small v-if="amountInvalid" class="field-error">{{ t('orders.form.amount-required') }}</small>
      </div>

      <p v-if="errorMessage" class="form-error full">{{ errorMessage }}</p>
    </form>

    <template #footer>
      <div class="wt-dialog-actions">
        <pv-button :label="t('orders.form.cancel')" class="wt-cancel" @click="close"/>
        <pv-button :label="t('orders.form.save')" class="wt-save" :loading="saving" @click="save"/>
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
.order-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 2.5rem; padding-top: .25rem; }
.field { display: flex; flex-direction: column; gap: .4rem; }
.field.full, .form-error.full { grid-column: 1 / -1; }
.field label { font-weight: 600; color: #123b7a; }
.field :deep(.p-inputtext), .field :deep(.p-select), .field :deep(.p-autocomplete-input) {
  border-radius: .75rem; border-color: #1f2937; color: #123b7a; font-weight: 600; }
.customer-option { display: flex; flex-direction: column; }
.customer-option small, .field-error { font-size: .75rem; }
.customer-option small { color: #72819b; }
.field-error, .form-error { color: #b42318; }
.form-error { margin: 0; padding: .6rem .8rem; border-radius: .5rem; background: #fdecec; font-size: .8rem; }
.order-dialog :deep(.p-dialog-content) { padding-bottom: 1.5rem; }
.items { display: flex; flex-direction: column; gap: .75rem; margin: 0; padding: 1rem; border: 1px solid #d5dde8;
  border-radius: .75rem; }
.items legend { padding: 0 .4rem; font-weight: 700; color: #123b7a; }
.item-row { display: grid; grid-template-columns: 1.4fr 8rem 1.6fr auto; gap: .75rem; align-items: end; }
.remove-item { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border: 0; border-radius: .75rem;
  background: #fdecec; color: #b42318; cursor: pointer; }
.remove-item:disabled { opacity: .4; cursor: not-allowed; }
.add-item { align-self: flex-start; }@media (max-width: 640px) {
  .order-form { grid-template-columns: 1fr; }
  .item-row { grid-template-columns: 1fr 1fr; }
  .item-row .field:last-of-type { grid-column: 1 / -1; }
}
</style>
