import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Assistantia } from './assistantia';

describe('Assistantia', () => {
  let component: Assistantia;
  let fixture: ComponentFixture<Assistantia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assistantia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Assistantia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
