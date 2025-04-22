import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@core/authentication/notification.service';

export interface Notification {
  id: number;
  type: string; // 'success' | 'warning' | 'info' | 'alert'
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  template: `
    <div class="notification-detail-container" *ngIf="notification; else notFound">
      <mat-card class="notification-card" [ngClass]="notification.type + '-border'">
        <mat-card-header>
          <mat-icon mat-card-avatar [ngClass]="notification.type + '-icon'">
            {{ getIconForType(notification.type) }}
          </mat-icon>
          <mat-card-title>{{ notification.title }}</mat-card-title>
          <mat-card-subtitle>{{ notification.timestamp | date: 'medium' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="notification-message">{{ notification.message }}</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            {{ 'close' | translate }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <ng-template #notFound>
      <div class="not-found">
        <mat-icon class="not-found-icon">search_off</mat-icon>
        <h2>{{ 'notification_not_found' | translate }}</h2>
        <button mat-raised-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          {{ 'close' | translate }}
        </button>
      </div>
    </ng-template>
  `,
  styles: `
    .notification-detail-container {
      max-width: 600px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .notification-card {
      border-left: 4px solid transparent;
      box-shadow:
        0 3px 6px rgba(0, 0, 0, 0.16),
        0 3px 6px rgba(0, 0, 0, 0.23);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .notification-card:hover {
      box-shadow:
        0 10px 20px rgba(0, 0, 0, 0.19),
        0 6px 6px rgba(0, 0, 0, 0.23);
    }

    .success-border {
      border-left-color: #4caf50;
    }

    .warning-border {
      border-left-color: #ff9800;
    }

    .info-border {
      border-left-color: #2196f3;
    }

    .alert-border {
      border-left-color: #f44336;
    }

    .success-icon {
      color: #4caf50;
    }

    .warning-icon {
      color: #ff9800;
    }

    .info-icon {
      color: #2196f3;
    }

    .alert-icon {
      color: #f44336;
    }

    .notification-message {
      margin: 16px 0;
      line-height: 1.6;
      white-space: pre-line;
    }

    .not-found {
      text-align: center;
      padding: 64px 24px;
      margin: 24px auto;
      max-width: 400px;
      background-color: #f5f5f5;
      border-radius: 8px;
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.12),
        0 1px 2px rgba(0, 0, 0, 0.24);
    }

    .not-found-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #9e9e9e;
      margin-bottom: 16px;
    }

    .not-found h2 {
      margin-bottom: 24px;
      color: #616161;
    }
  `,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    DatePipe,
    NgIf,
    NgClass,
    TranslateModule,
  ],
})
export class NotificationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  notification: Notification | undefined;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id']; // Convert to number
      this.notification = this.notificationService.getNotificationById(id);
    });
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'alert':
        return 'error';
      default:
        return 'notifications';
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
