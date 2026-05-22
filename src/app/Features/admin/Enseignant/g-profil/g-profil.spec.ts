import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GProfil } from './g-profil';

describe('GProfil', () => {
  let component: GProfil;
  let fixture: ComponentFixture<GProfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GProfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GProfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
