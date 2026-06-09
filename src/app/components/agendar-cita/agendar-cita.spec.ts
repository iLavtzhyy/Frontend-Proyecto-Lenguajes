import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RecepcionComponent } from './agendar-cita';

describe('RecepcionComponent', () => {
  let component: RecepcionComponent;
  let fixture: ComponentFixture<RecepcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
