import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-conditions', component: TermsConditionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule {}
