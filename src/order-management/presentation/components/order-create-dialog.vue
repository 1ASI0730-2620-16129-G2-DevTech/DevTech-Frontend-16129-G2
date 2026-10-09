<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {ServiceType} from "../../domain/model/service-type.js";
import {ORDER_STATUS_SEQUENCE} from "../../domain/model/order-status.js";
import {DeliveryMethod} from "../../domain/model/delivery-method.js";
import {PaymentStatus} from "@/payments/domain/model/payment-status.js";

const props = defineProps({
  visible: {type: Boolean, default: false},
  customers: {type: Array, default: () => []},
  saving: {type: Boolean, default: false},
  errorMessage: {type: String, default: ""}
});
const emit = defineEmits(["update:visible", "save"]);

const {t} = useI18n();

const PAYMENT_METHODS = ["yape", "card", "cash"];

function emptyForm() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return {
    customer: null,
    receptionDate: today,
    estimatedDeliveryDate: tomorrow,
    serviceType: ServiceType.WASHING,
    garmentCount: 1,
    status: ORDER_STATUS_SEQUENCE[0],
    paymentStatus: PaymentStatus.PENDING,
    deliveryMethod: DeliveryMethod.PICKUP,
    paymentMethod: PAYMENT_METHODS[0]
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
const paymentStatusOptions = computed(() => [PaymentStatus.PENDING, PaymentStatus.PAID]
    .map((value) => ({value, label: t(`payments.status.${value}`)})));
const deliveryOptions = computed(() => Object.values(DeliveryMethod)
    .map((value) => ({value, label: t(`orders.form.delivery.${value}`)})));
const paymentMethodOptions = computed(() => PAYMENT_METHODS
    .map((value) => ({value, label: t(`orders.payment-method.${value}`)})));

const customerMissing = computed(() => submitted.value && !form.customer?.id);
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
  if (!form.customer?.id || !form.receptionDate || !form.estimatedDeliveryDate || datesInvalid.value) return;
  emit("save", {
    customer: form.customer,
    receptionDate: form.receptionDate,
    estimatedDeliveryDate: form.estimatedDeliveryDate,
    serviceType: form.serviceType,
    garmentCount: form.garmentCount,
    status: form.status,
    paymentStatus: form.paymentStatus,
    deliveryMethod: form.deliveryMethod,
    paymentMethod: form.paymentMethod
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
        <label for="order-garments">{{ t('orders.form.garments') }}</label>
        <pv-icon-field>
          <pv-input-icon class="pi pi-clone"/>
          <pv-input-number v-model="form.garmentCount" input-id="order-garments" :min="1" :max="999"
                           :allow-empty="false" fluid/>
        </pv-icon-field>
      </div>

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
        <label for="order-delivery-method">{{ t('orders.form.delivery-method') }}</label>
        <pv-select v-model="form.deliveryMethod" input-id="order-delivery-method" :options="deliveryOptions"
                   option-label="label" option-value="value" fluid/>
      </div>
      <div class="field">
        <label for="order-payment-method">{{ t('orders.form.payment-method') }}</label>
        <pv-select v-model="form.paymentMethod" input-id="order-payment-method" :options="paymentMethodOptions"
                   option-label="label" option-value="value" fluid/>
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
@media (max-width: 640px) {
  .order-form { grid-template-columns: 1fr; }
}
</style>
