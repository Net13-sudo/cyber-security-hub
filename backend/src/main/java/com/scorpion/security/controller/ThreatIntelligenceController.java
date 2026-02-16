package com.scorpion.security.controller;

import com.scorpion.security.dto.ThreatFeedItem;
import com.scorpion.security.service.ThreatIntelligenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/threat-intelligence")
public class ThreatIntelligenceController {

    private final ThreatIntelligenceService threatIntelligenceService;

    public ThreatIntelligenceController(ThreatIntelligenceService threatIntelligenceService) {
        this.threatIntelligenceService = threatIntelligenceService;
    }

    @GetMapping("/feeds")
    public ResponseEntity<List<ThreatFeedItem>> getFeeds(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(threatIntelligenceService.getRecentFeeds(limit));
    }

    @GetMapping("/feeds/{id}")
    public ResponseEntity<ThreatFeedItem> getFeedById(@PathVariable Long id) {
        return threatIntelligenceService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
