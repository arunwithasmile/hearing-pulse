import { CurrencyPipe } from '@angular/common';
import { Component, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KhataService, Transaction } from './khata.service';
import { DatePipe } from '../pipes/date.pipe';

@Component({
  selector: 'app-khata',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './khata.html',
  styleUrl: './khata.css',
  standalone: true,
})

export class Khata {
  private khataService = inject(KhataService);
  readonly transactions: Signal<Transaction[]>;

  income = computed(() => this.transactions()?.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0) ?? 0);
  expenses = computed(() => this.transactions()?.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0) ?? 0);
  total = computed(() => this.income() - this.expenses());

  constructor() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999); // Ensure we include the entire last day

    this.transactions = toSignal(this.khataService.getTransactions(firstDay, lastDay), { initialValue: [] });
  }
}
