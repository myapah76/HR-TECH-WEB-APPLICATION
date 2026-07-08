package hrtech.notification.mapper;

import org.mapstruct.Mapper;
import hrtech.notification.dtos.response.NotificationResponse;
import hrtech.notification.entities.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);
}
