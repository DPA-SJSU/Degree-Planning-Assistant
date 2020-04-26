import { Component, OnInit } from "@angular/core";
import { PlanService } from "../plan.service";
import { UserService } from "../user.service";
import { CourseData } from "../course.service";
import { ErrorHandlerService } from "../error-handler.service";

@Component({
  selector: "app-s-degree-plan-editor",
  templateUrl: "./s-degree-plan-editor.component.html",
  styleUrls: ["./s-degree-plan-editor.component.css"],
})
export class SDegreePlanEditorComponent implements OnInit {
  plan: any; // Holds the user's degree plan data and some frontend flags
  courseList: any; // Holds the data of the courses the user can add to their plan;
  program: any;

  // Variable used by the "ADD A NEW SCHOOL YEAR" widget
  addYearWidget: {
    active: boolean; // The flag used to toggle the widget
    yearField: number; // The field containing the value of the textfield in the widget
  };

  // Variable that will hold data about the course chip being dragged by the user's mouse; Used for the drag/drop feature
  draggedCourse: {
    from: string; // Where the item is dragged from. Can either be from the course list or a semester card

    /**
     * If the course chip was dragged from a semester card. 'indexes' will contain the course's course, semester, and year indexes.
     * If the course chip was dragged from the course list. 'indexes' wll be undefined
     * These will be used to locate it within the 'plan' variable
     */
    indexes?: {
      courseIndex: number;
      semesterIndex: number;
      yearIndex: number;
    };

    /**
     * The course data of the course chip
     */
    course?: CourseData;
  };

  /**
   * The following changes to types were made to make it easier to display them on the frontend.
   * They will be reversed when using them for backend calls.
   *
   * (semester) status: Type Changed from Number to String
   * (semester) units: Added field to semesters (Type Number)
   * (semester) difficulty: Type Changed from String to Number
   * (semester) isAddingSemester: Boolean, flag to check if user wants to add a semester
   */

  constructor(
    private planService: PlanService,
    private userService: UserService,
    private errorService: ErrorHandlerService
  ) {
    this.planService.formatPlan().subscribe((result) => {
      this.plan = result;
      this.plan.user = "";
      this.plan.program = "";
      this.plan.years.forEach((year) => {
        year.newSemesterWidget = {
          active: false,
          termSelect: "",
        };
      });
      this.userService.getUserData().subscribe((userResult) => {
        this.plan.user = userResult.firstName;
      });
    });
    this.planService.getProgramCourses().subscribe({
      next: (res) => {
        this.program = res[0];
        this.courseList = this.planService.getCourseList(this.program);
      },
      error: (errRes) => {
        this.errorService.handleError(errRes);
      },
    });

    this.addYearWidget = {
      active: false,
      yearField: 0,
    };

    // this.setDummyData();
  }

