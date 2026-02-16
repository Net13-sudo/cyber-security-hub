package com.scorpion.security.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "threat_feed")
public class ThreatFeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String source;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 50)
    private String severity;

    @Column(length = 100)
    private String type;

    @Column(length = 2000)
    private String description;

    @Column(name = "published_at")
    private Instant publishedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
}
