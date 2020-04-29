import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { PlanService } from "../plan.service";
import { UserService } from "../user.service";
import { ErrorHandlerService } from "../error-handler.service";

import { CourseData } from "../course.service";

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

  constructor(
    private planService: PlanService,
    private userService: UserService,
    private errorService: ErrorHandlerService,
    private router: Router
  ) {
    this.plan = {};
    this.courseList = [];
    this.program = {};
    this.draggedCourse = {
      from: "",
    };
    this.addYearWidget = {
      active: false,
      yearField: 0,
    };
  }

  ngOnInit() {
    this.planService.formatPlan().subscribe((result) => {
      this.plan = result;
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
  }

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
      this.addYearWidget.active = false;
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
      this.plan.years[yearIndex].newSemesterWidget.active = false;
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

  /**
   * Handles clicking on the "Submit" button
   */
  onClickSubmitPlan(): void {
    this.planService.submitPlan(this.plan).subscribe({
      complete: () => {
        this.router.navigate(["dashboard"]);
      },
      error: (errRes) => {
        this.errorService.handleError(errRes);
      },
    });
  }
}
