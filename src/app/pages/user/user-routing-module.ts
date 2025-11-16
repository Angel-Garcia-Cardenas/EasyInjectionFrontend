import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/dashboard-layout/dashboard-layout';
import { Account } from './account/account';
import { SecurityComponent } from './security/security';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'account', component: Account },
      { path: 'security', component: SecurityComponent },
      { path: '', redirectTo: 'account', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
