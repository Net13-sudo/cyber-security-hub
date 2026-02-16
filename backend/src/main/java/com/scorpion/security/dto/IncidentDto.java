package com.scorpion.security.dto;

import java.time.Instant;

public record IncidentDto(
        Long id,
        String title,
        String description,
        String severity,
        String status,
        String assignedTo,
        Instant reportedAt,
        Instant updatedAt
) {}
