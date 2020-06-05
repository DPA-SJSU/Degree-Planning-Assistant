import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { UserService } from "./user.service";
import { CourseData } from "./course.service";

export interface Year {
  beginning: number;
  ending: number;
  newSemesterWidget: {
    active: boolean;
    termSelect: string;
  };
  semesters: Array<Semester>;
}

export interface Semester {
  term: string;
  year: number;
  status: number;
  courses?: Array<CourseData>;
  difficulty?: number;
  units?: number;
}

@Injectable({
  providedIn: "root",
})
export class PlanService {
  TERMS = {
    summer: 1,
    fall: 2,
    winter: 3,
    spring: 4,
  };

  FULL_TIME_UNITS_THRESHOLD = 12; // The minimum number of units per term needed to reach full-time status
  MAX_UNITS_PER_TERM = 18; // Stub for the maximum units a student can have before needing their advisor's approval to enroll for additional courses
  HIGH_WORKLOAD_UNITS_THRESHOLD = 15; // The unit threshold needed before we warn the user that they will have a high workload in the current term
  HIGH_DIFFICULTY_THRESHOLD = 2.35; // The term difficulty rating threshold needed before we warn the user that their term is very difficult
  HIGH_IMPACTION_THRESHOLD = 2.1; // The course impaction rating threshold needed before we warn the user that they have an impacted course in the current term

  WARNINGS = {
    MAX_UNITS_EXCEEDED: "MAX_UNITS_EXCEEDED",
    HIGH_WORKLOAD: "HIGH_WORKLOAD",
    HIGH_DIFFICULTY: "HIGH_DIFFICULTY",
    HAS_IMPACTED_COURSE: "HAS_IMPACTED_COURSE",
    EMPTY_TERM: "EMPTY_TERM",
    NOT_FULL_TIME: "NOT_FULL_TIME",
  };

  constructor(private userService: UserService, private http: HttpClient) {}

  /**
   * Formats the user's plan from their profile
   * @returns Observable of an array of years in a degree plan
   */
  formatPlan(): Observable<any[]> {
    const mapCallback = (userData) => {
      if (userData.degreePlan && userData.degreePlan.semesters.length > 0) {
        const yearArray = [];
        const { semesters } = userData.degreePlan;
        semesters.sort((s1, s2) => {
          const num1 =
            s1.year - (this.TERMS[s1.term.toLowerCase()] > 2 ? 1 : 0);
          const num2 =
            s2.year - (this.TERMS[s2.term.toLowerCase()] > 2 ? 1 : 0);
          if (num1 === num2) {
            return (
              this.TERMS[s1.term.toLowerCase()] -
              this.TERMS[s2.term.toLowerCase()]
            );
          } else {
            return num1 - num2;
          }
        });

        let yearCounter = 0;
        semesters.forEach((semester) => {
          const semesterStats = this.calculateSemesterStatistics(semester);

          switch (semester.status) {
            case 0: {
              semester.status = "completed";
              break;
            }
            case 1: {
              semester.status = "in-progress";
              break;
            }
            case 2: {
              semester.status = "planned";
              break;
            }
          }

          const currentYear =
            semester.year -
            (this.TERMS[semester.term.toLowerCase()] > 2 ? 1 : 0);
          if (currentYear > yearCounter) {
            const newYear = {
              beginning: currentYear,
              ending: currentYear + 1,
              newSemesterWidget: {
                active: false,
                termSelect: "",
              },
              semesters: [
                this.addWarnings({
                  ...semester,
                  units: semesterStats.units,
                  difficulty: semesterStats.difficulty,
                }),
              ],
            } as Year;
            yearArray.push(newYear);
            yearCounter = currentYear;
          } else {
            yearArray[yearArray.length - 1].semesters.push(
              this.addWarnings({
                ...semester,
                units: semesterStats.units,
                difficulty: semesterStats.difficulty,
              })
            );
          }
        });

        return JSON.parse(
          JSON.stringify({ id: userData._id, years: yearArray })
        );
      }
      return [];
    };

    // must call getUserData() to refresh the use plan when new user logs in
    return this.userService.getUserData().pipe(map(mapCallback));
  }

