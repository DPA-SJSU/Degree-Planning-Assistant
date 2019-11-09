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
  login() {
    if (!this.loginForm.valid) {
      alert('Please fill out all form boxes.');
      return;
    }

    const user: UserData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    const tokenResult = this.connectionService.sign_in_user(user);

    // retrieve token or handle server error
    tokenResult
      .subscribe(
        result => {
          const config = { userToken: result['token'] };
          console.log('HTTP config and response: ', config, result);
          return tokenResult;
        },
        err => {
          console.log('HTTP Error: ', err);
          this.connectionService.handleError(err);
        },
        () => console.log('HTTP request completed.')
      );
  }

  /**
   * Register new user routes to a new page for registration
   */
  register() {
    this.router.navigate(['register']);
  }

}
