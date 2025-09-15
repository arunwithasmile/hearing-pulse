import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
    name: 'date',
    standalone: true,
})
export class DatePipe implements PipeTransform {
    transform(value: Timestamp | undefined): string {
        if (!value) {
            return '';
        }

        const callDate = value.toDate();
        const now = new Date();

        const isCurrentYear = callDate.getFullYear() === now.getFullYear();

        const isToday = isCurrentYear &&
            callDate.getMonth() === now.getMonth() &&
            callDate.getDate() === now.getDate();

        if (isToday) {
            return callDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (isCurrentYear) {
            return callDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        } else {
            return callDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    }
}