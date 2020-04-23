import { Component, OnInit, ErrorHandler } from "@angular/core";
import { Router } from "@angular/router";

import { UserService, UserProfile } from "../user.service";
import { PlanService, Year } from "../plan.service";

import { Observable } from "rxjs";
import { share } from "rxjs/operators";

@Component({
  selector: "app-s-degree-plan",
  templateUrl: "./s-degree-plan.component.html",
  styleUrls: ["./s-degree-plan.component.css"],
})
export class SDegreePlanComponent implements OnInit {
  yearArray: Observable<Array<Year>>;

  constructor(
    private router: Router,
    private errorHandler: ErrorHandler,
    private planService: PlanService
  ) {
    this.yearArray = this.planService.formatPlan();
    this.yearArray.subscribe((result) => console.log(result));
  }

  ngOnInit() {}

  onClickEditPlan() {
    // TODO: ADD ROUTE AFTER ADDING EDIT PLAN
    this.router.navigate(["plan-editor"]);
  }
}
