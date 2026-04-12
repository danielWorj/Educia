import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GConfiguration } from './gconfiguration';

describe('GConfiguration', () => {
  let component: GConfiguration;
  let fixture: ComponentFixture<GConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GConfiguration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GConfiguration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
