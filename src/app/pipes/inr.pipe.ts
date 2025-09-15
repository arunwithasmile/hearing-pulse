import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
    name: 'inr',
    standalone: true,
})
export class InrPipe implements PipeTransform {
    private currencyPipe = new CurrencyPipe('en-IN');

    transform(value: number | string | null | undefined): string | null {
        if (value == null) {
            return null;
        }
        return this.currencyPipe.transform(value, 'INR', 'symbol', '1.0-0');
    }
}