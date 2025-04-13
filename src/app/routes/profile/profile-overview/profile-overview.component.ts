import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { AccountResponse, AccountService } from '@core/authentication/account.service';
import { AuthService, CustomerProfile } from '@core';

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    AsyncPipe,
    TranslateModule,
  ],
})
export class ProfileOverviewComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly accountService = inject(AccountService);

  loading = true;
  error = false;
  currentProfile?: CustomerProfile;

  profileData$!: Observable<{
    profile: CustomerProfile;
    accounts: AccountResponse[];
  }>;

  ngOnInit(): void {
    // Fetch both profile and accounts
    this.profileData$ = this.authService.getCustomerProfile().pipe(
      switchMap(profile => {
        this.currentProfile = profile;
        return this.accountService.getAccounts().pipe(map(accounts => ({ profile, accounts })));
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Error loading profile data', error);
        this.error = true;
        this.loading = false;
        return of({ profile: {} as CustomerProfile, accounts: [] });
      })
    );

    // Set loading to false when data is loaded
    this.profileData$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  // Helper method to format dates
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}