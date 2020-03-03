import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { UserData, UserService } from "../user.service";
import { ErrorHandlerService } from "../error-handler.service";

@Component({
  selector: "app-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.css"]
})
export class RegistrationComponent {
  registrationForm: FormGroup = new FormGroup({
    name: new FormControl("", Validators.required),
    email: new FormControl("", Validators.email),
    password: new FormControl("", Validators.required)
  });

  constructor(
    private router: Router,
    private userService: UserService,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Register new user, validating input and server response
   */
  onSubmit() {
    if (!this.registrationForm.valid) {
      alert("Please fill out all form boxes.");
      return;
    }

    const user: UserData = {
      name: this.registrationForm.value.name,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password
    };

    const tokenResult = this.userService.registerNewUser(user);

    // retrieve token or handle server error
    tokenResult.subscribe(
      result => {
        // HTTP result: config and data:
        const config = { userToken: result["token"] };
        return tokenResult;
      },
      err => {
        // HTTP error
        this.errorHandler.handleError(err);
      },
      () => {
        // HTTP request completed
        this.router.navigate(["/"]);
      }
    );
  }

  /**
   * Triggers authentication check of user email and password
   */
  routeToLogin() {
    this.router.navigate(["login"]);
  }
}
