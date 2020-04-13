import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";

import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatMenuModule } from "@angular/material/menu";
import { MatCardModule } from "@angular/material/card";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { LayoutModule } from "@angular/cdk/layout";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatDividerModule } from "@angular/material/divider";

import { UserService } from "./user.service";
import { PlanService } from "./plan.service";

import { AppComponent } from "./app.component";
import { LandingComponent } from "./landing/landing.component";
import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { SCoursesTakenComponent } from "./s-courses-taken/s-courses-taken.component";
import { ModalComponent } from "./modal/modal.component";
import { PopupComponent } from "./popup/popup.component";
import { SDashboardComponent } from "./s-dashboard/s-dashboard.component";
import { SProfileDashComponent } from "./s-profile-dash/s-profile-dash.component";
import { SProfileComponent } from "./s-profile/s-profile.component";
import { SDegreePlanComponent } from "./s-degree-plan/s-degree-plan.component";
import { SDegreePlanEditorComponent } from "./s-degree-plan-editor/s-degree-plan-editor.component";
import { ADashboardComponent } from "./a-dashboard/a-dashboard.component";

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    RegistrationComponent,
    LoginComponent,
    NavbarComponent,
    FooterComponent,
    SCoursesTakenComponent,
    ModalComponent,
    PopupComponent,
    SDashboardComponent,
    SProfileDashComponent,
    SProfileComponent,
    SDegreePlanComponent,
    SDegreePlanEditorComponent,
    ADashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    LayoutModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDividerModule,
  ],
  entryComponents: [ModalComponent, PopupComponent],
  providers: [UserService, PlanService],
  bootstrap: [AppComponent],
})
export class AppModule {}
