import { defineStore } from "pinia";
import { ref } from "vue";
import { IdentityService } from "./identity-service.js";
import { AuthenticationServiceImpl } from "../infrastructure/authentication-service-impl.js";
import { UserRepositoryImpl } from "../infrastructure/user-repository-impl.js";

const identityService = new IdentityService({
    userRepository: new UserRepositoryImpl(),
    authenticationService: new AuthenticationServiceImpl(),
});

export const useAuthenticationStore = defineStore("authentication", () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref("");

    async function signIn(email, password) {
        loading.value = true;
        error.value = "";
        try {
            user.value = await identityService.authenticate(email, password);
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

    async function register(username, email, password) {
        loading.value = true;
        error.value = "";
        try {
            await identityService.register({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password,
            });
            return true;
        } catch (requestError) {
            error.value = requestError.message === "EMAIL_ALREADY_REGISTERED"
                ? "register.email-already-registered"
                : "register.connection-error";
            return false;
        } finally {
            loading.value = false;
        }
    }

    return { user, loading, error, signIn, register };
});
