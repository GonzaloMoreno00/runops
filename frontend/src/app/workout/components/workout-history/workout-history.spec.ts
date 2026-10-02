
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutHistory } from './workout-history';

describe('WorkoutHistory', () => {
  let component: WorkoutHistory;
  let fixture: ComponentFixture<WorkoutHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutHistory);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a message when there are no workouts', async () => {

    // Arrange: simulate an empty workout history.
    fixture.componentRef.setInput('workouts', []);
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('errorMessage', '');

    // Wait for Angular to update the HTML.
    await fixture.whenStable();

    // Assert: check that the empty message appears.
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      'Todavía no hay entrenamientos registrados.'
    );
  });

});
