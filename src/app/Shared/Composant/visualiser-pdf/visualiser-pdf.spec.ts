import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserPdf } from './visualiser-pdf';

describe('VisualiserPdf', () => {
  let component: VisualiserPdf;
  let fixture: ComponentFixture<VisualiserPdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualiserPdf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualiserPdf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
