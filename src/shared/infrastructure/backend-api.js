import {BaseApi} from "@/shared/infrastructure/base-api.js";

const backendApiUrl = import.meta.env.VITE_WASHTRACK_BACKEND_API_URL;

/**
 * Laundry branch the staff works in. The backend lists orders and resources per laundry.
 * TODO: take it from the signed-in staff member once IAM exposes it.
 */
export const currentLaundryId = import.meta.env.VITE_CURRENT_LAUNDRY_ID;

/**
 * Axios configuration for the real WashTrack backend (DevTech-Backend, ASP.NET Core).
 * Bounded contexts implemented in the backend extend this class instead of BaseApi,
 * so they keep working while the rest of the contexts still use the mock API.
 */
export class BackendApi extends BaseApi {
    constructor() {
        if (!backendApiUrl) {
            throw new Error("VITE_WASHTRACK_BACKEND_API_URL is not defined in the .env files");
        }
        super(backendApiUrl);
    }
}
