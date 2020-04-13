import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard } from "./auth.guard";

import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { LandingComponent } from "./landing/landing.component";
import { SDashboardComponent } from "./s-dashboard/s-dashboard.component";
import { SProfileComponent } from "./s-profile/s-profile.component";

const routes: Routes = [
  { path: "", component: LandingComponent },
  { path: "register", component: RegistrationComponent },
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: SDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    component: SProfileComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
