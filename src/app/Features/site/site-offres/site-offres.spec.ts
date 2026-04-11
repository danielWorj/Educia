import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteOffres } from './site-offres';

describe('SiteOffres', () => {
  let component: SiteOffres;
  let fixture: ComponentFixture<SiteOffres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteOffres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteOffres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
