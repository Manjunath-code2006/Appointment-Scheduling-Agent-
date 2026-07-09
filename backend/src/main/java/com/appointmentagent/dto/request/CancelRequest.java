package com.appointmentagent.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelRequest {

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}
