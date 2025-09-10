import { Component, Input } from '@angular/core';

@Component({
    selector: 'asp-avatar',
    standalone: true,
    imports: [],
    templateUrl: './avatar.html',
    styleUrl: './avatar.css'
})

export class Avatar {
    @Input({ required: true }) name!: string;
    @Input() size: "sm" | "lg" | undefined;
    protected readonly bgColos = ['#76a2a2', '#b76a43ff', '#698fbc', '#a47665', '#73865d', '#8472a3'];

    get initials(): string {
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    get randomColor(): string {
        let hash = 0;
        for (let i = 0; i < this.name.length; i++) {
            hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % this.bgColos.length);
        return this.bgColos[index];
    }
}
