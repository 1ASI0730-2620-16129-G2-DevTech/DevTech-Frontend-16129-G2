import { defineStore } from "pinia";
import { ref } from "vue";
import { AuthenticationApi } from "../infrastructure/authentication-api.js";

const authenticationApi = new AuthenticationApi();

export const useAuthenticationStore = defineStore("authentication", () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref("");

    async function signIn(email, password) {
        loading.value = true;
        error.value = "";
        try {
            user.value = await authenticationApi.authenticate(email, password);
            if (!user.value) {
                error.value = "login.invalid-credentials";
                return false;
            }
            return true;
        } catch {
            error.value = "login.connection-error";
            return false;
        } finally {
            loading.value = false;
        }
    }

    return { user, loading, error, signIn };
});
