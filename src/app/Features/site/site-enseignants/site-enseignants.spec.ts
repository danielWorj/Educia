import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEnseignants } from './site-enseignants';

describe('SiteEnseignants', () => {
  let component: SiteEnseignants;
  let fixture: ComponentFixture<SiteEnseignants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteEnseignants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEnseignants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
