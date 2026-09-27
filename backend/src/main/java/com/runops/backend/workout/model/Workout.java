package com.runops.backend.workout.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date;

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be greater than 0")
    @Column(nullable = false)
    private Double distanceKm;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be greater than 0")
    @Column(nullable = false)
    private Integer durationSeconds;

    @Positive(message = "Average pace must be greater than 0")
    private Integer averagePaceSecondsPerKm;

    @Column(length = 1000)
    private String notes;

    public Workout() {
    }

    public Workout(
            LocalDate date,
            Double distanceKm,
            Integer durationSeconds,
            Integer averagePaceSecondsPerKm,
            String notes
    ) {
        this.date = date;
        this.distanceKm = distanceKm;
        this.durationSeconds = durationSeconds;
        this.averagePaceSecondsPerKm = averagePaceSecondsPerKm;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Integer getAveragePaceSecondsPerKm() {
        return averagePaceSecondsPerKm;
    }

    public void setAveragePaceSecondsPerKm(Integer averagePaceSecondsPerKm) {
        this.averagePaceSecondsPerKm = averagePaceSecondsPerKm;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}