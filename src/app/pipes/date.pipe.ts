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

        // Calculate the date 5 days ago from now.
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(now.getDate() - 5);
        fiveDaysAgo.setHours(0, 0, 0, 0); // Set to the beginning of that day for a clean comparison.

        const isLastFiveDays = callDate >= fiveDaysAgo;

        if (isLastFiveDays) {
            const time = callDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            const day = callDate.toLocaleDateString('en-GB', { weekday: 'short' });
            if (day === new Date().toLocaleDateString('en-GB', { weekday: 'short' })) {
                return time;
            }
            return `${time} ${day}`;
        } else if (isCurrentYear) {
            return callDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        } else {
            return callDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    }
}