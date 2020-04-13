import { Injectable } from "@angular/core";

import { UserService, CourseData } from "./user.service";

import { map } from "rxjs/operators";

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

  constructor(private userService: UserService) {}

  /**
   * Formats the user's plan for rendering
   */
  formatPlan() {
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

        return yearArray;
      }
      return [];
    };

    return this.userService.getUserData().pipe(map(mapCallback));
  }

  /**
   * Helper method for calculating a semester's total difficulty and units
   * @param semester The semester to be calculated
   */
  private calculateSemesterStatistics(semester: Semester) {
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
