import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnseignantsComponent } from './enseignants';

describe('EnseignantsComponent', () => {
  let component: EnseignantsComponent;
  let fixture: ComponentFixture<EnseignantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnseignantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnseignantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
