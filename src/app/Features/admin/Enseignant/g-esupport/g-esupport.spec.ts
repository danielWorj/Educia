import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GEsupport } from './g-esupport';

describe('GEsupport', () => {
  let component: GEsupport;
  let fixture: ComponentFixture<GEsupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GEsupport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GEsupport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
