/**
 * DTO with the raw telemetry sent by the IoT gateway. It belongs to the external system:
 * it must never reach the domain (the anti-corruption layer translates it).
 */
export class SensorTelemetryPayload {
    constructor({
                    deviceId = null,
                    rawStatusCode = null,
                    humidity = null,
                    vibration = null,
                    electricCurrent = null,
                    timestamp = null
                } = {}) {
        this.deviceId = deviceId;
        this.rawStatusCode = rawStatusCode;
        this.humidity = humidity;
        this.vibration = vibration;
        this.electricCurrent = electricCurrent;
        this.timestamp = timestamp;
    }
}
