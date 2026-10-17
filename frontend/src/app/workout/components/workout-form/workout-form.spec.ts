import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { WorkoutForm } from './workout-form';
import { WorkoutService } from '../../service/WorkoutService';
import { Workout } from '../../model/workout';

describe('WorkoutForm', () => {
  let component: WorkoutForm;
  let fixture: ComponentFixture<WorkoutForm>;

  const workoutServiceMock = {
    createWorkout: vi.fn<WorkoutService['createWorkout']>()
  };

  const validFormValues = {
    date: '2026-09-27',
    distanceKm: 5,
    durationMinutes: 25,
    notes: 'Rodaje suave'
  };

  const savedWorkout: Workout = {
    id: 1,
    date: '2026-09-27',
    distanceKm: 5,
    durationSeconds: 1500,
    averagePaceSecondsPerKm: 300,
    notes: 'Rodaje suave'
  };

  beforeEach(async () => {
    workoutServiceMock.createWorkout.mockReset();
    workoutServiceMock.createWorkout.mockReturnValue(of(savedWorkout));

    await TestBed.configureTestingModule({
      imports: [WorkoutForm],
      providers: [
        {
          provide: WorkoutService,
          useValue: workoutServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit an empty form', () => {
    component.submit();

    expect(workoutServiceMock.createWorkout).not.toHaveBeenCalled();
    expect(component.form.controls.date.touched).toBe(true);
    expect(component.form.controls.distanceKm.touched).toBe(true);
    expect(component.form.controls.durationMinutes.touched).toBe(true);
  });

  it('should not submit a negative distance', () => {
    component.form.setValue({
      ...validFormValues,
      distanceKm: -5
    });

    component.submit();

    expect(workoutServiceMock.createWorkout).not.toHaveBeenCalled();
  });

  it('should not submit a duration of zero', () => {
    component.form.setValue({
      ...validFormValues,
      durationMinutes: 0
    });

    component.submit();

    expect(workoutServiceMock.createWorkout).not.toHaveBeenCalled();
  });

  it('should not submit notes longer than 1000 characters', () => {
    component.form.setValue({
      ...validFormValues,
      notes: 'a'.repeat(1001)
    });

    component.submit();

    expect(workoutServiceMock.createWorkout).not.toHaveBeenCalled();
  });

  it('should convert minutes to seconds before submitting', () => {
    component.form.setValue(validFormValues);

    component.submit();

    expect(workoutServiceMock.createWorkout).toHaveBeenCalledExactlyOnceWith({
      date: '2026-09-27',
      distanceKm: 5,
      durationSeconds: 1500,
      notes: 'Rodaje suave'
    });
  });

  it('should reset the form and notify the parent after saving', async () => {
    const onWorkoutCreated = vi.fn();
    component.workoutCreated.subscribe(onWorkoutCreated);
    component.form.setValue(validFormValues);

    component.submit();
    await fixture.whenStable();

    expect(component.form.getRawValue()).toEqual({
      date: '',
      distanceKm: null,
      durationMinutes: null,
      notes: ''
    });
    expect(component.saving()).toBe(false);
    expect(onWorkoutCreated).toHaveBeenCalledTimes(1);

  });

  it('should preserve the form and show an error when saving fails', async () => {
    workoutServiceMock.createWorkout.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    const onWorkoutCreated = vi.fn();
    component.workoutCreated.subscribe(onWorkoutCreated);
    component.form.setValue(validFormValues);

    component.submit();
    await fixture.whenStable();

    expect(component.form.getRawValue()).toEqual(validFormValues);
    expect(component.saving()).toBe(false);
    expect(onWorkoutCreated).not.toHaveBeenCalled();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[role="alert"]')?.textContent).toContain(
      'No se pudo guardar el entrenamiento.'
    );
    expect(compiled.querySelector('[role="status"]')).toBeNull();
  });
});
