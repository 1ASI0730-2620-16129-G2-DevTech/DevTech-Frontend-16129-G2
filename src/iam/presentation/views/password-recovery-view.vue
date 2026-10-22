<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthenticationStore } from "@/iam/presentation/authentication.store.js";

const { t } = useI18n();
const authentication = useAuthenticationStore();
const isDevelopment = import.meta.env.DEV;
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const validationError = ref("");
const success = ref(false);

async function submit() {
  validationError.value = "";
  success.value = false;
  if (password.value !== confirmPassword.value) {
    validationError.value = "password-recovery.passwords-do-not-match";
    return;
  }

  success.value = await authentication.resetPassword(email.value, password.value);
}
</script>

<template>
  <section class="recovery-page">
    <form class="recovery-card" @submit.prevent="submit">
      <h1>{{ t("password-recovery.title") }}</h1>
      <p>{{ t("password-recovery.description") }}</p>

      <label for="recovery-email">{{ t("password-recovery.email") }}</label>
      <input
        id="recovery-email"
        v-model.trim="email"
        type="email"
        autocomplete="email"
        :disabled="authentication.loading"
        required
      />

      <label for="new-password">{{ t("password-recovery.new-password") }}</label>
      <input
        id="new-password"
        v-model="password"
        type="password"
        autocomplete="new-password"
        minlength="6"
        :disabled="authentication.loading"
        required
      />

      <label for="confirm-new-password">{{ t("password-recovery.confirm-password") }}</label>
      <input
        id="confirm-new-password"
        v-model="confirmPassword"
        type="password"
        autocomplete="new-password"
        minlength="6"
        :disabled="authentication.loading"
        required
      />

      <p v-if="validationError" class="recovery-error" role="alert">
        {{ t(validationError) }}
      </p>
      <p v-if="authentication.error" class="recovery-error" role="alert">
        {{ t(authentication.error) }}
      </p>
      <p v-if="success" class="recovery-success" role="status">
        {{ t("password-recovery.success") }}
      </p>

      <button v-if="isDevelopment" type="submit" :disabled="authentication.loading">
        {{ authentication.loading ? t("password-recovery.submitting") : t("password-recovery.submit") }}
      </button>

      <router-link to="/login" class="login-link">
        {{ t("password-recovery.back-to-login") }}
      </router-link>
    </form>
  </section>
</template>

<style scoped>
.recovery-page {
  display: grid;
  min-height: 70vh;
  place-items: center;
  padding: 2rem;
}

.recovery-card {
  display: flex;
  width: min(100%, 28rem);
  flex-direction: column;
  gap: 0.8rem;
  padding: 2rem;
  border: 1px solid var(--wt-border);
  border-radius: 1rem;
  background: var(--wt-white);
  box-shadow: 0 1rem 2.5rem rgb(11 25 44 / 8%);
}

.recovery-card h1,
.recovery-card p {
  margin: 0;
}

.recovery-card label {
  margin-top: 0.5rem;
  font-weight: 600;
}

.recovery-card input {
  min-height: 2.8rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--wt-border);
  border-radius: 0.5rem;
  font: inherit;
}

.recovery-card button {
  min-height: 2.8rem;
  margin-top: 0.7rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--wt-primary);
  color: var(--wt-white);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.recovery-card button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.recovery-error {
  color: var(--wt-danger);
}

.recovery-success {
  color: var(--wt-success);
}

.login-link {
  margin-top: 0.7rem;
  color: var(--wt-secondary);
  font-weight: 600;
  text-align: center;
}
</style>
