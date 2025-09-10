import { Component, Signal, inject } from '@angular/core';
import { Avatar } from '../components/avatar';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Call, CallService } from './call.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [Avatar, DatePipe, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private callService = inject(CallService);
  protected readonly calls: Signal<Call[] | undefined>;

  constructor() {
    this.calls = toSignal(this.callService.getCalls());
  }
}
