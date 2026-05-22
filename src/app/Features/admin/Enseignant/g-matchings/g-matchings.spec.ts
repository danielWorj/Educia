import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GMatchings } from './g-matchings';

describe('GMatchings', () => {
  let component: GMatchings;
  let fixture: ComponentFixture<GMatchings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GMatchings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GMatchings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
