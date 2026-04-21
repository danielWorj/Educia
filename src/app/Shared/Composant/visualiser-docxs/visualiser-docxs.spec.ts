import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserDocxs } from './visualiser-docxs';

describe('VisualiserDocxs', () => {
  let component: VisualiserDocxs;
  let fixture: ComponentFixture<VisualiserDocxs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualiserDocxs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualiserDocxs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
