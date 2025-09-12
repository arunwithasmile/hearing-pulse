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
      const isLogin = event.urlAfterRedirects === '/login';
      this.showHeader.set(!isLogin);
      document.body.style.setProperty('--bg', isLogin ? 'var(--login-bg)' : 'var(--app-bg)');
    });

    // Read the CSS variable value from the root element's computed styles
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--clr-primary-200').trim();

    this.meta.updateTag({
      name: 'theme-color',
      content: themeColor
    });
  }
}
