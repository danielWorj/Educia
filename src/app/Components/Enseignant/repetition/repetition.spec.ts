import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Repetition } from './repetition';

describe('Repetition', () => {
  let component: Repetition;
  let fixture: ComponentFixture<Repetition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Repetition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Repetition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
