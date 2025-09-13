import { Component, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Avatar } from '../components/avatar/avatar';
import { CallService } from '../services/call.service';

@Component({
  selector: 'app-home',
  imports: [Avatar, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private callService = inject(CallService);
  protected readonly clients: Signal<any[] | undefined>;

  constructor() {
    this.clients = toSignal(this.callService.getCalls());
  }
}
