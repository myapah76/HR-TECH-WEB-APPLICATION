package hrtech.notification.mapper;

import org.mapstruct.Mapper;
import hrtech.notification.dtos.response.NotificationResponse;
import hrtech.notification.entities.Notification;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "read", target = "isRead")
    NotificationResponse toResponse(Notification notification);
}
