import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortailCandidature } from './portail-candidature';

describe('PortailCandidature', () => {
  let component: PortailCandidature;
  let fixture: ComponentFixture<PortailCandidature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortailCandidature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortailCandidature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
