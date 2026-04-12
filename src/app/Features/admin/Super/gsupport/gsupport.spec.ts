import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GSupport } from './gsupport';

describe('GSupport', () => {
  let component: GSupport;
  let fixture: ComponentFixture<GSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GSupport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GSupport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
