package com.scorpion.security.dto;

import java.time.Instant;

public record ThreatFeedItem(
        Long id,
        String source,
        String title,
        String severity,
        String type,
        String description,
        Instant publishedAt
) {}
