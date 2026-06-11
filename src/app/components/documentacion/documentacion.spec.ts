import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentacionComponent } from './documentacion';

describe('DocumentacionComponent', () => {
  let component: DocumentacionComponent;
  let fixture: ComponentFixture<DocumentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DocumentacionComponent] }).compileComponents();
    fixture = TestBed.createComponent(DocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });
});
