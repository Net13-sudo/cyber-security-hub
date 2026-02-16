package com.scorpion.security.service;

import com.scorpion.security.dto.IncidentCreateRequest;
import com.scorpion.security.dto.IncidentDto;
import com.scorpion.security.entity.Incident;
import com.scorpion.security.repository.IncidentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public List<IncidentDto> findAll(String status, int limit) {
        PageRequest page = PageRequest.of(0, Math.min(limit, 200));
        List<Incident> list = status != null && !status.isBlank()
                ? incidentRepository.findByStatusOrderByReportedAtDesc(status.trim(), page)
                : incidentRepository.findAllByOrderByReportedAtDesc(page);
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Optional<IncidentDto> findById(Long id) {
        return incidentRepository.findById(id).map(this::toDto);
    }

    public IncidentDto create(IncidentCreateRequest request) {
        Incident incident = new Incident();
        incident.setTitle(request.title());
        incident.setDescription(request.description());
        incident.setSeverity(request.severity());
        incident.setAssignedTo(request.assignedTo());
        incident.setStatus("OPEN");
        incident = incidentRepository.save(incident);
        return toDto(incident);
    }

    public Optional<IncidentDto> updateStatus(Long id, String status) {
        return incidentRepository.findById(id)
                .map(incident -> {
                    incident.setStatus(status);
                    return toDto(incidentRepository.save(incident));
                });
    }

    private IncidentDto toDto(Incident e) {
        return new IncidentDto(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getSeverity(),
                e.getStatus(),
                e.getAssignedTo(),
                e.getReportedAt(),
                e.getUpdatedAt()
        );
    }
}
