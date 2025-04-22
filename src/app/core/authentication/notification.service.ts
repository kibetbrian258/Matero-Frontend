import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: string; // 'success' | 'warning' | 'info' | 'alert'
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Subject to broadcast notifications to subscribers
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private currentDay = 0; // 0 = 1 notification, 1 = 2 notifications, 2 = 3 notifications
  private notificationId = 0;
  private timerRef: any;

  // Banking notification templates
  private notificationTemplates = [
    {
      type: 'success',
      templates: [
        {
          title: 'Deposit Successful',
          message: 'Your deposit of Ksh 5,000 has been processed successfully.',
        },
        {
          title: 'Transfer Completed',
          message: 'Your transfer of Ksh 2,500 to Account ****6789 was successful.',
        },
        {
          title: 'Bill Payment Successful',
          message: 'Your utility bill payment of Ksh 1,200 was processed.',
        },
      ],
    },
    {
      type: 'info',
      templates: [
        {
          title: 'Account Statement Ready',
          message: 'Your monthly account statement is now available for viewing.',
        },
        {
          title: 'Interest Credited',
          message: 'Interest of Ksh 320 has been credited to your savings account.',
        },
        {
          title: 'New Feature Available',
          message: 'You can now use our Quick Transfer feature for faster transactions.',
        },
      ],
    },
    {
      type: 'warning',
      templates: [
        {
          title: 'Low Balance Alert',
          message: 'Your account balance is below Ksh 1,000. Consider adding funds.',
        },
        {
          title: 'Upcoming Loan Payment',
          message: 'Your loan payment of Ksh 8,500 is due in 3 days.',
        },
        {
          title: 'Card Expiring Soon',
          message: 'Your debit card will expire at the end of this month.',
        },
      ],
    },
    {
      type: 'alert',
      templates: [
        {
          title: 'Unusual Transaction',
          message: 'We detected an unusual transaction on your account. Please verify.',
        },
        {
          title: 'Failed Login Attempt',
          message: 'There was a failed login attempt to your account. Please check.',
        },
        {
          title: 'Account Maintenance',
          message: 'System maintenance scheduled. Online banking may be unavailable tonight.',
        },
      ],
    },
  ];

  constructor() {
    // Load any saved notifications from localStorage
    this.loadNotifications();
  }

  startGeneratingNotifications(): void {
    // Check if we need to generate notifications today
    this.checkAndGenerateDailyNotifications();

    // Set up timer to check every hour (we could also just check on app load)
    this.timerRef = setInterval(() => {
      this.checkAndGenerateDailyNotifications();
    }, 3600000); // Check every hour
  }

  stopGeneratingNotifications(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
    }
  }

  private checkAndGenerateDailyNotifications(): void {
    const lastGenDate = localStorage.getItem('lastNotificationGenDate');
    const today = new Date().toDateString();

    // If we haven't generated notifications today
    if (lastGenDate !== today) {
      // Generate notifications based on the cycle day
      const notificationsToGenerate = this.currentDay + 1; // 1, 2, or 3

      for (let i = 0; i < notificationsToGenerate; i++) {
        this.generateRandomNotification();
      }

      // Update the cycle day for tomorrow
      this.currentDay = (this.currentDay + 1) % 3;

      // Save the date we generated notifications
      localStorage.setItem('lastNotificationGenDate', today);
      localStorage.setItem('currentNotificationDay', this.currentDay.toString());

      // Save the notifications
      this.saveNotifications();
    }
  }

  private generateRandomNotification(): void {
    // Pick a random notification type
    const typeIndex = Math.floor(Math.random() * this.notificationTemplates.length);
    const type = this.notificationTemplates[typeIndex];

    // Pick a random template for this type
    const templateIndex = Math.floor(Math.random() * type.templates.length);
    const template = type.templates[templateIndex];

    // Create a new notification
    const notification: Notification = {
      id: ++this.notificationId,
      type: type.type,
      title: template.title,
      message: template.message,
      timestamp: new Date(),
      read: false,
    };

    // Add to the current notifications
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }

  markAsRead(id: number): void {
    const notifications = this.notificationsSubject.getValue();
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );

    this.notificationsSubject.next(updatedNotifications);
    this.saveNotifications();
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.getValue();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));

    this.notificationsSubject.next(updatedNotifications);
    this.saveNotifications();
  }

  getNotificationById(id: number): Notification | undefined {
    return this.notificationsSubject.getValue().find(notification => notification.id === id);
  }

  private saveNotifications(): void {
    const notifications = this.notificationsSubject.getValue();
    localStorage.setItem('bankingNotifications', JSON.stringify(notifications));
    localStorage.setItem('notificationId', this.notificationId.toString());
  }

  private loadNotifications(): void {
    const savedNotifications = localStorage.getItem('bankingNotifications');
    const savedCurrentDay = localStorage.getItem('currentNotificationDay');
    const savedNotificationId = localStorage.getItem('notificationId');

    if (savedNotifications) {
      this.notificationsSubject.next(JSON.parse(savedNotifications));
    }

    if (savedCurrentDay) {
      this.currentDay = parseInt(savedCurrentDay, 10);
    }

    if (savedNotificationId) {
      this.notificationId = parseInt(savedNotificationId, 10);
    }
  }
}
