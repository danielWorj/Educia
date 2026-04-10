import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Enfant } from './enfant';

describe('Enfant', () => {
  let component: Enfant;
  let fixture: ComponentFixture<Enfant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Enfant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Enfant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
