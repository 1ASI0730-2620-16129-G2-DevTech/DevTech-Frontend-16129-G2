import {Notification} from "@/tracking-notifications/domain/model/notification.entity.js";

export class NotificationAssembler {
    static toEntityFromResource(resource) {
        return new Notification({...resource});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(response.statusText);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['notifications'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}