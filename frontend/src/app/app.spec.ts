import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { App } from './app';
import { WorkoutService } from './workout/service/WorkoutService';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: WorkoutService,
          useValue: {
            getAllWorkouts: () => of([])
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('RunOps');
  });

  it('should show a message when there are no workouts', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Todavía no hay entrenamientos registrados.'
    );
  });
});