  /**
   * Formats the courses in the program into an object that the component can read and render:
   * courseList: Array<{
   *  department: string;
   *  courses: Array<{
   *    department: string;
   *    code: string;
   *    school: string;
   *    title: string;
   *    description: string;
   *    credit: string;
   *    difficulty: number;
   *    impaction: number;
   *  }>;
   * }>
   * @param program The degree program object
   */
  getCourseList(program: any): Array<any> {
    const { requirements } = program;
    const courseList = [];
    requirements.forEach((req) => {
      req.courses.forEach((course) => {
        const {
          department,
          code,
          school,
          title,
          description,
          credit,
          difficulty,
          impaction,
        } = course;
        const departmentAlreadyInList = courseList.findIndex((dep) => {
          return dep.department === department;
        });

        if (departmentAlreadyInList > -1) {
          const courseAlreadyInList = courseList[
            departmentAlreadyInList
          ].courses.findIndex((courseInList) => {
            return courseInList.code === code;
          });
          if (courseAlreadyInList === -1) {
            courseList[departmentAlreadyInList].courses.push({
              department,
              code,
              school,
              title,
              description,
              credit,
              difficulty,
              impaction,
            });
          }
        } else {
          courseList.push({
            department,
            courses: [
              {
                department,
                code,
                school,
                title,
                description,
                credit,
                difficulty,
                impaction,
              },
            ],
          });
        }
      });
    });

    courseList.sort((dep1, dep2) => {
      return dep1.department.localeCompare(dep2.department);
    });

    courseList.forEach((department) => {
      department.courses.sort((course1, course2) => {
        return course1.code.localeCompare(course2.code);
      });
    });

    return courseList;
  }

  /**
   * Adds a new semester into years chronologically. If term already exists, nothing is done.
   * @param term The term in string form
   * @param yearIndex  the Index of the year that the semester will be added to
   * @param years The years array
   */
  addNewSemester(term: string, yearIndex: number, years: Array<any>): void {
    const semesterDoesNotAlreadyExist = years[yearIndex].semesters.every(
      (semester) => {
        return semester.term.toLowerCase() !== term.toLowerCase();
      }
    );

    if (semesterDoesNotAlreadyExist) {
      const newSemester = {
        term: term.toLowerCase(),
        year:
          this.TERMS[term.toLowerCase()] > 2
            ? years[yearIndex].beginning + 1
            : years[yearIndex].beginning,
        difficulty: 0,
        units: 0,
        status: "planned",
        courses: [],
      };

      years[yearIndex].semesters.push(this.addWarnings(newSemester));

      this.sortSemestersChronologically(yearIndex, years);
    } else {
      window.alert("Semester already exists!");
    }
  }

  /**
   * Removes a semester
   * @param semesterIndex The index of the semester to be removed
   * @param yearIndex The index of the year that contains the semester to be removed
   * @param years The years array
   */
  removeSemester(
    semesterIndex: number,
    yearIndex: number,
    years: Array<any>
  ): void {
    years[yearIndex].semesters.splice(semesterIndex, 1);
    if (years[yearIndex].semesters.length === 0) {
      years.splice(yearIndex, 1);
    }
  }

  /**
   * Removes a course from a specified semester in a years array
   * @param indexes The indexes of the course in the years array
   * @param years The years array
   */
  removeCourse(
    indexes: { yearIndex: number; semesterIndex: number; courseIndex: number },
    years: Array<any>
  ): void {
    const { yearIndex, semesterIndex, courseIndex } = indexes;
    years[yearIndex].semesters[semesterIndex].courses.splice(courseIndex, 1);

    const newSemesterStatistics = this.calculateSemesterStatistics(
      years[yearIndex].semesters[semesterIndex]
    );

    years[yearIndex].semesters[semesterIndex].units =
      newSemesterStatistics.units;
    years[yearIndex].semesters[semesterIndex].difficulty =
      newSemesterStatistics.difficulty;

    years[yearIndex].semesters[semesterIndex] = this.addWarnings(
      years[yearIndex].semesters[semesterIndex]
    );
  }

  /**
   * Adds a new year to years
   * @param year The year to be created
   * @param years The years array
   */
  addNewYear(year: number, years: Array<any>): void {
    const yearDoesNotAlreadyExist = years.every((currentYear) => {
      return currentYear.beginning !== year;
    });

    if (yearDoesNotAlreadyExist) {
      const newYear = {
        beginning: year,
        ending: year + 1,
        newSemesterWidget: {
          active: false,
          termSelect: "",
        },
        semesters: [],
      };
      years.push(newYear);

      this.sortYearsChronologically(years);
    } else {
      window.alert(`${year} - ${year + 1} is already in the plan!`);
    }
  }

