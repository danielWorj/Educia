import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteTarifs } from './site-tarifs';

describe('SiteTarifs', () => {
  let component: SiteTarifs;
  let fixture: ComponentFixture<SiteTarifs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteTarifs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteTarifs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
