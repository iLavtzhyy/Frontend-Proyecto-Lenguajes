import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { VeterinariosComponent } from './veterinarios';

describe('VeterinariosComponent', () => {
  let component: VeterinariosComponent;
  let fixture: ComponentFixture<VeterinariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinariosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(VeterinariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
