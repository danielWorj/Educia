import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GDashboard } from './gdashboard';

describe('GDashboard', () => {
  let component: GDashboard;
  let fixture: ComponentFixture<GDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
