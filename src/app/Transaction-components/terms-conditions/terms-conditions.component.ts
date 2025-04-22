import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  standalone: true,
  imports: [MatIconModule, TranslatePipe, RouterLink, CommonModule],
})
export class TermsConditionsComponent implements OnInit {
  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    // Set title with translation
    this.translateService.get('terms.page_title').subscribe(title => {
      this.titleService.setTitle(`${title} - Secure Bank`);
    });

    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }

  /**
   * Helper method to get lists of translated items
   * Used for rendering arrays from translation files
   */
  getRequirementsList(key: string): string[] {
    const result = this.translateService.instant(key);
    if (Array.isArray(result)) {
      return result;
    }
    // Return empty array as fallback if translation is missing or not an array
    return [];
  }

  /**
   * Scroll to a specific section on the page
   */

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();

    // Use Viewport Scroller for scrolling to the element
    this.viewportScroller.scrollToAnchor(sectionId);

    // Alt approach if ViewportScrollr doesn't work properly
    // SetTimeout used to ensure the DOM has updated

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Add smooth scrolling behaviour
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
}
