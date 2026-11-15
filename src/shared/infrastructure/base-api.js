import axios from "axios";

const platformApi = import.meta.env.VITE_WASHTRACK_PLATFORM_API_URL;

/**
 * Centralizes the Axios configuration shared by every bounded context.
 */
export class BaseApi {
    /**
     * @private
     * Axios HTTP client instance for making API requests.
     * @type {import('axios').AxiosInstance}
     */
    #http;

    /**
     * @param {string} [baseURL] - Base URL of the API; the mock platform API by default.
     */
    constructor(baseURL = platformApi) {
        this.#http = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    get http() {
        return this.#http;
    }
}