  /**
   * Adds a given course to a semester; Fired when the user drags a course from the course list to a semester card
   * @param indexes The indexes of the semester in the plan
   * @param course The course data to be added to a semester
   * @param fromCourseList boolean determining if the course comes from the course list
   * @return boolean whether the course was successfully added or not
   */
  addCourseToSemester(
    indexes: { semesterIndex: number; yearIndex: number },
    course: CourseData,
    years: Array<any>,
    fromCourseList: boolean = true
  ): boolean {
    const { semesterIndex, yearIndex } = indexes;

    let courseIsNotAlreadyInSemester = false;

    // If the course comes from the course list, we need to check the entire plan if the course is already in it
    // If not, just check the destination semester
    if (fromCourseList) {
      courseIsNotAlreadyInSemester = this.isCourseAlreadyInPlanOrCompleted(
        { department: course.department, code: course.code },
        years
      );
    } else {
      courseIsNotAlreadyInSemester = years[yearIndex].semesters[
        semesterIndex
      ].courses.every((currentCourse) => {
        return (
          currentCourse.department !== course.department ||
          currentCourse.code !== course.code
        );
      });
    }

    if (courseIsNotAlreadyInSemester) {
      years[yearIndex].semesters[semesterIndex].courses.push(course);

      // recalculate the semester statistics (difficulty, impaction)
      const newStatistics = this.calculateSemesterStatistics(
        years[yearIndex].semesters[semesterIndex]
      );

      years[yearIndex].semesters[semesterIndex].units = newStatistics.units;
      years[yearIndex].semesters[semesterIndex].difficulty =
        newStatistics.difficulty;

      years[yearIndex].semesters[semesterIndex] = this.addWarnings(
        years[yearIndex].semesters[semesterIndex]
      );

      return true;
    } else {
      if (fromCourseList) {
        window.alert(
          `${course.department}${course.code} is already in your plan!`
        );
      } else {
        window.alert(
          `${course.department}${course.code} is already in this semester!`
        );
      }
      return false;
    }
  }

  /**
   * Transfers a course from one semester to another; Fired when a user drags a course from one semester card to another
   * @param from indexes of the origin semester
   * @param to indexes of the destination semester
   * @param course The course data to be transferred
   * @return boolean whether the transfer was successful or not
   */
  TransferCourseBetweenSemesters(
    from: { courseIndex: number; semesterIndex: number; yearIndex: number },
    to: { semesterIndex: number; yearIndex: number },
    course: CourseData,
    years: Array<any>
  ): boolean {
    // Add course to the destination semester card
    if (this.addCourseToSemester(to, course, years, false)) {
      // Remove the course from the old semester card if successful
      years[from.yearIndex].semesters[from.semesterIndex].courses.splice(
        from.courseIndex,
        1
      );

      // Recalculate semester statistics of origin semester
      const newStatistics = this.calculateSemesterStatistics(
        years[from.yearIndex].semesters[from.semesterIndex]
      );

      years[from.yearIndex].semesters[from.semesterIndex].units =
        newStatistics.units;
      years[from.yearIndex].semesters[from.semesterIndex].difficulty =
        newStatistics.difficulty;

      years[from.yearIndex].semesters[from.semesterIndex] = this.addWarnings(
        years[from.yearIndex].semesters[from.semesterIndex]
      );

      return true;
    } else {
      return false;
    }
  }

  /**
   * Fetches the required courses of the user's program
   */
  getProgramCourses(): Observable<any> {
    return this.http.get(
      `${this.userService.uri}/program?major=Software Engineering`,
      this.userService.getHttpHeaders()
    );
  }

  /**
   * Checks if the given course is already in the degree plan
   * @param course The course to be checked
   * @param years The years array
   */
  private isCourseAlreadyInPlanOrCompleted(
    course: { department: string; code: string },
    years: Array<any>
  ): boolean {
    let isCourseAlreadyInPlanOrCompleted = true;

    isCourseAlreadyInPlanOrCompleted = years.every((year) => {
      return year.semesters.every((semester) => {
        return semester.courses.every((currentCourse) => {
          return (
            currentCourse.department !== course.department ||
            currentCourse.code !== course.code
          );
        });
      });
    });

    return isCourseAlreadyInPlanOrCompleted;
  }
  /**
   * Chronologically sorts the semesters at the given index of years
   * @param yearIndex The index of the year in the year array
   * @param years The years array
   */
  private sortSemestersChronologically(
    yearIndex: number,
    years: Array<any>
  ): void {
    years[yearIndex].semesters.sort((sem1, sem2) => {
      return (
        this.TERMS[sem1.term.toLowerCase()] -
        this.TERMS[sem2.term.toLowerCase()]
      );
    });
  }

