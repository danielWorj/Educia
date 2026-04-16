import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrouverRepetiteur } from './trouver-repetiteur';

describe('TrouverRepetiteur', () => {
  let component: TrouverRepetiteur;
  let fixture: ComponentFixture<TrouverRepetiteur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrouverRepetiteur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrouverRepetiteur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
