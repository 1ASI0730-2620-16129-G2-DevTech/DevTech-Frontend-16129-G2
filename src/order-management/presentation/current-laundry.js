import {currentLaundryId} from "@/shared/infrastructure/backend-api.js";

/**
 * Laundry branch where new orders are registered (VITE_CURRENT_LAUNDRY_ID).
 * TODO: take it from the signed-in staff member once IAM exposes it.
 */
export const CURRENT_LAUNDRY_ID = currentLaundryId;

/**
 * Address of that laundry, where customers collect the orders they pick up at the store
 * (VITE_CURRENT_LAUNDRY_ADDRESS, "street, district").
 */
export const CURRENT_LAUNDRY_ADDRESS = import.meta.env.VITE_CURRENT_LAUNDRY_ADDRESS ?? "";
