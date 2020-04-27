import { Injectable } from "@angular/core";
import { UserService, UserProfile } from "./user.service";
import { HttpClient } from "@angular/common/http";
import { CourseData } from "./course.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

export interface Year {
  beginning: number;
  ending: number;
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

  user: Observable<UserProfile>;

  constructor(private userService: UserService, private http: HttpClient) {
    this.user = this.userService.getUserData();
  }

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
            case -1: {
              semester.status = "planned";
              break;
            }
            case 0: {
              semester.status = "in-progress";
              break;
            }
            case 1: {
              semester.status = "completed";
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
              semesters: [
                {
                  ...semester,
                  units: semesterStats.units,
                  difficulty: semesterStats.difficulty,
                },
              ],
            } as Year;
            yearArray.push(newYear);
            yearCounter = currentYear;
          } else {
            yearArray[yearArray.length - 1].semesters.push({
              ...semester,
              units: semesterStats.units,
              difficulty: semesterStats.difficulty,
            });
          }
        });

        return JSON.parse(JSON.stringify({ years: yearArray }));
      }
      return [];
    };

    return this.user.pipe(map(mapCallback));
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

      years[yearIndex].semesters.push(newSemester);

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
}
