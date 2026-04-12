import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GRevenus } from './grevenus';

describe('GRevenus', () => {
  let component: GRevenus;
  let fixture: ComponentFixture<GRevenus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GRevenus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GRevenus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
