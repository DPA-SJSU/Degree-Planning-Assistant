import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ErrorHandlerService } from "./error-handler.service";
import { CourseData } from "./course.service";
import { Observable, Subject } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";

export interface UserData {
  name?: string;
  email: string;
  password: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  coursesTaken: CourseData[];
  gradDate?: {
    year?: number;
    term: string;
  };
  major: string;
  minor: string;
  catalogYear?: number;
  avatarUrl: string;
  avatarType: string;
  isAdmin: boolean;
  school: string;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  uri = "http://localhost:8080";
  tokenKey = "tokenKey";
  private logger = new Subject<boolean>();
  private userData: Observable<UserProfile>;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Register a new user
   * @param user
   */
  registerNewUser(user: UserData) {
    return this.http.post(`${this.uri}/register`, user);
  }

  /**
   * Login an existing user
   * @param user: The user's login credentials
   * @param completeCallback: The callback function called for the LoginComponent upon completing the HTTP request
   */
  login(user: UserData, completeCallback: () => void) {
    /**
     * Call back function called by map when piping the http response for login
     * Stores the token into local storage and removes the token field in the object returned by the HTTP request
     * @param userDetails
     */
    const mapCallback = (userDetails) => {
      localStorage.setItem(this.tokenKey, userDetails.token);
      this.logger.next(true);

      const removedToken = {} as UserProfile;
      Object.keys(userDetails).forEach((prop, index) => {
        if (prop !== "token") {
          removedToken[prop] = userDetails[prop];
        }
      });

      return removedToken;
    };

    // Call Backend API f login then call the 'completeCallback' callback function passed by LoginComponent
    // Alternatively, call errorhandler service in case of errors
    this.http
      .post(`${this.uri}/login`, user)
      .pipe(map(mapCallback))
      .subscribe({
        error: (errorResponse) => {
          this.errorHandler.handleError(errorResponse);
        },
        complete: completeCallback,
      });
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
    this.userData = undefined;
    this.logger.next(false);
  }

  getHttpHeaders() {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.getCurrentStorageStatus(),
        "Set-Cookie": "HttpOnly;Secure;SameSite=Strict",
      }),
    };
    return httpOptions;
  }

  /**
   * Get the profile or just an attribute of the profile object
   * @param attribute (optional)
   */
  getProfile(attribute?: string) {
    return this.http
      .get<UserProfile>(`${this.uri}/`, this.getHttpHeaders())
      .pipe(
        catchError((err) => {
          return this.errorHandler.handleError(err);
        })
      );
  }

  /**
   * Update courses taken
   */
  addToCoursesTaken(coursesTaken: CourseData[]): Observable<any> {
    const courseIds = [];
    coursesTaken.forEach((course) => courseIds.push(course._id));

    return this.userData.pipe(
      map((user: UserProfile) =>
        user.coursesTaken.forEach((course) => courseIds.push(course._id))
      ),
      switchMap((ids) =>
        this.http
          .put(`${this.uri}/coursesTaken`, courseIds, this.getHttpHeaders())
          .pipe(
            catchError((err) => {
              return this.errorHandler.handleError(err);
            })
          )
      )
    );
  }

  /**
   *  Fetches the user's data using backendAPI then stores it in to this.userData
   */
  fetchUserData(update?: boolean): boolean {
    // Check if this.userData is empty. If it is, re-fetch the user's data. Otherwise, no need to fetch
    if (this.userData === undefined || update) {
      const tokenObj = {
        token: localStorage.getItem(this.tokenKey),
      };

      this.userData = this.http.post<UserProfile>(
        `${this.uri}/identity`,
        tokenObj,
        this.getHttpHeaders()
      );

      this.userData.subscribe({
        error: (errorResponse) => {
          this.errorHandler.handleError(errorResponse);
        },
      });
    }
    return true;
  }

  /**
   * Edit the user's profile
   * @param profileChanges
   */
  editProfile(profileChanges: object) {
    return this.http
      .put(`${this.uri}/profile`, profileChanges, this.getHttpHeaders())
      .pipe(
        catchError((err) => {
          return this.errorHandler.handleError(err);
        })
      );
  }

  /**
   * Getter method for userData
   */
  getUserData() {
    return this.userData;
  }

  refreshAndGetUserData() {
    this.fetchUserData(true);
    return this.userData;
  }

  /**
   * Headers for Form Data using multer
   * Do not set content type
   */
  getHttpHeadersFormData() {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: "Bearer " + this.getCurrentStorageStatus(),
        "Set-Cookie": "HttpOnly;Secure;SameSite=Strict",
      }),
    };
    return httpOptions;
  }

  /**
   * Can file with option to return a degree plan
   * @param file
   * @param option
   */
  scanFile(file, option: string): Observable<any> {
    const formData = new FormData();
    formData.append("pdf", file);

    return this.http
      .post(
        `${this.uri}/scan?option=` + option,
        formData,
        this.getHttpHeadersFormData()
      )
      .pipe(
        catchError((err) => {
          console.log("Scanned file error", err);
          return this.errorHandler.handleError(err);
        })
      );
  }
}
