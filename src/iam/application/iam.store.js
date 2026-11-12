import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { IdentityService } from "./identity-service.js";
import { AuthenticationServiceImpl } from "../infrastructure/authentication-service-impl.js";
import { UserRepositoryImpl } from "../infrastructure/user-repository-impl.js";

/** Key of the browser storage where the signed-in user is kept between page reloads. */
const SESSION_STORAGE_KEY = "washtrack.session";

const identityService = new IdentityService({
    userRepository: new UserRepositoryImpl(),
    authenticationService: new AuthenticationServiceImpl(),
});

/**
 * Turns the User aggregate into the plain data the session keeps.
 * The password is never kept.
 * @param {import("../domain/model/user.js").User} user
 * @returns {{id: string, code: string, username: string, email: string, role: string}}
 */
function toSessionUser(user) {
    return {
        id: user.id,
        code: user.code,
        username: user.username,
        email: user.email,
        role: user.role,
    };
}

/**
 * Reads the session saved by a previous sign-in, so a page reload does not sign the user out.
 * @returns {Object|null} The saved user, or null when there is none or it cannot be read.
 */
function readSavedSession() {
    try {
        const saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
        return saved && typeof saved.id === "string" && typeof saved.role === "string" ? saved : null;
    } catch {
        return null;
    }
}

/**
 * Application store of the IAM bounded context.
 * It keeps who is signed in and runs the identity use cases: sign in, sign out,
 * register and reset password (the last one only in development).
 */
const useIamStore = defineStore("iam", () => {
    /** Signed-in user, or null when nobody is signed in. */
    const currentUser = ref(readSavedSession());
    const loading = ref(false);
    /** Translation key of the last error, or an empty string. */
    const error = ref("");

    const isSignedIn = computed(() => currentUser.value !== null);

    /**
     * Use case: sign in. Saves the session only when the credentials are right,
     * so a failed attempt never leaves the previous user signed in.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<boolean>} True when the user signed in.
     */
    async function signIn(email, password) {
        loading.value = true;
        error.value = "";
        try {
            const user = await identityService.authenticate(email, password);
            if (!user) {
                signOut();
                error.value = "login.invalid-credentials";
                return false;
            }
            currentUser.value = toSessionUser(user);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser.value));
            return true;
        } catch {
            error.value = "login.connection-error";
            return false;
        } finally {
            loading.value = false;
        }
    }

    /** Use case: sign out. Removes the user from memory and from the browser storage. */
    function signOut() {
        currentUser.value = null;
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    /**
     * Use case: register a new user.
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @param {"customer"|"shift-manager"} [role]
     * @returns {Promise<boolean>} True when the user was registered.
     */
    async function register(username, email, password, role = "customer") {
        loading.value = true;
        error.value = "";
        try {
            await identityService.register({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
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

    /**
     * Use case: reset a password (development mock only).
     * @param {string} email
     * @param {string} password
     * @returns {Promise<boolean>} True when the password was changed.
     */
    async function resetPassword(email, password) {
        loading.value = true;
        error.value = "";
        try {
            await identityService.resetPassword({
                email: email.trim().toLowerCase(),
                password,
            });
            return true;
        } catch (requestError) {
            error.value = requestError.message === "USER_NOT_FOUND"
                ? "password-recovery.email-not-found"
                : requestError.message === "PASSWORD_RESET_DEVELOPMENT_ONLY"
                    ? "password-recovery.development-only"
                    : "password-recovery.connection-error";
            return false;
        } finally {
            loading.value = false;
        }
    }

    return { currentUser, loading, error, isSignedIn, signIn, signOut, register, resetPassword };
});

export default useIamStore;
