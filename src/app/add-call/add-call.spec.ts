import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCall } from './add-call';

describe('AddCall', () => {
  let component: AddCall;
  let fixture: ComponentFixture<AddCall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
