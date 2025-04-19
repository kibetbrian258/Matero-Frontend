import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-webcam-dialog',
  imports: [MatIconModule],
  standalone: true,
  templateUrl: './webcam-dialog.component.html',
  styleUrl: './webcam-dialog.component.scss',
})
export class WebcamDialogComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  private dialogRef = inject(MatDialogRef<WebcamDialogComponent>);
  private destroy$ = new Subject<void>();

  capturedImage: string | null = null;
  cameraReady = false;
  errorMessage: string | null = null;
  stream: MediaStream | null = null;

  ngOnInit(): void {
    this.initCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCamera(): void {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.errorMessage = 'Camera access is not supported in your browser.';
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'user', // Use front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then(stream => {
        this.stream = stream;
        this.cameraReady = true;
        this.errorMessage = null;

        // Need to wait for ViewInit to access the video element
        setTimeout(() => {
          if (this.videoElement?.nativeElement) {
            this.videoElement.nativeElement.srcObject = stream;
          }
        });
      })
      .catch(error => {
        console.error('Camera error:', error);

        if (error.name === 'NotAllowedError') {
          this.errorMessage =
            'Camera access denied. Please allow camera access to take a profile picture.';
        } else if (error.name === 'NotFoundError') {
          this.errorMessage = 'No camera found. Please connect a camera to your device.';
        } else {
          this.errorMessage = 'Unable to access the camera. Please try again.';
        }
      });
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  capture(): void {
    if (!this.cameraReady || !this.videoElement || !this.canvasElement) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data as base64
    this.capturedImage = canvas.toDataURL('image/jpeg', 0.9);
  }

  retake(): void {
    this.capturedImage = null;
  }

  confirm(): void {
    this.dialogRef.close(this.capturedImage);
  }

  close(): void {
    this.dialogRef.close();
  }
}
