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
import { TransactionManagementComponent } from './Transaction-components/transaction-management/transaction-management.component';
import { HelpSupportComponent } from './Transaction-components/help-support/help-support.component';

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
        path: 'accounts',
        component: AccountInformationComponent,
        data: { title: 'Account Information', titleI18n: 'Account Information' },
      },
      {
        path: 'transactions',
        component: TransactionManagementComponent,
        data: { title: 'Transaction Management', titleI18n: 'Transaction Management' },
      },
      {
        path: 'support',
        component: HelpSupportComponent,
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
