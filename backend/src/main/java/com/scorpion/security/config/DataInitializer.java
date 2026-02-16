package com.scorpion.security.config;

import com.scorpion.security.entity.Incident;
import com.scorpion.security.entity.ThreatFeed;
import com.scorpion.security.repository.IncidentRepository;
import com.scorpion.security.repository.ThreatFeedRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private final ThreatFeedRepository threatFeedRepository;
    private final IncidentRepository incidentRepository;

    public DataInitializer(ThreatFeedRepository threatFeedRepository,
                           IncidentRepository incidentRepository) {
        this.threatFeedRepository = threatFeedRepository;
        this.incidentRepository = incidentRepository;
    }

    @Override
    public void run(String... args) {
        if (threatFeedRepository.count() > 0) return;

        List<ThreatFeed> feeds = List.of(
                threat("CISA", "Critical RCE in Apache Log4j", "CRITICAL", "Vulnerability",
                        "Remote code execution in Log4j 2.x. Apply patches immediately."),
                threat("NIST NVD", "OpenSSH privilege escalation", "HIGH", "Vulnerability",
                        "Privilege escalation in OpenSSH server. Update to latest version."),
                threat("MITRE ATT&CK", "T1566 - Phishing", "MEDIUM", "Tactic",
                        "Adversaries send phishing messages to gain access to victim systems."),
                threat("AlienVault OTX", "New C2 infrastructure", "HIGH", "IOC",
                        "New command-and-control servers linked to known APT group."),
                threat("Scorpion TI", "Ransomware campaign targeting healthcare", "CRITICAL", "Campaign",
                        "Active ransomware campaign targeting healthcare sector. IoCs available.")
        );
        threatFeedRepository.saveAll(feeds);

        Incident incident = new Incident();
        incident.setTitle("Suspicious lateral movement detected");
        incident.setDescription("Multiple failed logins followed by successful access from new IP.");
        incident.setSeverity("HIGH");
        incident.setStatus("INVESTIGATING");
        incident.setAssignedTo("SOC Team");
        incidentRepository.save(incident);
    }

    private static ThreatFeed threat(String source, String title, String severity, String type, String desc) {
        ThreatFeed f = new ThreatFeed();
        f.setSource(source);
        f.setTitle(title);
        f.setSeverity(severity);
        f.setType(type);
        f.setDescription(desc);
        f.setPublishedAt(Instant.now());
        return f;
    }
}
