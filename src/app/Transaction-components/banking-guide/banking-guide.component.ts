import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banking-guide',
  templateUrl: './banking-guide.component.html',
  styleUrls: ['./banking-guide.component.scss'],
  standalone: true,
  imports: [MatIconModule, TranslatePipe, RouterLink],
})
export class BankingGuideComponent implements OnInit {
  constructor(
    private titleService: Title,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // Set title with translation
    this.translateService.get('banking_guide.page_title').subscribe(title => {
      this.titleService.setTitle(`${title} - Secure Bank`);
    });

    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }
}
