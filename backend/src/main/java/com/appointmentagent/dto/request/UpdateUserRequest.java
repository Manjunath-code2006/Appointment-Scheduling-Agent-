package com.appointmentagent.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100)
    private String lastName;

    @Pattern(regexp = "^[+]?[0-9]{7,15}$", message = "Please provide a valid phone number")
    private String phone;

    @Size(max = 500)
    private String address;

    @Size(max = 500)
    private String profileImageUrl;
}
