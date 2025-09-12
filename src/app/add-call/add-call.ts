import { Component, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CallService, Client } from '../home/call.service';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { Avatar } from "../components/avatar";
import { DocumentReference } from 'firebase/firestore/lite';
import { Tag } from "../components/tag/tag";

@Component({
  selector: 'app-add-call',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, Avatar, Tag],
  templateUrl: './add-call.html',
  styleUrl: './add-call.css'
})
export class AddCallComponent implements OnInit {
  callForm: FormGroup;
  selectedClient: Client | undefined;

  private callService = inject(CallService);
  private fb = inject(FormBuilder);

  // Signals for autocomplete
  private clients: Signal<Client[] | undefined> = toSignal(this.callService.getClients());
  private nameFilter: WritableSignal<string> = signal('');
  protected filteredClients: Signal<Client[]> = computed(() => {
    const clients = this.clients();
    const filter = this.nameFilter().toLowerCase();
    if (!clients || !filter) return [];
    return clients.filter(client => client.fullName.toLowerCase().includes(filter));
  });

  constructor() {
    this.callForm = this.fb.group({
      clientRef: DocumentReference,
      fullName: [''], // Validators will be set dynamically
      phoneNumber: ['+91 '],
      place: [''],
      summary: ['', Validators.required],
      wasSuccessful: [true],
      followUpDateTime: ['']
    });
  }

  ngOnInit() {
    // By default, when no client is selected, these fields are required.
    this.setClientFieldsRequired(true);

    // Update the nameFilter signal when the user types in the fullName field
    this.callForm.get('fullName')?.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(value => {
      // Only show client suggestions if no client is selected
      if (this.selectedClient) {
        this.nameFilter.set('');
      } else {
        this.nameFilter.set(value || '');
      }
    });

    // Add or remove 'required' validator for followUpDateTime based on wasSuccessful
    this.callForm.get('wasSuccessful')?.valueChanges.subscribe(isSuccessful => {
      const followUpControl = this.callForm.get('followUpDateTime');
      if (isSuccessful === false) {
        followUpControl?.setValidators(Validators.required);
      } else {
        followUpControl?.clearValidators();
        followUpControl?.setValue(''); // Clear the value if it's not required
      }
      // Important: update the validity of the control after changing validators
      followUpControl?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.callForm.valid) {
      console.log(this.callForm.value);
    }
  }

  selectClient(client: Client) {
    this.callForm.patchValue({
      clientRef: `clients/${client.id}`
    });
    this.selectedClient = client;
    this.nameFilter.set(''); // Hide the autocomplete list

    // Make client fields optional
    this.setClientFieldsRequired(false);
  }

  unselectClient() {
    this.selectedClient = undefined;

    // Re-apply validators for creating a new client
    this.setClientFieldsRequired(true);
  }

  private setClientFieldsRequired(isRequired: boolean) {
    const fields = ['fullName', 'phoneNumber', 'place'];
    const validator = isRequired ? Validators.required : null;

    for (const fieldName of fields) {
      const control = this.callForm.get(fieldName);
      control?.setValidators(validator);
      control?.updateValueAndValidity();
    }
  }
}