import { Component, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CallService } from '../services/call.service';
import { ClientService } from '../services/client.service';
import { Client, Place } from '../services/types';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { Avatar } from "../components/avatar/avatar";
import { DocumentReference, Firestore, doc } from '@angular/fire/firestore';
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
  selectedPlace: Place | undefined;

  private callService = inject(CallService);
  private clientService = inject(ClientService);
  private firestore: Firestore = inject(Firestore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  public isSaving = signal(false);

  // Signals for autocomplete
  private clients: Signal<Client[] | undefined> = toSignal(this.clientService.getClients());
  private nameFilter: WritableSignal<string> = signal('');
  protected filteredClients: Signal<Client[]> = computed(() => {
    const clients = this.clients();
    const filter = this.nameFilter().toLowerCase();
    if (!clients || !filter) return [];
    return clients.filter(client => client.fullName.toLowerCase().includes(filter));
  });
  private places: Signal<any[] | undefined> = toSignal(this.clientService.getPlaces());
  private placeFilter: WritableSignal<string> = signal('');
  protected filteredPlaces: Signal<any[]> = computed(() => {
    const places = this.places();
    const filter = this.placeFilter().toLowerCase();
    if (!places || !filter) return [];
    return places.filter(place => place.name.toLowerCase().includes(filter));
  });

  constructor() {
    this.callForm = this.fb.group({
      clientRef: [''], // Will hold path string for existing client
      fullName: [''],
      phoneNumber: ['+91 '],
      place: [''], // For display and for creating a new place
      placeId: [null as string | null], // For storing the ID of a selected place
      callDateTime: [this.getCurrentLocalISOString(), Validators.required],
      callDuration: [''],
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

    this.callForm.get('place')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value === this.selectedPlace?.name) {
        return;
      }
      this.placeFilter.set(value || '');
      this.selectedPlace = undefined;
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

  async onSubmit() {
    if (this.callForm.valid) {
      this.isSaving.set(true);
      try {
        const formValue = this.callForm.value;
        let clientRef: DocumentReference;
        let placeRef: DocumentReference;

        if (this.selectedClient) {
          clientRef = doc(this.firestore, `clients/${this.selectedClient.id}`);
        } else {
          if (this.selectedPlace) {
            placeRef = doc(this.firestore, `places/${this.selectedPlace.id}`);
          } else {
            placeRef = await this.clientService.addPlace({ name: formValue.place });
          }

          // Create a new client
          const newClient = {
            fullName: formValue.fullName,
            phoneNumber: formValue.phoneNumber,
            place: placeRef,
          };
          clientRef = await this.clientService.addClient(newClient);
        }

        await this.callService.addCall({ ...formValue, clientRef });
        this.location.back();
      } catch (error) {
        console.error("Error saving call:", error);
        // Optionally show an error message to the user
      } finally {
        this.isSaving.set(false);
      }
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
    this.callForm.get('clientRef')?.reset('');
    this.selectedClient = undefined;

    // Re-apply validators for creating a new client
    this.setClientFieldsRequired(true);
  }

  selectPlace(place: any) {
    this.callForm.get('placeId')?.setValue(place.id);
    this.callForm.get('place')?.setValue(place.name);
    this.selectedPlace = place;
    this.placeFilter.set(''); // Hide autocomplete
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

  private getCurrentLocalISOString(): string {
    const now = new Date();
    // Adjust for the local timezone offset to get the correct local time for the input default
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    // The `datetime-local` input requires an ISO string without the 'Z' (which denotes UTC)
    // and without milliseconds.
    const isoString = localDate.toISOString();
    // Return the part before the milliseconds, e.g., "2024-01-01T12:30"
    return isoString.substring(0, isoString.lastIndexOf(':'));
  }
}