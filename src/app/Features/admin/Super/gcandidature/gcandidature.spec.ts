import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gcandidature } from './gcandidature';

describe('Gcandidature', () => {
  let component: Gcandidature;
  let fixture: ComponentFixture<Gcandidature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gcandidature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gcandidature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
