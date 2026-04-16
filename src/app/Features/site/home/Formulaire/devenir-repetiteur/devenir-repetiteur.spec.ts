import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevenirRepetiteur } from './devenir-repetiteur';

describe('DevenirRepetiteur', () => {
  let component: DevenirRepetiteur;
  let fixture: ComponentFixture<DevenirRepetiteur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevenirRepetiteur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevenirRepetiteur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
