import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ErrorHandlerService } from "./error-handler.service";
import { UserService } from "./user.service";

export interface CourseData {
  _id?: string;
  school: string;
  code: string;
  department: string;
  title: string;
  description: string;
  prerequisites: [CourseData];
  corequisites: [CourseData];
  difficulty?: number;
  impaction?: number;
  termsOffered: string;
}

@Injectable({
  providedIn: "root",
})
export class CourseService {
  uri = "http://localhost:8080";
  tokenKey = "tokenKey";
  allCourses: Observable<CourseData[]>;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private userService: UserService
  ) {}

  fetchAllCourses(school: string) {
    if (this.allCourses === undefined) {
      const tokenObj = {
        token: this.userService.getCurrentStorageStatus(),
      };

      this.allCourses = this.http.get<CourseData[]>(
        `${this.uri}/course/` + school.toLowerCase(),
        this.userService.getHttpHeaders()
      );
    }
    return true;
  }

  getAllCourses(): Observable<CourseData[]> {
    return this.allCourses;
  }

  /**
   * Searches the list of all courses to find a match to the search term
   * @param searchTerm
   */
  searchCourses(searchTerm: string): Observable<CourseData[]> {
    const results: CourseData[] = [];
    const resultsSubject = new Subject<CourseData[]>();

    this.allCourses.subscribe((courses) => {
      courses.forEach((course) => {
        const searchCourses = (element) =>
          element.toString().toLowerCase().includes(searchTerm.toLowerCase());

        if (Object.values(course).some(searchCourses)) {
          results.push(course);
        }
      });
      resultsSubject.next(results);
    });

    return resultsSubject.asObservable();
  }
}
