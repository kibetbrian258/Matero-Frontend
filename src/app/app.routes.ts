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

export const routes: Routes = [
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
        path: 'deposit',
        component: DepositComponent,
        data: { title: 'Dashboard', titleI18n: 'Dashboard' },
      },
      {
        path: 'withdraw',
        component: WithdrawComponent,
        data: { title: 'Dashboard', titleI18n: 'Dashboard' },
      },
      {
        path: 'transfer',
        component: TransferComponent,
        data: { title: 'Dashboard', titleI18n: 'Dashboard' },
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
        data: { title: 'Help Support', titleI18n: 'Help & Support' },
      },
      {
        path: 'banking-guide',
        component: BankingGuideComponent,
        data: { title: 'Help Support', titleI18n: 'Help & Support' },
      },
      {
        path: 'terms',
        component: TermsConditionsComponent,
        data: { title: 'Help Support', titleI18n: 'Help & Support' },
      },
      {
        path: 'security-tips',
        component: SecurityTipsComponent,
        data: { title: 'Help Support', titleI18n: 'Help & Support' },
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
    ],
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
  { path: '**', redirectTo: 'dashboard' },
];
