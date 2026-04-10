import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPlace } from './market-place';

describe('MarketPlace', () => {
  let component: MarketPlace;
  let fixture: ComponentFixture<MarketPlace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketPlace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketPlace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
