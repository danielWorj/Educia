import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Matiere } from './matiere';

describe('Matiere', () => {
  let component: Matiere;
  let fixture: ComponentFixture<Matiere>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Matiere]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Matiere);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
