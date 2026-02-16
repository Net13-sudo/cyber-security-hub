package com.scorpion.security.controller;

import com.scorpion.security.dto.IncidentDto;
import com.scorpion.security.dto.IncidentCreateRequest;
import com.scorpion.security.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<List<IncidentDto>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(incidentService.findAll(status, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDto> getById(@PathVariable Long id) {
        return incidentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<IncidentDto> create(@Valid @RequestBody IncidentCreateRequest request) {
        IncidentDto created = incidentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return incidentService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
