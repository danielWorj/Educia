import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortailParent } from './portail-parent';

describe('PortailParent', () => {
  let component: PortailParent;
  let fixture: ComponentFixture<PortailParent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortailParent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortailParent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
