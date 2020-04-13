import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth.guard";
import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { LandingComponent } from "./landing/landing.component";
import { SDashboardComponent } from "./student/s-dashboard/s-dashboard.component";
import { SProfileComponent } from "./student/s-profile/s-profile.component";
import { SDegreePlanEditorComponent } from "./s-degree-plan-editor/s-degree-plan-editor.component";
import { ADashboardComponent } from "./admin/a-dashboard/a-dashboard.component";

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
  {
    path: "plan-editor",
    component: SDegreePlanEditorComponent,
  },
  {
    path: "admin",
    component: ADashboardComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
