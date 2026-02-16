package com.scorpion.security.repository;

import com.scorpion.security.entity.ThreatFeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ThreatFeedRepository extends JpaRepository<ThreatFeed, Long> {

    List<ThreatFeed> findAllByOrderByPublishedAtDesc(Pageable pageable);
}
