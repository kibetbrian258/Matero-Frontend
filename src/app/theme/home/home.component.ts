import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgFor } from '@angular/common';

interface Slide {
  imageUrl: string;
  alt?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [MatIconModule, NgClass, NgFor],
})
export class HomeComponent implements OnInit, OnDestroy {
  slides: Slide[] = [
    {
      imageUrl: 'assets/images/image1.jpg',
      alt: 'Modern banking interface',
    },
    {
      imageUrl: 'assets/images/image2.jpg',
      alt: 'Secure finance management',
    },
    {
      imageUrl: 'assets/images/image3.jpg',
      alt: 'Digital banking experience',
    },
  ];

  isLoggedIn = false;

  currentSlide = 0;
  slideshowInterval: any;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.startSlideshow();

    // Apply dark theme to body
    document.body.classList.add('dark-theme');
  }

  ngOnDestroy(): void {
    this.stopSlideshow();

    // Remove dark theme class when component is destroyed
    document.body.classList.remove('dark-theme');
  }

  startSlideshow(): void {
    this.slideshowInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopSlideshow(): void {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
