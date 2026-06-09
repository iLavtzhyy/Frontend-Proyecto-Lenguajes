import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FarmaciaComponent } from './farmacia';

describe('FarmaciaComponent', () => {
  let component: FarmaciaComponent;
  let fixture: ComponentFixture<FarmaciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmaciaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(FarmaciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
