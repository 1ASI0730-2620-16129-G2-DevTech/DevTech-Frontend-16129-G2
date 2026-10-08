<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthenticationStore } from "@/iam/application/authentication.store.js";

const { t } = useI18n();
const router = useRouter();
const authentication = useAuthenticationStore();
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const validationError = ref("");

async function submit() {
  validationError.value = "";
  if (password.value !== confirmPassword.value) {
    validationError.value = "register.passwords-do-not-match";
    return;
  }

  const registered = await authentication.register(username.value, email.value, password.value);
  if (registered) {
    await router.push({ name: "login", query: { registered: "true" } });
  }
}
</script>

<template>
  <section class="register-page">
    <form class="register-card" @submit.prevent="submit">
      <h1>{{ t("register.title") }}</h1>
      <p>{{ t("register.description") }}</p>

      <label for="username">{{ t("register.name") }}</label>
      <input
        id="username"
        v-model.trim="username"
        type="text"
        autocomplete="name"
        required
      />

      <label for="register-email">{{ t("register.email") }}</label>
      <input
        id="register-email"
        v-model.trim="email"
        type="email"
        autocomplete="email"
        required
      />

      <label for="register-password">{{ t("register.password") }}</label>
      <input
        id="register-password"
        v-model="password"
        type="password"
        autocomplete="new-password"
        minlength="6"
        required
      />

      <label for="confirm-password">{{ t("register.confirm-password") }}</label>
      <input
        id="confirm-password"
        v-model="confirmPassword"
        type="password"
        autocomplete="new-password"
        minlength="6"
        required
      />

      <p v-if="validationError" class="register-error" role="alert">
        {{ t(validationError) }}
      </p>
      <p v-if="authentication.error" class="register-error" role="alert">
        {{ t(authentication.error) }}
      </p>

      <button type="submit" :disabled="authentication.loading">
        {{ authentication.loading ? t("register.submitting") : t("register.submit") }}
      </button>

      <p class="login-link">
        {{ t("register.has-account") }}
        <router-link to="/login">{{ t("register.sign-in") }}</router-link>
      </p>
    </form>
  </section>
</template>

<style scoped>
.register-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 2rem;
}

.register-card {
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

.register-card h1,
.register-card p {
  margin: 0;
}

.register-card label {
  margin-top: 0.5rem;
  font-weight: 600;
}

.register-card input {
  min-height: 2.8rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--wt-border);
  border-radius: 0.5rem;
  font: inherit;
}

.register-card button {
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

.register-card button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.register-error {
  color: var(--wt-danger);
}

.login-link {
  text-align: center;
}

.login-link a {
  color: var(--wt-secondary);
  font-weight: 600;
}
</style>
