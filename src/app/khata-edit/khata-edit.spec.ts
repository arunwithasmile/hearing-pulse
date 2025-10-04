import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhataEdit } from './khata-edit';

describe('KhataEdit', () => {
  let component: KhataEdit;
  let fixture: ComponentFixture<KhataEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KhataEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KhataEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
