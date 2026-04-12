import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GOffre } from './goffre';

describe('GOffre', () => {
  let component: GOffre;
  let fixture: ComponentFixture<GOffre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GOffre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GOffre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
