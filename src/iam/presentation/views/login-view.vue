<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthenticationStore } from "@/iam/application/authentication.store.js";

const { t } = useI18n();
const router = useRouter();
const authentication = useAuthenticationStore();
const email = ref("");
const password = ref("");

async function submit() {
  const signedIn = await authentication.signIn(email.value, password.value);
  if (signedIn) {
    await router.push("/home");
  }
}
</script>

<template>
  <section class="login-page">
    <form class="login-card" @submit.prevent="submit">
      <h1>{{ t("login.title") }}</h1>
      <p>{{ t("login.description") }}</p>

      <label for="email">{{ t("login.email") }}</label>
      <input
        id="email"
        v-model.trim="email"
        type="email"
        autocomplete="username"
        required
      />

      <label for="password">{{ t("login.password") }}</label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        required
      />

      <p v-if="authentication.error" class="login-error" role="alert">
        {{ t(authentication.error) }}
      </p>

      <button type="submit" :disabled="authentication.loading">
        {{ authentication.loading ? t("login.submitting") : t("login.submit") }}
      </button>

      <small>{{ t("login.demo-hint") }}</small>
      <small><strong>{{ t("login.demo-email") }}</strong> rosa.diaz@example.com</small>
      <small><strong>{{ t("login.demo-password") }}</strong> 123456</small>
    </form>
  </section>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 70vh;
  place-items: center;
  padding: 2rem;
}

.login-card {
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

.login-card h1,
.login-card p {
  margin: 0;
}

.login-card label {
  margin-top: 0.5rem;
  font-weight: 600;
}

.login-card input {
  min-height: 2.8rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--wt-border);
  border-radius: 0.5rem;
  font: inherit;
}

.login-card button {
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

.login-card button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.login-error {
  color: var(--wt-danger);
}

.login-card small {
  color: #52647e;
}
</style>
