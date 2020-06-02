import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { share } from "rxjs/operators";

import { UserService, UserProfile } from "../../user.service";
import { ErrorHandlerService } from "../../error-handler.service";

import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-s-profile",
  templateUrl: "./s-profile.component.html",
  styleUrls: ["./s-profile.component.css"],
})
export class SProfileComponent implements OnInit {
  profile: Observable<UserProfile>;
  editProfile: boolean;
  editProfileForm: FormGroup;

  errors: object;

  constructor(
    private router: Router,
    private userService: UserService,
    private errorHandler: ErrorHandlerService
  ) {
    this.profile = this.userService.getUserData().pipe(share());
    this.editProfile = false;
    this.errors = {
      firstNameField: "",
      lastNameField: "",
      emailField: "",
      catalogYearField: "",
      gradTermField: "",
      gradYearField: "",
    };

    this.editProfileForm = new FormGroup({
      firstNameField: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z ]*$/),
      ]),
      lastNameField: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z ]*$/),
      ]),
      emailField: new FormControl("", [Validators.required, Validators.email]),
      bioField: new FormControl(""),
      catalogYearField: new FormControl("", [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
      gradTermField: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z ]*$/),
      ]),
      gradYearField: new FormControl("", [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
    });
  }

  ngOnInit() {
    this.profile.subscribe({
      next: (res) => {
        this.editProfileForm.controls.firstNameField.setValue(res.firstName);
        this.editProfileForm.controls.lastNameField.setValue(res.lastName);
        this.editProfileForm.controls.emailField.setValue(res.email);
        this.editProfileForm.controls.bioField.setValue(res.bio);
        this.editProfileForm.controls.catalogYearField.setValue(
          res.catalogYear
        );
        this.editProfileForm.controls.gradTermField.setValue(res.gradDate.term);
        this.editProfileForm.controls.gradYearField.setValue(res.gradDate.year);
      },
      error: (err) => {
        this.errorHandler.handleError(err);
      },
    });
  }

  switchEditMode() {
    this.editProfile = !this.editProfile;
  }

  onEditProfile() {
    const errorsObjKeys = Object.keys(this.errors);
    errorsObjKeys.forEach((prop, index) => {
      document.getElementById(prop).classList.remove("error-text-field");
      const element = document.getElementById(`${prop}Error`);
      element.classList.remove("error");
      element.innerHTML = "";
      this.errors[prop] = "";
    });

    Object.keys(this.editProfileForm.value).forEach((key) => {
      if (this.editProfileForm.controls[key].errors) {
        const errors = this.editProfileForm.controls[key].errors;
        if (errors.hasOwnProperty("required")) {
          this.errors[key] = "Field is required";
        } else if (errors.hasOwnProperty("pattern")) {
          this.errors[key] = "Field has invalid characters";
        } else if (errors.hasOwnProperty("email")) {
          this.errors[key] = "Email is invalid";
        }
      }
    });

    const objIsEmpty = (obj) => {
      return Object.keys(obj).every((prop) => {
        return obj[prop].length === 0;
      });
    };

    if (objIsEmpty(this.errors)) {
      const payload = {
        firstName: this.editProfileForm.value.firstNameField,
        lastName: this.editProfileForm.value.lastNameField,
        email: this.editProfileForm.value.email,
        school: "San Jose State University",
        major: "Software Engineering",
        minor: "---",
        bio: this.editProfileForm.value.bioField,
        catalogYear: Number(this.editProfileForm.value.catalogYearField),
        gradDate: {
          term: this.editProfileForm.value.gradTermField,
          year: Number(this.editProfileForm.value.gradYearField),
        },
      };

      this.userService.editProfile(payload).subscribe({
        error: (errorMsg) => {
          this.errorHandler.handleError(errorMsg);
        },
        complete: () => {
          this.userService.fetchUserData(true); // Make a 'hot' observable
          this.profile = this.userService.getUserData(); // Set reference to the new 'hot' observable
          this.editProfile = false;
        },
      });
    } else {
      errorsObjKeys.forEach((prop, index) => {
        if (this.errors[prop].length > 0) {
          document.getElementById(`${prop}`).classList.add("error-text-field");
          const caption = document.getElementById(`${prop}Error`);
          caption.classList.add("error");
          caption.innerHTML = this.errors[prop];
        }
      });
    }
  }

  onClickBack() {
    this.router.navigate(["dashboard"]);
  }
}
