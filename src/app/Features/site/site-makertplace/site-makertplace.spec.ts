import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteMakertplace } from './site-makertplace';

describe('SiteMakertplace', () => {
  let component: SiteMakertplace;
  let fixture: ComponentFixture<SiteMakertplace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteMakertplace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteMakertplace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
