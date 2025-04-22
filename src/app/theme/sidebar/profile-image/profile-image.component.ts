import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '@core/authentication/profile.service';
import { WebcamDialogComponent } from '../webcam-dialog/webcam-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { AppConstants } from '@core/constants/app-contants';

@Component({
  selector: 'app-profile-image',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './profile-image.component.html',
  styleUrl: './profile-image.component.scss',
})
export class ProfileImageComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  profileImage = '';
  defaultImage = AppConstants.Assets.DefaultAvatar;
  isUploading = false;

  ngOnInit(): void {
    this.loadProfileImage();
  }

  loadProfileImage(): void {
    this.profileService.getProfileImage().subscribe({
      next: response => {
        // Only set the profile image if there's actual data
        if (response && response.imageData && response.imageData.length > 0) {
          this.profileImage = response.imageData;
        } else {
          this.profileImage = this.defaultImage;
        }
      },
      error: error => {
        console.error('Failed to load profile image:', error);
        this.profileImage = this.defaultImage;
      },
    });
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
          this.profileImage = response.imageData;
          this.snackBar.open('Profile image updated successfully', 'Close', {
            duration: 3000,
          });
          // Update the shared profile image state
          this.profileService.refreshProfileImage();
        } else {
          this.profileImage = this.defaultImage;
          this.snackBar.open('Failed to update profile image', 'Close', {
            duration: 5000,
          });
        }
        this.isUploading = false;
      },
      error: error => {
        console.error('Upload error:', error);
        this.isUploading = false;
        this.profileImage = this.defaultImage;
        this.snackBar.open('Failed to upload profile image', 'Close', {
          duration: 5000,
        });
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

  removeImage(): void {
    // Show loading state while deleting
    this.isUploading = true;

    // Call the API endpoint to remove the image
    this.profileService.deleteProfileImage().subscribe({
      next: response => {
        this.profileImage = this.defaultImage;
        this.snackBar.open('Profile image removed successfully', 'Close', {
          duration: 3000,
        });

        // Update the shared profile image state
        this.profileService.refreshProfileImage();
        this.isUploading = false;
      },
      error: error => {
        console.error('Error removing profile image:', error);
        this.snackBar.open('Failed to remove profile image', 'Close', {
          duration: 5000,
        });
        this.isUploading = false;
      },
    });
  }
}