  /** Dummy data for plan used to demo markup */
  setDummyData() {
    this.plan = {
      user: "",
      program: "",
      isAddingYear: false,
      years: [
        {
          beginning: 2017,
          ending: 2018,
          newSemesterWidget: {
            active: false,
            termSelect: "",
          },
          semesters: [
            {
              term: "Fall",
              year: 2017,
              difficulty: 3.0,
              units: 1.0,
              courses: [
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 1.0,
                  impaction: 3.0,
                  termsOffered: "Fall, Spring",
                },
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 2.0,
                  impaction: 3.0,
                  termsOffered: "Fall, Spring",
                },
              ],
              status: "completed",
            },
            {
              term: "Spring",
              year: 2018,
              difficulty: 1.4,
              units: 1.0,
              courses: [
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 3.0,
                  impaction: 2.0,
                  termsOffered: "Fall, Spring",
                },
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 3.0,
                  impaction: 1.0,
                  termsOffered: "Fall, Spring",
                },
              ],
              status: "completed",
            },
          ],
        },
        {
          beginning: 2018,
          ending: 2019,
          newSemesterWidget: {
            active: false,
            termSelect: "",
          },
          semesters: [
            {
              term: "Fall",
              year: 2018,
              difficulty: 2.4,
              units: 1.0,
              courses: [
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 1.0,
                  impaction: 3.0,
                  termsOffered: "Fall, Spring",
                },
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 2.0,
                  impaction: 3.0,
                  termsOffered: "Fall, Spring",
                },
              ],
              status: "completed",
            },
            {
              term: "Spring",
              year: 2019,
              difficulty: 3.2,
              units: 1.0,
              courses: [
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 3.0,
                  impaction: 2.0,
                  termsOffered: "Fall, Spring",
                },
                {
                  school: "SJSU",
                  department: "CMPE",
                  code: "120",
                  title: "Computer Architecture",
                  credit: "3.0",
                  description: "lorem ipsum",
                  prerequisites: [],
                  corequisites: [],
                  area: "",
                  type: [],
                  difficulty: 3.0,
                  impaction: 1.0,
                  termsOffered: "Fall, Spring",
                },
              ],
              status: "completed",
            },
          ],
        },
      ],
    };

    /* Dummy data for course list to demo markup */
    this.courseList = [
      {
        department: "CMPE",
        courses: [
          {
            department: "CMPE",
            code: "120",
          },
          {
            department: "CMPE",
            code: "131",
          },
        ],
      },
      {
        department: "CS",
        courses: [
          {
            department: "CS",
            code: "146",
          },
          {
            department: "CS",
            code: "149",
          },
        ],
      },
    ];
  }

  ngOnInit() {}

  /**
   * Handles click event of "Add New Year" button
   * @param year The year to be added
   */
  onClickAddNewYear(year: number): void {
    if (this.addYearWidget.yearField !== 0) {
      this.planService.addNewYear(
        this.addYearWidget.yearField,
        this.plan.years
      );
    }
  }

  /**
   * Handles click event of "Add Semester" button. Adds a new semester to plan
   * @param yearIndex The
   */
  onClickAddNewSemester(yearIndex: number): void {
    if (
      this.plan.years[yearIndex].newSemesterWidget.termSelect &&
      this.plan.years[yearIndex].newSemesterWidget.termSelect.length > 0
    ) {
      this.planService.addNewSemester(
        this.plan.years[yearIndex].newSemesterWidget.termSelect,
        yearIndex,
        this.plan.years
      );
    }
  }

  /**
   * Handles click event on the remove semester button. Removes a semester from the plan
   * @param semesterIndex The index of the semester to be removed
   * @param yearIndex The index of the year to be removed
   */
  onClickRemoveSemester(semesterIndex: number, yearIndex: number): void {
    this.planService.removeSemester(semesterIndex, yearIndex, this.plan.years);
  }

  /**
   * Handles click events on the "add new semester" widget
   * @param index The index of the year that the user wants to add a semester to
   */
  toggleAddingSemester(index: number) {
    this.plan.years[index].newSemesterWidget.active = !this.plan.years[index]
      .newSemesterWidget.active;
  }

  /**
   * Handles clck events on the "Add A New School Year" widget
   */
  toggleAddingYear() {
    this.addYearWidget.active = !this.addYearWidget.active;
  }

  /**
   * Sets the value of draggedCourse to the course data represented by the dragged course chip from course list
   * @param course The course data represented by the dragged course chip
   */
  onDragFromCourseList(course: CourseData): void {
    this.draggedCourse = {
      from: "course-list",
      course,
    };
  }

  /**
   * Sets the value of draggedCouse to the course data represented by the dragged course chip from a semester card
   * @param courseIndex The index of the course in a semester
   * @param semesterIndex The index of the semester that holds the course in a year
   * @param yearIndex The index of the year in the plan
   * @param course The course data represented by the dragged course chip
   */
  onDragFromSemesterCard(
    courseIndex: number,
    semesterIndex: number,
    yearIndex: number,
    course: CourseData
  ): void {
    this.draggedCourse = {
      from: "semester-card",
      indexes: {
        courseIndex,
        semesterIndex,
        yearIndex,
      },
      course,
    };
  }

  /**
   * Clears dragged course
   */
  private clearDraggedCourse(): void {
    this.draggedCourse = {
      from: "",
    };
  }

  /**
   * Handles drop events for semester cards; Happens when a course chip is dropped on a semester card; Differentiates between course chips from course list and other semester cards
   * @param semesterIndex The semester index of the semester card
   * @param yearIndex The year inex of the semester card
   */
  onDropSemesterCard(semesterIndex: number, yearIndex: number): void {
    if (this.draggedCourse && this.draggedCourse.from.length > 0) {
      const { from, indexes, course } = this.draggedCourse;
      if (from === "semester-card") {
        this.planService.TransferCourseBetweenSemesters(
          indexes,
          { semesterIndex, yearIndex },
          course,
          this.plan.years
        );
      } else if (from === "course-list") {
        this.planService.addCourseToSemester(
          { semesterIndex, yearIndex },
          course,
          this.plan.years,
          true
        );
      }
      this.clearDraggedCourse();
    }
  }

  /**
   *  Handles drop events for course chips dragged out of a semester card; This removes the course from the semester
   */
  onDropRemoveCourse(): void {
    const { from, indexes } = this.draggedCourse;
    if (from === "semester-card") {
      this.planService.removeCourse(indexes, this.plan.years);
    }
  }
}
