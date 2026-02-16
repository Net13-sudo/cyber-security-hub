package com.scorpion.security.repository;

import com.scorpion.security.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByStatusOrderByReportedAtDesc(String status, Pageable pageable);

    List<Incident> findAllByOrderByReportedAtDesc(Pageable pageable);
}
