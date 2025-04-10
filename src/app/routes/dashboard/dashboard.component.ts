import { ChangeDetectionStrategy, Component, OnInit, inject, OnDestroy } from '@angular/core';
import { PageHeaderComponent } from '@shared';
import { RemoveMenuPrefixPipe } from '@shared/components/Prefix-removal/remove-menu-prefix.pipe';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from '@core';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [PageHeaderComponent, RemoveMenuPrefixPipe],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly menu = inject(MenuService);
  private subscriptions = new Subscription();

  // Add page title to be passed to the page header
  pageTitle = 'Dashboard';
  
  ngOnInit() {
    // Listen to route changes to update the page title
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.updatePageTitle();
        })
    );
    
    // Listen to active menu item changes
    this.subscriptions.add(
      this.menu.getActiveMenuItem().subscribe(menuName => {
        if (menuName) {
          this.pageTitle = menuName;
        }
      })
    );
      
    // Set initial page title
    this.updatePageTitle();
  }
  
  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }
  
  private updatePageTitle() {
    const routes = this.router.url.slice(1).split('/');
    const menuLevel = this.menu.getLevel(routes);
    
    // Update the page title based on the current route
    if (menuLevel && menuLevel.length > 0) {
      this.pageTitle = menuLevel[menuLevel.length - 1];
    } else {
      this.pageTitle = 'Dashboard';
    }
  }
}