import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GCandidature } from './g-candidature';

describe('GCandidature', () => {
  let component: GCandidature;
  let fixture: ComponentFixture<GCandidature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GCandidature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GCandidature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
