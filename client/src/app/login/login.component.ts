import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserData, ConnectionService } from '../connection.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', Validators.email),
    password: new FormControl('', Validators.required)
  });

  constructor(private router: Router, private connectionService: ConnectionService) { }

  /**
   * Login existing user, validating input and server response
   */
  onSubmit() {
    if (!this.loginForm.valid) {
      alert('Please fill out all form boxes.');
      return;
    }

    const user: UserData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    const tokenResult = this.connectionService.login(user);

    // retrieve token or handle server error
    tokenResult
      .subscribe(
        result => {
          // HTTP result: config and data:
          const config = { userToken: result['token'] };
          return tokenResult;
        },
        err => {
          // HTTP error
          this.connectionService.handleError(err);
        },
        () => {
          // HTTP request completed
          this.router.navigate(['/']);
        }
      );
  }

  /**
   * Register new user routes to a new page for registration
   */
  routeToRegister() {
    this.router.navigate(['register']);
  }

}
