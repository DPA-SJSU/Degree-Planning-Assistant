import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { LandingComponent } from "./landing/landing.component";
import { AuthGuard } from "./auth.guard";
import { SDashboardComponent } from "./s-dashboard/s-dashboard.component";

const routes: Routes = [
  { path: "", component: LandingComponent },
  { path: "register", component: RegistrationComponent },
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: SDashboardComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
