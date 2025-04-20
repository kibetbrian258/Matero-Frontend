import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-security-tips',
  templateUrl: './security-tips.component.html',
  styleUrls: ['./security-tips.component.scss'],
  imports: [MatIconModule],
})
export class SecurityTipsComponent implements OnInit {
  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Security Tips - Secure Bank');
    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }
}
