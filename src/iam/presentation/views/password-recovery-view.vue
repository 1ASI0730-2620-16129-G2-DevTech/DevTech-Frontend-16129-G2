<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <section class="recovery-page">
    <div class="recovery-card">
      <h1>{{ t("password-recovery.title") }}</h1>
      <p>{{ t("password-recovery.description") }}</p>

      <label for="recovery-email">{{ t("password-recovery.email") }}</label>
      <input
        id="recovery-email"
        type="email"
        autocomplete="email"
        required
      />

      <label for="new-password">{{ t("password-recovery.new-password") }}</label>
      <input
        id="new-password"
        type="password"
        autocomplete="new-password"
        minlength="6"
        required
      />

      <label for="confirm-new-password">{{ t("password-recovery.confirm-password") }}</label>
      <input
        id="confirm-new-password"
        type="password"
        autocomplete="new-password"
        minlength="6"
        required
      />

      <router-link to="/login" class="login-link">
        {{ t("password-recovery.back-to-login") }}
      </router-link>
    </div>
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

.login-link {
  margin-top: 0.7rem;
  color: var(--wt-secondary);
  font-weight: 600;
  text-align: center;
}
</style>
