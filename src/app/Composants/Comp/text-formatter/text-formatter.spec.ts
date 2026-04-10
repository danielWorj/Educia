import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextFormatter } from './text-formatter';

describe('TextFormatter', () => {
  let component: TextFormatter;
  let fixture: ComponentFixture<TextFormatter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextFormatter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextFormatter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
