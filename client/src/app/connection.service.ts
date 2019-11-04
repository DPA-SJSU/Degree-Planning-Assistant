import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UserData {
  name?: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  uri = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  create_new_user(user: UserData) {
    return this.http.post(`${this.uri}/register`, user);
  }

  sign_in_user(user: UserData) {
    return this.http.post(`${this.uri}/login`, user);
  }
}
