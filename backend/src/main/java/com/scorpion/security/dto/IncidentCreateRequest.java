package com.scorpion.security.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentCreateRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 2000) String description,
        @NotBlank @Size(max = 50) String severity,
        @Size(max = 100) String assignedTo
) {}
