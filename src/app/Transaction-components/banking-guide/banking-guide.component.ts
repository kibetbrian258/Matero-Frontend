import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-banking-guide',
  templateUrl: './banking-guide.component.html',
  styleUrls: ['./banking-guide.component.scss'],
  standalone: true,
  imports: [MatIconModule],
})
export class BankingGuideComponent implements OnInit {
  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Banking Guide - Secure Bank');
    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }
}
