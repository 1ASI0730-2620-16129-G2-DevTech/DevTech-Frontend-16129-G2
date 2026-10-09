import axios from "axios";
import {SensorTelemetryPayload} from "@/laundry-operations/infrastructure/sensor-telemetry-payload.js";

const iotGatewayApiUrl = import.meta.env.VITE_IOT_GATEWAY_API_URL;
const sensorDataEndpointPath = import.meta.env.VITE_IOT_SENSOR_DATA_ENDPOINT_PATH;

/**
 * Client of the external IoT gateway (outside of the WashTrack platform API).
 */
export class IoTGatewayApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: iotGatewayApiUrl,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    /**
     * Reads the latest telemetry of a device.
     * @param {string} deviceId
     * @returns {Promise<SensorTelemetryPayload>}
     */
    async readSensorData(deviceId) {
        const response = await this.#http.get(sensorDataEndpointPath, {params: {deviceId}});
        const rows = response.data instanceof Array ? response.data : [response.data];
        const latest = rows.filter(Boolean).at(-1);
        if (!latest) {
            throw new Error(`No telemetry available for device ${deviceId}`);
        }
        return new SensorTelemetryPayload(latest);
    }
}
