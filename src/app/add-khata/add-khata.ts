import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KhataService } from '../khata/khata.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
    selector: 'app-add-khata',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './add-khata.html',
    styleUrl: './add-khata.css'
})
export class AddKhataComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private khataService = inject(KhataService);

    transactionForm = this.fb.group({
        title: ['', Validators.required],
        amount: [null, [Validators.required, Validators.min(0.01)]],
        type: ['credit', Validators.required],
        transDate: [new Date().toISOString().substring(0, 16), Validators.required]
    });

    isSaving = false;

    async onSubmit() {
        if (this.transactionForm.invalid || this.isSaving) {
            return;
        }

        this.isSaving = true;
        const formValue = this.transactionForm.value;

        try {
            await this.khataService.addTransaction({
                title: formValue.title!,
                amount: formValue.amount!,
                type: formValue.type as 'credit' | 'debit',
                transDate: Timestamp.fromDate(new Date(formValue.transDate!)),
            });
            this.router.navigate(['/khata']);
        } catch (error) {
            console.error('Error adding transaction:', error);
            // Optionally, show an error message to the user
        } finally {
            this.isSaving = false;
        }
    }
}