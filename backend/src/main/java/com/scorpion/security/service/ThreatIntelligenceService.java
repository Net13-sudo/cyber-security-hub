package com.scorpion.security.service;

import com.scorpion.security.dto.ThreatFeedItem;
import com.scorpion.security.entity.ThreatFeed;
import com.scorpion.security.repository.ThreatFeedRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ThreatIntelligenceService {

    private final ThreatFeedRepository threatFeedRepository;

    public ThreatIntelligenceService(ThreatFeedRepository threatFeedRepository) {
        this.threatFeedRepository = threatFeedRepository;
    }

    public List<ThreatFeedItem> getRecentFeeds(int limit) {
        return threatFeedRepository
                .findAllByOrderByPublishedAtDesc(PageRequest.of(0, Math.min(limit, 200)))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ThreatFeedItem> getById(Long id) {
        return threatFeedRepository.findById(id).map(this::toDto);
    }

    private ThreatFeedItem toDto(ThreatFeed e) {
        return new ThreatFeedItem(
                e.getId(),
                e.getSource(),
                e.getTitle(),
                e.getSeverity(),
                e.getType(),
                e.getDescription(),
                e.getPublishedAt()
        );
    }
}
