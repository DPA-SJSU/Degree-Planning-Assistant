import { Injectable } from "@angular/core";
import { UserService, UserProfile } from "./user.service";
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

  constructor(private userService: UserService) {
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
        unitsSum += Number(course.credit);
        difficultySum += course.difficulty;
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