  /**
   * Chronologically sorts the years
   * @param years The years array
   */
  private sortYearsChronologically(years: Array<any>): void {
    years.sort((year1, year2) => {
      return year1.beginning - year2.beginning;
    });
  }

  /**
   * Helper method for calculating a semester's total difficulty and units
   * @param semester The semester to be calculated
   */
  private calculateSemesterStatistics(
    semester: Semester
  ): { units: number; difficulty: number } {
    if (semester.courses && semester.courses.length > 0) {
      let unitsSum = 0;
      let difficultySum = 0;
      semester.courses.forEach((course: CourseData) => {
        unitsSum += course.credit ? Number(course.credit) : 0;
        difficultySum += course.difficulty ? Number(course.difficulty) : 0;
      });

      const numOfCourses = semester.courses.length;
      let difficultyModifier = 0;

      switch (numOfCourses) {
        case 1: {
          difficultyModifier = 0.25;
          break;
        }
        case 2: {
          difficultyModifier = 0.5;
          break;
        }
        case 3: {
          difficultyModifier = 0.75;
          break;
        }
        default: {
          difficultyModifier = 1.0;
          break;
        }
      }

      const semesterDifficulty =
        (difficultySum / numOfCourses) * difficultyModifier;

      return {
        units: unitsSum,
        difficulty: semesterDifficulty,
      };
    } else {
      return {
        units: 0,
        difficulty: 0,
      };
    }
  }

  /**
   * Creates an observable for submitting the edited degree plan to the server
   * @param plan The transformed degree plan
   */
  submitPlan(plan: any): Observable<any> {
    const semesters: Array<any> = this.convertSemestersForSubmission(
      plan.years
    );

    return this.http.post(
      `${this.userService.uri}/plan/${plan.id}`,
      { semesters },
      this.userService.getHttpHeaders()
    );
  }

  /**
   * Reverses the data transformation made by the component into the format the backend API can read
   * @param years The years array
   */
  private convertSemestersForSubmission(years: Array<any>): Array<any> {
    const semestersResult = [];

    years.forEach((year) => {
      const convertStatusToNumber = (status) => {
        switch (status) {
          case "in-progress": {
            return 1;
          }
          case "planned": {
            return 2;
          }
          case "completed": {
            return 0;
          }
          default: {
            return 0;
          }
        }
      };

      year.semesters.forEach((semester) => {
        const courseIds = [];

        semester.courses.forEach((course) => {
          courseIds.push({
            code: `${course.department} ${course.code}`,
          });
        });

        semestersResult.push({
          term: semester.term,
          year: semester.year,
          difficulty: semester.difficulty.toString(),
          status: convertStatusToNumber(semester.status),
          courses: courseIds,
        });
      });
    });

    return semestersResult;
  }

  /**
   * Add warnings to a term if there are any
   * @param term The term to be used
   */
  private addWarnings(term: any): object {
    const warnings = [];
    if (term.units && term.units > this.MAX_UNITS_PER_TERM) {
      warnings.push(this.WARNINGS.MAX_UNITS_EXCEEDED);
    }
    if (term.units && term.units >= this.HIGH_WORKLOAD_UNITS_THRESHOLD) {
      warnings.push(this.WARNINGS.HIGH_WORKLOAD);
    }
    if (term.difficulty && term.difficulty > this.HIGH_DIFFICULTY_THRESHOLD) {
      warnings.push(this.WARNINGS.HIGH_DIFFICULTY);
    }
    if (term.courses && term.courses.length === 0) {
      warnings.push(this.WARNINGS.EMPTY_TERM);
    } else if (term.courses) {
      const hasImpactedCourse = term.courses.every((course) => {
        if (course.impaction) {
          return course.impaction < this.HIGH_IMPACTION_THRESHOLD;
        }
        return true;
      });
      if (!hasImpactedCourse) {
        warnings.push(this.WARNINGS.HAS_IMPACTED_COURSE);
      }
    }
    if (term.units && term.units < this.FULL_TIME_UNITS_THRESHOLD) {
      warnings.push(this.WARNINGS.NOT_FULL_TIME);
    }

    // Add more warning conditions here...

    if (warnings.length > 0) {
      term.warnings = warnings;
    } else if (term.hasOwnProperty("warnings") === true) {
      // If no warnings, remove the 'warnings' prop if already exists
      const termWithoutWarnings = {};
      Object.keys(term).forEach((prop) => {
        if (prop !== "warnings") {
          termWithoutWarnings[prop] = term[prop];
        }
      });
      term = termWithoutWarnings;
    }

    return term;
  }
}
