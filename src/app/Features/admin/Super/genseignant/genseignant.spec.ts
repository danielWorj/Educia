import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Genseignant } from './genseignant';

describe('Genseignant', () => {
  let component: Genseignant;
  let fixture: ComponentFixture<Genseignant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Genseignant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Genseignant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
