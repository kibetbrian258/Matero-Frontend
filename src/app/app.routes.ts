import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { AdminLayoutComponent } from '@theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '@theme/auth-layout/auth-layout.component';
import { DashboardComponent } from './routes/dashboard/dashboard.component';
import { Error403Component } from './routes/sessions/403.component';
import { Error404Component } from './routes/sessions/404.component';
import { Error500Component } from './routes/sessions/500.component';
import { LoginComponent } from './routes/sessions/login/login.component';
import { RegisterComponent } from './routes/sessions/register/register.component';
import { AccountInformationComponent } from './Transaction-components/account-information/account-information.component';
import { HelpSupportComponent } from './Transaction-components/help-support/help-support.component';
import { DepositComponent } from './Transaction-components/deposit/deposit.component';
import { WithdrawComponent } from './Transaction-components/withdraw/withdraw.component';
import { TransferComponent } from './Transaction-components/transfer/transfer.component';
import { TransactionHistoryComponent } from './Transaction-components/transaction-history/transaction-history.component';
import { BankingGuideComponent } from './Transaction-components/banking-guide/banking-guide.component';
import { TermsConditionsComponent } from './Transaction-components/terms-conditions/terms-conditions.component';
import { SecurityTipsComponent } from './Transaction-components/security-tips/security-tips.component';
import { ProfileOverviewComponent } from './routes/profile/profile-overview/profile-overview.component';
import { ProfileSettingsComponent } from './routes/profile/profile-settings/profile-settings.component';
import { ProfileImageComponent } from '@theme/sidebar/profile-image/profile-image.component';
import { NotificationDetailComponent } from '@theme/widgets/notification-detail/notification-detail.component';
import { TermsAccessGuard } from '@core/authentication/terms-access.guard';
import { HomeComponent } from '@theme/home/home.component';

export const routes: Routes = [
  // This empty path redirect should be FIRST to ensure it takes precedence
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public routes
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home', titleI18n: 'Home' },
  },
  {
    path: 'terms',
    component: TermsConditionsComponent,
    canActivate: [TermsAccessGuard],
    data: { title: 'Terms & Conditions', titleI18n: 'Terms & Conditions' },
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login', titleI18n: 'menu.Login' },
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register', titleI18n: 'menu.Register' },
      },
    ],
  },

  // Protected routes - must come AFTER public routes
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', titleI18n: 'Dashboard' },
      },
      {
        path: 'profile',
        children: [
          {
            path: 'overview',
            component: ProfileOverviewComponent,
            data: { title: 'Profile Overview', titleI18n: 'profile' },
          },
          {
            path: 'image',
            component: ProfileImageComponent,
            data: { title: 'Profile Picture', titleI18n: 'profile_picture' },
          },
          {
            path: 'settings',
            component: ProfileSettingsComponent,
            data: { title: 'Profile Settings', titleI18n: 'edit_profile' },
          },
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
        ],
      },
      {
        path: 'deposit',
        component: DepositComponent,
        data: { title: 'Deposit', titleI18n: 'Deposit' },
      },
      {
        path: 'withdraw',
        component: WithdrawComponent,
        data: { title: 'Withdraw', titleI18n: 'Withdraw' },
      },
      {
        path: 'transfer',
        component: TransferComponent,
        data: { title: 'Transfer', titleI18n: 'Transfer' },
      },
      {
        path: 'accounts',
        component: AccountInformationComponent,
        data: { title: 'Account Information', titleI18n: 'Account Information' },
      },
      {
        path: 'transactions',
        component: TransactionHistoryComponent,
        data: { title: 'Transaction Management', titleI18n: 'Transaction Management' },
      },
      {
        path: 'support',
        component: HelpSupportComponent,
        data: { title: 'Help Support', titleI18n: 'Help Support' },
      },
      {
        path: 'banking-guide',
        component: BankingGuideComponent,
        data: { title: 'Banking Guide', titleI18n: 'Banking Guide' },
      },
      {
        path: 'security-tips',
        component: SecurityTipsComponent,
        data: { title: 'Security Tips', titleI18n: 'Security Tips' },
      },
      {
        path: '403',
        component: Error403Component,
        data: { title: 'Access Denied', titleI18n: 'menu.Access Denied' },
      },
      {
        path: '404',
        component: Error404Component,
        data: { title: 'Not Found', titleI18n: 'menu.Not Found' },
      },
      {
        path: '500',
        component: Error500Component,
        data: { title: 'Server Error', titleI18n: 'menu.Server Error' },
      },
      {
        path: 'notifications/:id',
        component: NotificationDetailComponent,
        data: { title: 'Notification Detail', titleI18n: 'Notification Detail' },
      },
    ],
  },

  // Wildcard route must be last
  { path: '**', redirectTo: 'home' },
];
