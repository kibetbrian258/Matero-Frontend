import { Component, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '@core/authentication';
import { ProfileService } from '@core/authentication/profile.service';
import { AppConstants } from '@core/constants/app-contants';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-panel',
  template: `
    <div class="matero-user-panel" routerLink="/profile">
      <div class="avatar-container">
        @if (profileImage) {
          <img class="user-avatar" [src]="profileImage" alt="avatar" (error)="handleImageError()" />
        } @else {
          <img
            class="user-avatar"
            [src]="user?.avatar || defaultAvatar"
            alt="avatar"
            (error)="handleAvatarError()"
          />
        }

        <div class="avatar-badge" matTooltip="Online">
          <span class="online-indicator"></span>
        </div>
      </div>

      <div class="user-info">
        <h4 class="user-name">{{ user?.name || 'User' }}</h4>
        <p class="user-email">{{ user?.email || 'loading...' }}</p>
      </div>
    </div>
  `,
  styleUrl: './user-panel.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
})
export class UserPanelComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  user: User | null = null;
  profileImage: string | null = null;
  defaultAvatar = AppConstants.Assets.DefaultAvatar;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Load user data
    const userSub = this.authService.user().subscribe({
      next: user => {
        this.user = user;
      },
      error: error => {
        console.error('Error loading user data:', error);
      },
    });

    this.subscriptions.push(userSub);

    // Subscribe to profile image changes
    const profileImageSub = this.profileService.profileImage$.subscribe(imageData => {
      this.profileImage = imageData;
    });

    this.subscriptions.push(profileImageSub);

    // Initial load of profile image
    this.profileService.refreshProfileImage();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  handleImageError(): void {
    console.log('Profile image failed to display, fallback to default');
    this.profileImage = null;
  }

  handleAvatarError(): void {
    console.log('Avatar failed to load, setting absolute fallback');
    // If user avatar also fails, set to a guaranteed existing fallback
    if (this.user) {
      this.user.avatar = this.defaultAvatar;
    }
  }
}
