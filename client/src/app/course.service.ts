import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

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
export class CourseService {
  uri = "http://localhost:8080";

  constructor(private http: HttpClient) {}

  /**
   * Get all courses
   */
  getAllCourses() {
    return this.http.get(`${this.uri}/course/all`);
  }
}
