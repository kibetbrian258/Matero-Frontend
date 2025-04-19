import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, tap, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService, SettingsService, User } from '@core';
import { ProfileService } from '@core/authentication/profile.service';
import { AppConstants } from '@core/constants/app-contants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebcamDialogComponent } from '@theme/sidebar/webcam-dialog/webcam-dialog.component';

@Component({
  selector: 'app-user',
  template: `
    <button mat-icon-button [matMenuTriggerFor]="menu">
      <div class="avatar-container">
        <img
          class="avatar"
          [src]="profileImage || user?.avatar || defaultAvatar"
          width="24"
          alt="avatar"
          (error)="handleAvatarError()"
        />
      </div>
    </button>

    <input
      #fileInput
      type="file"
      accept="image/*"
      (change)="onFileSelected($event)"
      style="display: none;"
    />

    <mat-menu #menu="matMenu">
      <button routerLink="/profile/overview" mat-menu-item>
        <mat-icon>account_circle</mat-icon>
        <span>{{ 'profile' | translate }}</span>
      </button>

      <button routerLink="/profile/settings" mat-menu-item>
        <mat-icon>edit</mat-icon>
        <span>{{ 'edit_profile' | translate }}</span>
      </button>

      <!-- Profile Picture Options -->
      <button mat-menu-item [matMenuTriggerFor]="pictureMenu">
        <mat-icon>portrait</mat-icon>
        <span>Change Profile Picture</span>
      </button>

      <button mat-menu-item (click)="restore()">
        <mat-icon>restore</mat-icon>
        <span>{{ 'restore_defaults' | translate }}</span>
      </button>

      <button mat-menu-item (click)="logout()">
        <mat-icon>exit_to_app</mat-icon>
        <span>{{ 'logout' | translate }}</span>
      </button>
    </mat-menu>

    <!-- Profile Picture Sub-Menu -->
    <mat-menu #pictureMenu="matMenu">
      <button mat-menu-item (click)="fileInput.click()">
        <mat-icon>add_photo_alternate</mat-icon>
        <span>Upload Picture</span>
      </button>

      <button mat-menu-item (click)="openWebcam()">
        <mat-icon>camera_alt</mat-icon>
        <span>Take Photo</span>
      </button>

      <button
        mat-menu-item
        (click)="removeProfileImage()"
        *ngIf="profileImage && profileImage !== defaultAvatar"
      >
        <mat-icon>delete</mat-icon>
        <span>Remove Picture</span>
      </button>
    </mat-menu>
  `,
  styles: `
    .avatar-container {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar {
      width: 90%;
      height: 90%;
      border-radius: 50%;
      object-fit: cover;
    }

    @media (max-width: 599px) {
      .avatar-container {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  `,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TranslateModule,
    CommonModule,
  ],
})
export class UserComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsService);
  private readonly profileService = inject(ProfileService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  user!: User;
  profileImage: string | null = null;
  defaultAvatar = AppConstants.Assets.DefaultAvatar;
  isUploading = false;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Load user data
    const userSub = this.auth
      .user()
      .pipe(
        tap(user => (this.user = user)),
        debounceTime(10)
      )
      .subscribe(() => this.cdr.detectChanges());

    this.subscriptions.push(userSub);

    // Subscribe to profile image changes
    const profileImageSub = this.profileService.profileImage$.subscribe(imageData => {
      this.profileImage = imageData;
      this.cdr.detectChanges();
    });

    this.subscriptions.push(profileImageSub);

    // Initial load of profile image
    this.loadProfileImage();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProfileImage(): void {
    this.profileService.refreshProfileImage();
  }

  handleAvatarError(): void {
    console.log('Avatar failed to load in header, using default');
    if (this.user) {
      this.user.avatar = this.defaultAvatar;
      this.cdr.detectChanges();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
        this.snackBar.open('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'Close', {
          duration: 5000,
        });
        return;
      }

      // Validate file size (5mb max)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size should not exceed 5MB', 'Close', {
          duration: 5000,
        });
        return;
      }

      this.uploadImage(file);
    }

    // Reset the input
    input.value = '';
  }

  uploadImage(file: File): void {
    this.isUploading = true;

    this.profileService.uploadProfileImage(file).subscribe({
      next: response => {
        if (response && response.imageData && response.imageData.length > 0) {
          // Update shared profile image state
          this.profileService.refreshProfileImage();

          this.snackBar.open('Profile image updated successfully', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open('Failed to update profile image', 'Close', {
            duration: 5000,
          });
        }
        this.isUploading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Upload error:', error);
        this.isUploading = false;
        this.snackBar.open('Failed to upload profile image', 'Close', {
          duration: 5000,
        });
        this.cdr.detectChanges();
      },
    });
  }

  openWebcam(): void {
    const dialogRef = this.dialog.open(WebcamDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // convert base64 string to file
        this.convertDataUrlToFile(result, 'webcam-capture.jpg')
          .then(file => this.uploadImage(file))
          .catch(error => {
            console.log('Error processing webcam image:', error);
            this.snackBar.open('Failed to process webcam image', 'Close', {
              duration: 5000,
            });
          });
      }
    });
  }

  async convertDataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  }

  removeProfileImage(): void {
    // Show loading feedback
    this.isUploading = true;
    this.snackBar.open('Removing profile image...', '', {
      duration: 1000,
    });

    this.profileService.deleteProfileImage().subscribe({
      next: response => {
        // Update the shared profile image state
        this.profileService.refreshProfileImage();

        this.snackBar.open('Profile image removed successfully', 'Close', {
          duration: 3000,
        });
        this.isUploading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error removing profile image:', error);
        this.snackBar.open('Failed to remove profile image', 'Close', {
          duration: 5000,
        });
        this.isUploading = false;
        this.cdr.detectChanges();
      },
    });
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/auth/login');
    });
  }

  restore() {
    this.settings.reset();
    window.location.reload();
  }
}
