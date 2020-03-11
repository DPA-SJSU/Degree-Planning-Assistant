import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";

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

export interface CourseData {
  school: string;
  code: string;
  title: string;
  description: string;
  prerequisites: [CourseData];
  corequisites: [CourseData];
  difficulty?: number;
  impaction?: number;
  termsOffered: string;
}

@Injectable({
  providedIn: "root"
})
export class UserService {
  uri = "http://localhost:8080";
  tokenKey = "tokenKey";
  private logger = new Subject<boolean>();

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
        this.logger.next(true);
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
    return this.getCurrentStorageStatus() != null;
  }

  isLoggedInAsync(): Observable<boolean> {
    return this.logger.asObservable();
  }

  /**
   * Logout a user
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.logger.next(false);
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
    return this.http.get<UserProfile>(`${this.uri}/`, this.getHttpHeaders());
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
