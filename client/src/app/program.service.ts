import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ErrorHandlerService } from "./error-handler.service";
import { UserService } from "./user.service";
import { Observable } from "rxjs";

export interface ProgramData {
  requirements?: string;
  school: string;
  major: string;
  catalogYear: number;
}

@Injectable({
  providedIn: "root",
})
export class ProgramService {
  uri = "http://localhost:8080";
  tokenKey = "tokenKey";

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private userService: UserService
  ) {}

  createProgram(programData: ProgramData): Observable<ProgramData> {
    return this.http.post<ProgramData>(
      `${this.uri}/program`,
      programData,
      this.userService.getHttpHeaders()
    );
  }

  updateProgram() {}

  /**
   * Takes in an object of key-value pairs to find a program.
   * @param queryParams: { key: value } pairs
   * @returns Observable of [ProgramData]
   */
  getProgram(queryParams: {}): Observable<[ProgramData]> {
    let paramsString = "";
    for (const [key, value] of Object.entries(queryParams)) {
      paramsString += `${key}=${value}&`;
    }
    paramsString = paramsString.slice(0, -1);

    return this.http.get<[ProgramData]>(
      `${this.uri}/program?` + paramsString,
      this.userService.getHttpHeaders()
    );
  }

  deleteProgram() {}
}
