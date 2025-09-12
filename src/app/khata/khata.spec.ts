import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Khata } from './khata';

describe('Khata', () => {
  let component: Khata;
  let fixture: ComponentFixture<Khata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Khata]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Khata);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
