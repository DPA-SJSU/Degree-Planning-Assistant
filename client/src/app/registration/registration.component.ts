import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserData, ConnectionService } from '../connection.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  registrationForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    password: new FormControl('', Validators.required)
  });

  constructor(private router: Router, private connectionService: ConnectionService) { }

  /**
   * Register new user routes to a new page for registration
   */
  register() {
    if (!this.registrationForm.valid) {
      alert('Please fill out all form boxes.');
      return;
    }

    const user: UserData = {
      name: this.registrationForm.value.name,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password
    };

    const tokenResult = this.connectionService.create_new_user(user);

    tokenResult.subscribe((data) => {
      const config = {
        userToken: data['token']
      };
      console.log('Config & data: ', config, data);
    });
  }

  /**
   * Triggers authentication check of user email and password
   */
  login() {
    this.router.navigate(['login']);
  }

}
