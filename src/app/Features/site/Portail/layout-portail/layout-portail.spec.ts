import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutPortail } from './layout-portail';

describe('LayoutPortail', () => {
  let component: LayoutPortail;
  let fixture: ComponentFixture<LayoutPortail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutPortail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutPortail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
