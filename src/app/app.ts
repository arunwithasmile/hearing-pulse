import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showHeader = signal(true);

  private meta: Meta = inject(Meta);
  private router = inject(Router);

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showHeader.set(event.urlAfterRedirects !== '/login');
    });

    // Read the CSS variable value from the root element's computed styles
    const themeColor = getComputedStyle(document.body).getPropertyValue('--clr-primary').trim();

    this.meta.updateTag({
      name: 'theme-color',
      content: themeColor
    });
  }
}
