import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security-tips',
  templateUrl: './security-tips.component.html',
  styleUrls: ['./security-tips.component.scss'],
  standalone: true,
  imports: [MatIconModule, TranslatePipe, RouterLink, CommonModule],
})
export class SecurityTipsComponent implements OnInit {
  constructor(
    private titleService: Title,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // Set title with translation
    this.translateService.get('security_tips.page_title').subscribe(title => {
      this.titleService.setTitle(`${title} - Secure Bank`);
    });

    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }
}
