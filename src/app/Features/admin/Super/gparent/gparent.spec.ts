import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GParent } from './gparent';

describe('GParent', () => {
  let component: GParent;
  let fixture: ComponentFixture<GParent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GParent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GParent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
