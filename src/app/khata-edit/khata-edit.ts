import { Component, inject, effect, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KhataService, Transaction } from '../services/khata.service';
import { Timestamp } from 'firebase/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { getLocalISOString } from '../utils';

@Component({
  selector: 'app-khata-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './khata-edit.html',
  styleUrl: './khata-edit.css'
})
export class KhataEdit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private khataService = inject(KhataService);

  protected transactionForm = this.fb.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['', Validators.required],
    transDate: ['', Validators.required]
  });

  protected transaction: Signal<Transaction | undefined>;

  constructor() {
    // Use the route params observable to get the transaction ID
    // and then fetch the transaction data from the service.
    const transactionId$ = this.route.paramMap.pipe(map(params => params.get('id')));
    this.transaction = toSignal(transactionId$.pipe(
      switchMap(id => {
        return this.khataService.getTransactionById(id);
      })
    ));

    // Effect to patch form when transaction data is loaded
    effect(() => {
      const currentTransaction = this.transaction();
      if (currentTransaction) {
        this.transactionForm.patchValue({
          title: currentTransaction.title,
          amount: currentTransaction.amount,
          type: currentTransaction.type,
          transDate: getLocalISOString(currentTransaction.transDate.toDate())
        });
      }
    });
  }

  isSaving = false;

  async onSubmit() {
    if (this.transactionForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const formValue = this.transactionForm.value;

    try {
      await this.khataService.updateTransaction({
        id: this.transaction()!.id,
        title: formValue.title!,
        amount: formValue.amount!,
        type: formValue.type as 'credit' | 'debit',
        transDate: Timestamp.fromDate(new Date(formValue.transDate!)),
      });
      this.router.navigate(['/khata']);
    } catch (error) {
      console.error('Error saving transaction:', error);
      // Optionally, show an error message to the user
    } finally {
      this.isSaving = false;
    }
  }
}
