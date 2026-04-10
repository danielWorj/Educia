import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Enfants } from './enfants';

describe('Enfants', () => {
  let component: Enfants;
  let fixture: ComponentFixture<Enfants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Enfants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Enfants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
