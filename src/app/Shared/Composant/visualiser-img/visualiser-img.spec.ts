import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserImg } from './visualiser-img';

describe('VisualiserImg', () => {
  let component: VisualiserImg;
  let fixture: ComponentFixture<VisualiserImg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualiserImg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualiserImg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
