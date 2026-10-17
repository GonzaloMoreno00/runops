import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../auth/service/auth.service';
import { WorkoutService } from '../../workout/service/WorkoutService';
import { MonthlyWorkoutSummary } from '../../workout/model/monthly-workout-summary';
import { Workout } from '../../workout/model/workout';

describe('Dashboard monthly summary and history', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  const summary: MonthlyWorkoutSummary = {
    year: 2026,
    month: 10,
    workoutCount: 2,
    totalDistanceKm: 15,
    totalDurationSeconds: 5100,
    averagePaceSecondsPerKm: 340
  };

  const workoutServiceMock = {
    createWorkout: vi.fn<WorkoutService['createWorkout']>(),
    updateWorkout: vi.fn<WorkoutService['updateWorkout']>(),
    getMonthlyWorkouts: vi.fn<WorkoutService['getMonthlyWorkouts']>(),
    getMonthlySummary: vi.fn<WorkoutService['getMonthlySummary']>(),
    deleteWorkout: vi.fn<WorkoutService['deleteWorkout']>()
  };

  beforeEach(async () => {
    workoutServiceMock.createWorkout.mockReset();
    workoutServiceMock.updateWorkout.mockReset();
    workoutServiceMock.getMonthlyWorkouts.mockReset();
    workoutServiceMock.getMonthlySummary.mockReset();
    workoutServiceMock.deleteWorkout.mockReset();
    workoutServiceMock.getMonthlyWorkouts.mockReturnValue(of([{
      id: 1, date: '2026-10-10', distanceKm: 5, durationSeconds: 1500,
      averagePaceSecondsPerKm: 300, notes: 'Rodaje de prueba'
    }]));
    workoutServiceMock.getMonthlySummary.mockReturnValue(of(summary));
    workoutServiceMock.deleteWorkout.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: workoutServiceMock },
        { provide: AuthService, useValue: {} }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    // Keep tests independent of the current date.
    component.selectedMonth.set('2026-10');
    await fixture.whenStable();
  });

  function summaryElement(): HTMLElement {
    return fixture.nativeElement.querySelector('.monthly-summary');
  }

  it('should open a blank form, focus the date, and discard cancelled input', async () => {
    expect(fixture.nativeElement.querySelector('app-workout-form')).toBeNull();
    const addButton: HTMLButtonElement = fixture.nativeElement.querySelector('#add-workout-button');
    addButton.click();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.workoutForm()?.form.controls.date.value).toBe('');
    expect(document.activeElement?.id).toBe('date');
    component.workoutForm()!.form.controls.notes.setValue('Unsaved draft');
    fixture.nativeElement.querySelector('.cancel-button').click();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(fixture.nativeElement.querySelector('app-workout-form')).toBeNull();
    expect(document.activeElement).toBe(addButton);
    addButton.click();
    await fixture.whenStable();
    expect(component.workoutForm()?.form.controls.notes.value).toBe('');
  });

  it.each(['create', 'update'] as const)(
    'should close the form after %s and keep confirmation in the dashboard',
    async operation => {
      const saved: Workout = {
        id: 1, date: '2026-10-10', distanceKm: 5, durationSeconds: 1500,
        averagePaceSecondsPerKm: 300, notes: 'Rodaje de prueba'
      };
      workoutServiceMock.createWorkout.mockReturnValueOnce(of(saved));
      workoutServiceMock.updateWorkout.mockReturnValueOnce(of(saved));

      if (operation === 'create') {
        fixture.nativeElement.querySelector('#add-workout-button').click();
      } else {
        fixture.nativeElement.querySelector('.edit-button').click();
      }
      await fixture.whenStable();

      const form = component.workoutForm()!;
      if (operation === 'update') {
        expect(form.form.controls.date.value).toBe(saved.date);
        expect(form.form.controls.durationMinutes.value).toBe(25);
      }
      form.form.setValue({
        date: saved.date, distanceKm: 5, durationMinutes: 25, notes: saved.notes!
      });
      workoutServiceMock.getMonthlyWorkouts.mockClear();
      workoutServiceMock.getMonthlySummary.mockClear();
      fixture.nativeElement.querySelector('app-workout-form form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('app-workout-form')).toBeNull();
      expect(fixture.nativeElement.querySelector('.success-message')?.textContent)
        .toContain(operation === 'create'
          ? 'Entrenamiento guardado correctamente.'
          : 'Entrenamiento actualizado correctamente.');
      expect(workoutServiceMock.getMonthlyWorkouts).toHaveBeenCalledExactlyOnceWith(2026, 10);
      expect(workoutServiceMock.getMonthlySummary).toHaveBeenCalledExactlyOnceWith(2026, 10);
    }
  );

  it('should keep the form and entered values after a failed save', async () => {
    const response = new Subject<Workout>();
    workoutServiceMock.createWorkout.mockReturnValueOnce(response);
    fixture.nativeElement.querySelector('#add-workout-button').click();
    await fixture.whenStable();
    const values = { date: '2026-10-10', distanceKm: 5, durationMinutes: 25, notes: 'Keep me' };
    component.workoutForm()!.form.setValue(values);
    component.workoutForm()!.submit();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.edit-button').disabled).toBe(true);
    response.error(new Error('Network error'));
    await fixture.whenStable();

    expect(component.formVisible()).toBe(true);
    expect(component.workoutForm()!.form.getRawValue()).toEqual(values);
    expect(fixture.nativeElement.querySelector('app-workout-form [role="alert"]').textContent)
      .toContain('No se pudo guardar el entrenamiento.');
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(false);
  });

  async function selectMonth(value: string): Promise<void> {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#summary-month');
    input.value = value;
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  it('should load the selected month and display all four formatted totals', () => {
    expect(workoutServiceMock.getMonthlyWorkouts).toHaveBeenCalledExactlyOnceWith(2026, 10);
    expect(workoutServiceMock.getMonthlySummary).toHaveBeenCalledExactlyOnceWith(2026, 10);
    const totals = Array.from(summaryElement().querySelectorAll('dd'))
      .map(element => element.textContent?.trim());
    expect(totals).toEqual(['15 km', '2', '1 h 25 min 0 s', '5:40 min/km']);
  });

  it('should hide old totals while loading the month selected in the input', async () => {
    const response = new Subject<MonthlyWorkoutSummary>();
    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(response);

    await selectMonth('2026-09');

    expect(workoutServiceMock.getMonthlySummary).toHaveBeenLastCalledWith(2026, 9);
    expect(summaryElement().textContent).toContain('Cargando resumen...');
    expect(summaryElement().querySelector('.summary-grid')).toBeNull();

    response.next({ ...summary, month: 9, totalDistanceKm: 20 });
    response.complete();
    await fixture.whenStable();

    expect(summaryElement().textContent).toContain('20 km');
    expect(component.summaryLoading()).toBe(false);
  });

  it('should show zero totals and no pace for an empty month', async () => {
    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(of({
      ...summary, month: 9, workoutCount: 0, totalDistanceKm: 0,
      totalDurationSeconds: 0, averagePaceSecondsPerKm: null
    }));

    await selectMonth('2026-09');

    const totals = Array.from(summaryElement().querySelectorAll('dd'))
      .map(element => element.textContent?.trim());
    expect(totals).toEqual(['0 km', '0', '0 h 0 min 0 s', '—']);
    expect(summaryElement().textContent).toContain('No hay entrenamientos registrados en este mes.');
  });

  it('should keep history visible on a summary error and allow retrying', async () => {
    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(
      throwError(() => ({ status: 500 }))
    );

    await selectMonth('2026-09');

    expect(summaryElement().querySelector('[role="alert"]')?.textContent)
      .toContain('No se pudo cargar el resumen.');
    expect(summaryElement().querySelector('.summary-grid')).toBeNull();
    expect(component.summaryLoading()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-workout-history').textContent)
      .toContain('Rodaje de prueba');

    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(of({ ...summary, month: 9 }));
    const retry: HTMLButtonElement = summaryElement().querySelector('button')!;
    retry.click();
    await fixture.whenStable();

    expect(workoutServiceMock.getMonthlySummary).toHaveBeenLastCalledWith(2026, 9);
    expect(summaryElement().querySelector('[role="alert"]')).toBeNull();
    expect(summaryElement().textContent).toContain('15 km');
  });

  it('should explain that the session expired on a 401 response', async () => {
    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(
      throwError(() => ({ status: 401 }))
    );
    await selectMonth('2026-09');
    expect(summaryElement().querySelector('[role="alert"]')?.textContent)
      .toContain('Tu sesión ha caducado. Vuelve a iniciar sesión.');
  });

  it('should not request summary or history when the month input is cleared', async () => {
    workoutServiceMock.getMonthlySummary.mockClear();
    workoutServiceMock.getMonthlyWorkouts.mockClear();
    await selectMonth('');
    expect(workoutServiceMock.getMonthlySummary).not.toHaveBeenCalled();
    expect(workoutServiceMock.getMonthlyWorkouts).not.toHaveBeenCalled();
    expect(component.workouts()).toEqual([]);
    expect(component.loading()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-workout-history').textContent)
      .toContain('Selecciona un mes válido para ver los entrenamientos.');
    expect(summaryElement().textContent).toContain('Selecciona un mes válido.');
    expect(summaryElement().querySelector('.summary-grid')).toBeNull();
  });

  it('should not let an older response overwrite the latest selected month', async () => {
    const septemberResponse = new Subject<MonthlyWorkoutSummary>();
    const augustResponse = new Subject<MonthlyWorkoutSummary>();
    workoutServiceMock.getMonthlySummary
      .mockReturnValueOnce(septemberResponse)
      .mockReturnValueOnce(augustResponse);

    await selectMonth('2026-09');
    await selectMonth('2026-08');

    const augustSummary = { ...summary, month: 8, totalDistanceKm: 8 };
    augustResponse.next(augustSummary);
    augustResponse.complete();
    // The previous request produces a late result, which must be ignored.
    septemberResponse.next({ ...summary, month: 9, totalDistanceKm: 99 });
    septemberResponse.complete();
    await fixture.whenStable();

    expect(component.monthlySummary()).toEqual(augustSummary);
    expect(summaryElement().textContent).toContain('8 km');
    expect(summaryElement().textContent).not.toContain('99 km');
  });

  it('should cancel a pending summary when the dashboard is destroyed', async () => {
    const cancelRequest = vi.fn();
    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(
      new Observable<MonthlyWorkoutSummary>(() => cancelRequest)
    );
    await selectMonth('2026-09');
    expect(cancelRequest).not.toHaveBeenCalled();

    fixture.destroy();

    expect(cancelRequest).toHaveBeenCalledTimes(1);
  });

  it.each(['create', 'update', 'delete'] as const)(
    'should refresh summary and history for the selected month after a successful %s',
    async (operation) => {
      await selectMonth('2026-09');
      workoutServiceMock.getMonthlySummary.mockClear();
      workoutServiceMock.getMonthlyWorkouts.mockClear();
      workoutServiceMock.getMonthlyWorkouts.mockReturnValueOnce(of([]));
      workoutServiceMock.getMonthlySummary.mockReturnValueOnce(of({
        ...summary, month: 9, totalDistanceKm: 25
      }));

      if (operation === 'create') {
        component.onWorkoutCreated();
      } else if (operation === 'update') {
        component.onWorkoutUpdated();
      } else {
        component.deleteWorkout(1);
      }
      await fixture.whenStable();

      expect(workoutServiceMock.getMonthlySummary).toHaveBeenCalledExactlyOnceWith(2026, 9);
      expect(workoutServiceMock.getMonthlyWorkouts).toHaveBeenCalledExactlyOnceWith(2026, 9);
      expect(component.workouts()).toEqual([]);
      expect(summaryElement().textContent).toContain('25 km');
    }
  );

  it('should preserve the summary when deleting fails', async () => {
    workoutServiceMock.getMonthlySummary.mockClear();
    workoutServiceMock.getMonthlyWorkouts.mockClear();
    workoutServiceMock.deleteWorkout.mockReturnValueOnce(
      throwError(() => ({ status: 500 }))
    );
    component.deleteWorkout(1);
    await fixture.whenStable();

    expect(workoutServiceMock.getMonthlySummary).not.toHaveBeenCalled();
    expect(workoutServiceMock.getMonthlyWorkouts).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('app-workout-history').textContent)
      .toContain('Rodaje de prueba');
    expect(component.monthlySummary()).toEqual(summary);
    expect(component.deleteErrorMessage()).toContain('No se pudo eliminar');
  });

  it('should request both sections for the same month and display the monthly empty message', async () => {
    workoutServiceMock.getMonthlyWorkouts.mockClear();
    workoutServiceMock.getMonthlySummary.mockClear();
    workoutServiceMock.getMonthlyWorkouts.mockReturnValueOnce(of([]));
    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(of({
      ...summary, month: 9, workoutCount: 0, totalDistanceKm: 0,
      totalDurationSeconds: 0, averagePaceSecondsPerKm: null
    }));

    await selectMonth('2026-09');

    expect(workoutServiceMock.getMonthlyWorkouts).toHaveBeenCalledExactlyOnceWith(2026, 9);
    expect(workoutServiceMock.getMonthlySummary).toHaveBeenCalledExactlyOnceWith(2026, 9);
    expect(fixture.nativeElement.querySelector('app-workout-history').textContent)
      .toContain('No hay entrenamientos registrados en este mes.');
  });

  it('should hide previous workouts while loading and ignore late history responses', async () => {
    const septemberResponse = new Subject<Workout[]>();
    const augustResponse = new Subject<Workout[]>();
    workoutServiceMock.getMonthlyWorkouts
      .mockReturnValueOnce(septemberResponse)
      .mockReturnValueOnce(augustResponse);

    await selectMonth('2026-09');

    const history: HTMLElement = fixture.nativeElement.querySelector('app-workout-history');
    expect(history.textContent).toContain('Cargando entrenamientos...');
    expect(history.textContent).not.toContain('Rodaje de prueba');

    await selectMonth('2026-08');
    augustResponse.next([]);
    augustResponse.complete();
    septemberResponse.next([{
      id: 99, date: '2026-09-10', distanceKm: 5, durationSeconds: 1500,
      averagePaceSecondsPerKm: 300, notes: 'Respuesta antigua de septiembre'
    }]);
    septemberResponse.complete();
    await fixture.whenStable();

    expect(component.workouts()).toEqual([]);
    expect(component.loading()).toBe(false);
    expect(history.textContent).not.toContain('Respuesta antigua de septiembre');
    expect(history.textContent).toContain('No hay entrenamientos registrados en este mes.');
  });

  it.each([
    [500, 'No se pudieron cargar los entrenamientos.'],
    [401, 'Tu sesión ha caducado. Vuelve a iniciar sesión.']
  ] as const)('should display a history error for HTTP %s without hiding the summary', async (status, message) => {
    workoutServiceMock.getMonthlyWorkouts.mockReturnValueOnce(
      throwError(() => ({ status }))
    );
    workoutServiceMock.getMonthlySummary.mockReturnValueOnce(of({ ...summary, month: 9 }));

    await selectMonth('2026-09');

    const history: HTMLElement = fixture.nativeElement.querySelector('app-workout-history');
    expect(history.querySelector('[role="alert"]')?.textContent).toContain(message);
    expect(history.textContent).not.toContain('Rodaje de prueba');
    expect(component.loading()).toBe(false);
    expect(summaryElement().textContent).toContain('15 km');
    expect(component.summaryError()).toBe('');
  });

  it('should cancel pending history when the dashboard is destroyed', async () => {
    const cancelRequest = vi.fn();
    workoutServiceMock.getMonthlyWorkouts.mockReturnValueOnce(
      new Observable<Workout[]>(() => cancelRequest)
    );

    await selectMonth('2026-09');
    expect(cancelRequest).not.toHaveBeenCalled();

    fixture.destroy();

    expect(cancelRequest).toHaveBeenCalledTimes(1);
  });
});
