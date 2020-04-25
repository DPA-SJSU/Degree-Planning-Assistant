import { Component, OnInit } from "@angular/core";
import { PlanService } from "../plan.service";
import { UserService } from "../user.service";

@Component({
  selector: "app-s-degree-plan-editor",
  templateUrl: "./s-degree-plan-editor.component.html",
  styleUrls: ["./s-degree-plan-editor.component.css"],
})
export class SDegreePlanEditorComponent implements OnInit {
  plan: any;
  courseList: any;

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
    private userService: UserService
  ) {
    this.planService.formatPlan().subscribe((result) => {
      this.plan = result;
      this.plan.user = "";
      this.plan.program = "";
      this.plan.isAddingYear = false;
      this.plan.years.forEach((year) => {
        year.newSemesterWidget = {
          active: false,
          termSelect: "",
        };
      });
      console.log("The plan: ", result);
    });
    this.userService.getUserData().subscribe((result) => {
      console.log("course list: ", result.coursesTaken);
      this.courseList = result.coursesTaken;
      this.plan.user = result.firstName;
    });

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
          isAddingSemester: false,
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
          isAddingSemester: false,
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
   * Handles click event on "Add Semester" button. Adds a new semester to plan
   * @param yearIndex The
   */
  onClickAddNewSemester(yearIndex: number): void {
    this.planService.addNewSemester(
      this.plan.years[yearIndex].newSemesterWidget.termSelect,
      yearIndex,
      this.plan.years
    );
  }

  toggleAddingSemester(index: number) {
    this.plan.years[index].newSemesterWidget.active = !this.plan.years[index]
      .newSemesterWidget.active;
  }

  toggleAddingYear() {
    this.plan.isAddingYear = !this.plan.isAddingYear;
  }
}
