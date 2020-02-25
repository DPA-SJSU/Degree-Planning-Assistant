import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface UserData {
  name?: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: "root"
})
export class UserService {
  uri = "http://localhost:8080";
  tokenKey = "tokenKey";

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   * @param user
   */
  create_new_user(user: UserData) {
    return this.http.post(`${this.uri}/register`, user);
  }

  /**
   * Login an existing user
   * @param user
   */
  login(user: UserData): Observable<any> {
    return this.http.post(`${this.uri}/login`, user).pipe(
      map(userDetails => {
        localStorage.setItem(this.tokenKey, userDetails["token"]);
        return userDetails;
      })
    );
  }

  /**
   * See if a user is currently logged in
   */
  getCurrentStorageStatus(): string {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * For checking if someone is logged in
   */
  isLoggedIn(): boolean {
    if (this.getCurrentStorageStatus() != null) {
      return true;
    }
    return false;
  }

  /**
   * Logout a user
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}
