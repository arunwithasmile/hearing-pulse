import { Component, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClientService } from '../services/client.service';
import { Client } from '../services/types';
import { CommonModule } from '@angular/common';
import { Avatar } from '../components/avatar/avatar';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, Avatar],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class Clients {
  private clientService = inject(ClientService);
  protected clients: Signal<Client[] | undefined> = toSignal(this.clientService.getClients());
}
