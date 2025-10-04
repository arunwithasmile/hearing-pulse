import { Component, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KhataService, Transaction } from '../services/khata.service';
import { DatePipe } from '../pipes/date.pipe';
import { InrPipe } from '../pipes/inr.pipe';
import { BehaviorSubject, switchMap } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-khata',
  imports: [DatePipe, RouterLink, InrPipe, FontAwesomeModule],
  templateUrl: './khata.html',
  styleUrl: './khata.css',
  standalone: true,
})

export class Khata {
  private khataService = inject(KhataService);
  readonly transactions: Signal<Transaction[]>;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;

  private currentDate$ = new BehaviorSubject<Date>(new Date());
  private currentDate = toSignal(this.currentDate$, { initialValue: new Date() });

  income = computed(() => this.transactions()?.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0) ?? 0);
  expenses = computed(() => this.transactions()?.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0) ?? 0);
  total = computed(() => this.income() - this.expenses());

  monthName = computed(() => {
    const now = new Date();
    const currentDate = this.currentDate();
    if (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth()) {
      return 'Month';
    }
    return currentDate.toLocaleString('default', { month: 'long' });
  });

  constructor() {
    this.transactions = toSignal(
      this.currentDate$.pipe(
        switchMap(date => {
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          lastDay.setHours(23, 59, 59, 999); // Ensure we include the entire last day
          return this.khataService.getTransactions(firstDay, lastDay);
        })
      ),
      { initialValue: [] }
    );
  }

  prevMonth() {
    const currentDate = this.currentDate$.value;
    this.currentDate$.next(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  nextMonth() {
    const currentDate = this.currentDate$.value;
    this.currentDate$.next(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }
}
