import {IoTGatewayApi} from "@/laundry-operations/infrastructure/iot-gateway-api.js";
import {ResourceStatus} from "@/laundry-operations/domain/model/resource-status.js";

/**
 * Raw status code reported by the sensors -> domain ResourceStatus.
 * TODO: confirm these codes with the IoT gateway specification.
 */
const RAW_STATUS_CODES = Object.freeze({
    0: ResourceStatus.AVAILABLE,
    1: ResourceStatus.BUSY,
    2: ResourceStatus.MAINTENANCE
});

/**
 * Anti-Corruption Layer: isolates the domain (ResourceStatus) from the format of the IoT gateway
 * (raw status codes, sensor units). The domain only knows ResourceStatus, never the sensor payload.
 */
export class ResourceMonitoringACL {
    #iotGateway;

    constructor(iotGateway = new IoTGatewayApi()) {
        this.#iotGateway = iotGateway;
    }

    /**
     * @param {string} deviceId
     * @returns {Promise<string>} A value of {@link ResourceStatus}.
     */
    async getResourceStatus(deviceId) {
        const payload = await this.#iotGateway.readSensorData(deviceId);
        return this.translate(payload);
    }

    /**
     * @param {import('@/laundry-operations/infrastructure/sensor-telemetry-payload.js').SensorTelemetryPayload} payload
     * @returns {string} A value of {@link ResourceStatus}. Unknown codes are treated as MAINTENANCE (not usable).
     */
    translate(payload) {
        return RAW_STATUS_CODES[payload.rawStatusCode] ?? ResourceStatus.MAINTENANCE;
    }
}
