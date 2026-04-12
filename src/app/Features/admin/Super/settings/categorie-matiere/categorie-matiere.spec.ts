import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieMatiereComponent } from './categorie-matiere';

describe('CategorieMatiereComponent', () => {
  let component: CategorieMatiereComponent;
  let fixture: ComponentFixture<CategorieMatiereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorieMatiereComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorieMatiereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
