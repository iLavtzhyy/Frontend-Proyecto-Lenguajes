import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HospitalizacionComponent } from './hospitalizacion';

describe('HospitalizacionComponent', () => {
  let component: HospitalizacionComponent;
  let fixture: ComponentFixture<HospitalizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalizacionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(HospitalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
