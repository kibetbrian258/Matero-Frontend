import { Component, OnInit, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { NotificationService } from '@core/authentication/notification.service';
import { NgClass, DatePipe, CommonModule } from '@angular/common';

export interface Notification {
  id: number;
  type: string; // 'success' | 'warning' | 'info' | 'alert'
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    <button mat-icon-button [matMenuTriggerFor]="menu">
      <mat-icon
        [matBadge]="unreadCount"
        [matBadgeHidden]="unreadCount === 0"
        matBadgeColor="warn"
        aria-hidden="false"
      >
        notifications
      </mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <div class="notification-header" *ngIf="notifications.length > 0">
        <span>Notifications</span>
        <button mat-button color="primary" (click)="markAllAsRead()">Mark all as read</button>
      </div>
      <div class="empty-notifications" *ngIf="notifications.length === 0">
        <mat-icon>notifications_off</mat-icon>
        <span>No new notifications</span>
      </div>
      <mat-nav-list>
        @for (notification of notifications; track notification.id) {
          <mat-list-item (click)="viewNotificationDetails(notification)">
            <mat-icon
              class="m-x-16"
              matListItemIcon
              [ngClass]="{
                'success-icon': notification.type === 'success',
                'warning-icon': notification.type === 'warning',
                'info-icon': notification.type === 'info',
                'alert-icon': notification.type === 'alert',
              }"
            >
              {{ getIconForType(notification.type) }}
            </mat-icon>
            <div matListItemTitle>{{ notification.title }}</div>
            <div matListItemLine>{{ notification.timestamp | date: 'medium' }}</div>
          </mat-list-item>
        }
      </mat-nav-list>
    </mat-menu>
  `,
  styles: `
    :host ::ng-deep .mat-badge-content {
      --mat-badge-background-color: #ef0000;
      --mat-badge-text-color: #fff;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .empty-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      color: rgba(255, 255, 255, 0.6);
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
  `,
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    NgClass,
    DatePipe,
    CommonModule,
  ],
})
export class NotificationComponent implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    // Subscribe to notifications from the service
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;

      this.unreadCount = notifications.filter(n => !n.read).length;
    });

    // Start generating notifications
    this.notificationService.startGeneratingNotifications();
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

  viewNotificationDetails(notification: Notification): void {
    // Mark this notification as read
    this.notificationService.markAsRead(notification.id);

    // Navigate to the notification details page
    this.router.navigate(['/notifications', notification.id]);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
