import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { LandingComponent } from "./landing/landing.component";
import { AuthGuard } from "./auth.guard";
import { SCoursesTakenComponent } from "./s-courses-taken/s-courses-taken.component";

const routes: Routes = [
  { path: "", component: LandingComponent },
  { path: "register", component: RegistrationComponent },
  { path: "login", component: LoginComponent },
  { path: "home", component: SCoursesTakenComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
