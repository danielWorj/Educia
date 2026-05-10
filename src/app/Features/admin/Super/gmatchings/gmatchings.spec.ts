import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gmatchings } from './gmatchings';

describe('Gmatchings', () => {
  let component: Gmatchings;
  let fixture: ComponentFixture<Gmatchings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gmatchings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gmatchings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
