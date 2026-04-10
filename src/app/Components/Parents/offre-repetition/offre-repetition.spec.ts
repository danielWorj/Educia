import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffreRepetition } from './offre-repetition';

describe('OffreRepetition', () => {
  let component: OffreRepetition;
  let fixture: ComponentFixture<OffreRepetition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffreRepetition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffreRepetition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
