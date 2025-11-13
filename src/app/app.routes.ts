import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { RegisterSuccessComponent } from './pages/auth/register-success/register-success';
import { VerifySuccessComponent } from './pages/auth/verify-success/verify-success';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', loadChildren: () => import('./pages/landing/landing-module').then(m => m.LandingModule) },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register-success', component: RegisterSuccessComponent },
    { path: 'verify-success', component: VerifySuccessComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard-module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
    { path: 'user', loadChildren: () => import('./pages/user/user-module').then(m => m.UserModule), canActivate: [AuthGuard] },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
  ];
