import { Component, inject, OnInit } from '@angular/core';
import { ChildrenOutletContexts, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FooterComponent } from './shared/components/footer/footer.component';
import { routeFadeAnimation } from './route-animations';

declare global {
  interface Window {
    vtTrackPageView?: (url: string, title: string) => void;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeFadeAnimation],
})
export class App implements OnInit {
  private router = inject(Router);
  private contexts = inject(ChildrenOutletContexts);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        window.vtTrackPageView?.(event.urlAfterRedirects, document.title);
      });
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.url;
  }
}
