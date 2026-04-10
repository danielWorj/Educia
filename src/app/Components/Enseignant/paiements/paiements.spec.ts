import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paiements } from './paiements';

describe('Paiements', () => {
  let component: Paiements;
  let fixture: ComponentFixture<Paiements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paiements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paiements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
