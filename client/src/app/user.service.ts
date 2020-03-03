import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CourseData } from "./course.service";

export interface UserData {
  name?: string;
  email: string;
  password: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  coursesTaken?: [];
  gradDate?: {
    year?: number;
    term?: string;
  };
  major?: string;
  minor?: string;
  catalogYear?: number;
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
  registerNewUser(user: UserData) {
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

  getHttpHeaders() {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.getCurrentStorageStatus(),
        "Set-Cookie": "HttpOnly;Secure;SameSite=Strict"
      })
    };
    return httpOptions;
  }

  /**
   * Get the profile or just an attribute of the profile object
   * @param attribute (optional)
   */
  getProfile(attribute?: string) {
    if (attribute) {
      return this.http.get<UserProfile>(
        `${this.uri}/profile/?` + attribute + "=true",
        this.getHttpHeaders()
      );
    }
    return this.http.get<UserProfile>(
      `${this.uri}/profile/`,
      this.getHttpHeaders()
    );
  }

  /**
   * Update courses taken
   */
  addToCoursesTaken(coursesTaken: [CourseData]) {
    return this.http.put(
      `${this.uri}/coursesTaken/`,
      coursesTaken,
      this.getHttpHeaders()
    );
  }
}
