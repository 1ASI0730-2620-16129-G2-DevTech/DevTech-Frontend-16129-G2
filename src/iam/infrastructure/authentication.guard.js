import useIamStore from "@/iam/application/iam.store.js";

/** Routes anyone can open without signing in. */
const PUBLIC_ROUTE_NAMES = Object.freeze(["login", "register", "password-recovery"]);

/**
 * Router guard (same idea as Learning Center's authentication.guard.js).
 * - Without a session, every private route sends the user to the login page and
 *   remembers where they wanted to go.
 * - With a session, the login and register pages send the user to the dashboard.
 * @param {import("vue-router").RouteLocationNormalized} to
 * @returns {true|import("vue-router").RouteLocationRaw}
 */
export const authenticationGuard = (to) => {
    const iamStore = useIamStore();
    const isPublicRoute = PUBLIC_ROUTE_NAMES.includes(to.name);

    if (!iamStore.isSignedIn && !isPublicRoute) {
        return { name: "login", query: to.fullPath !== "/" ? { redirect: to.fullPath } : {} };
    }
    if (iamStore.isSignedIn && isPublicRoute) {
        return { name: "home" };
    }
    return true;
};
