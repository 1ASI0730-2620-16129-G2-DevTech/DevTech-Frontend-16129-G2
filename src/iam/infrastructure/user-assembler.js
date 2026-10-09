import { generateUuid } from "../../shared/domain/model/uuid.js";
import { User } from "../domain/model/user.js";

/**
 * Maps mock API user records to and from IAM user aggregates.
 */
export class UserAssembler {
    /**
     * @param {Object} resource
     * @returns {User}
     */
    toEntityFromResource(resource) {
        return new User({
            id: resource.iamId ?? this.#getDomainId(resource.id),
            email: resource.email,
            passwordHash: resource.passwordHash,
            role: resource.role,
        });
    }

    /**
     * @param {User} user
     * @param {{username: string, password: string}} [credentials]
     * @param {string} [code] - Mock resource id, e.g. CL008 or VN002.
     * @returns {Object}
     */
    toResourceFromEntity(user, credentials = {}, code) {
        return {
            ...(code && { id: code }),
            iamId: user.id,
            username: credentials.username,
            email: user.email,
            password: credentials.password,
            role: user.role,
        };
    }

    #getDomainId(resourceId) {
        if (typeof resourceId === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(resourceId)) {
            return resourceId;
        }
        // Mock codes (CL001 customers, VN001 managers) map to stable UUIDs; the prefix keeps CL001 and VN001 apart.
        const code = /^(CL|VN)(\d+)$/.exec(String(resourceId));
        if (code) {
            const prefixDigit = code[1] === "CL" ? "1" : "2";
            return `00000000-0000-7000-8000-${prefixDigit}${Number(code[2]).toString(16).padStart(11, "0")}`;
        }
        if (!Number.isSafeInteger(Number(resourceId)) || Number(resourceId) < 0) {
            throw new Error("User resource must have an IAM UUID, a CL/VN code or a numeric mock ID");
        }
        const suffix = Number(resourceId).toString(16).padStart(12, "0");
        return `00000000-0000-7000-8000-${suffix}`;
    }
}
