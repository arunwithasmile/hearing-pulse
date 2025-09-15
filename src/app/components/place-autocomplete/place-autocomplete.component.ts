import { Component, forwardRef, inject, Input, Signal, WritableSignal, computed, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Place } from '../../services/types';

@Component({
    selector: 'app-place-autocomplete',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './place-autocomplete.component.html',
    styleUrl: './place-autocomplete.component.css',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PlaceAutocompleteComponent),
            multi: true
        }
    ]
})
export class PlaceAutocompleteComponent implements ControlValueAccessor {
    @Input() placeholder: string = 'Place';

    private clientService = inject(ClientService);

    // Internal state for the input value
    protected value: WritableSignal<string> = signal('');

    // Autocomplete logic
    private places: Signal<Place[] | undefined> = toSignal(this.clientService.getPlaces());
    protected filteredPlaces: Signal<Place[]> = computed(() => {
        const places = this.places();
        const filter = this.value().toLowerCase();
        if (!places || !filter) return [];
        return places.filter(place => place.name.toLowerCase().includes(filter));
    });

    // ControlValueAccessor implementation
    onChange = (value: any) => { };
    onTouched = () => { };

    writeValue(value: any): void {
        this.value.set(value || '');
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.value.set(value);
        this.onChange(value);
    }

    selectPlace(place: Place) {
        this.value.set(place.name);
        this.onChange(place.name);
    }
}