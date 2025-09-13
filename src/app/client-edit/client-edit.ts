import { Component, Signal, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../services/client.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Client } from '../services/types';
import { CommonModule } from '@angular/common';
import { map, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Avatar } from "../components/avatar/avatar";
import { PlaceAutocompleteComponent } from './place-autocomplete.component';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Avatar, PlaceAutocompleteComponent],
  templateUrl: './client-edit.html',
  styleUrl: './client-edit.css'
})
export class ClientEdit {
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);

  private fb = inject(FormBuilder);
  private location = inject(Location);

  protected editForm: FormGroup;
  protected isSaving = signal(false);

  // A signal to hold the client data
  protected client: Signal<Client | undefined>;
  private clientId: string | null = null;

  constructor() {
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      place: ['', Validators.required]
    });

    // Use the route params observable to get the client ID
    // and then fetch the client data from the service.
    const clientId$ = this.route.paramMap.pipe(map(params => params.get('id')));
    this.client = toSignal(clientId$.pipe(
      switchMap(id => {
        this.clientId = id;
        return this.clientService.getClientById(id!);
      })
    ));

    // Effect to patch form when client data is loaded
    effect(() => {
      const currentClient = this.client();
      if (currentClient) {
        this.editForm.patchValue(currentClient);
      }
    });
  }

  async onSubmit() {
    if (this.editForm.invalid || !this.clientId) return;

    this.isSaving.set(true);
    try {
      await this.clientService.updateClient(this.clientId, this.editForm.value);
      this.location.back();
    } catch (error) {
      console.error("Failed to update client:", error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
