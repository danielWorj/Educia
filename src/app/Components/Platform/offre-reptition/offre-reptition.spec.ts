import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffreReptition } from './offre-reptition';

describe('OffreReptition', () => {
  let component: OffreReptition;
  let fixture: ComponentFixture<OffreReptition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffreReptition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffreReptition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
