import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-call',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './add-call.html',
  styleUrl: './add-call.css'
})
export class AddCallComponent implements OnInit {
  callForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.callForm = this.fb.group({
      fullName: ['', Validators.required],
      number: ['+91 ', Validators.required],
      place: ['', Validators.required],
      summary: ['', Validators.required],
      wasSuccessful: [true, Validators.required],
      followUpDateTime: ['']
    });
  }

  ngOnInit() {
    this.callForm.get('wasSuccessful')?.valueChanges.subscribe(isSuccessful => {
      const followUpControl = this.callForm.get('followUpDateTime');
      isSuccessful ? followUpControl?.disable() : followUpControl?.enable();
      followUpControl?.setValue('');
    });
  }

  onSubmit() {
    if (this.callForm.valid) {
      console.log(this.callForm.value);
    }
  }
}