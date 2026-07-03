package sba301.hrtech.notification.mapper;

import org.mapstruct.Mapper;
import sba301.hrtech.notification.dtos.response.NotificationResponse;
import sba301.hrtech.notification.entities.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);
}
