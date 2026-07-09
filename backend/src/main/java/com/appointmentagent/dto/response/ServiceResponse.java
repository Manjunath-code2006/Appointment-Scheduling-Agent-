package com.appointmentagent.dto.response;

import com.appointmentagent.entity.ServiceType.AppointmentMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private BigDecimal price;
    private String color;
    private boolean active;
    private AppointmentMode mode;
    private LocalDateTime createdAt;
}
