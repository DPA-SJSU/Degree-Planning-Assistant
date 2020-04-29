import { Component, OnInit, ErrorHandler, Input } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { PlanService, Year } from "../plan.service";

@Component({
  selector: "app-s-degree-plan",
  templateUrl: "./s-degree-plan.component.html",
  styleUrls: ["./s-degree-plan.component.css"],
})
export class SDegreePlanComponent implements OnInit {
  yearArray: Observable<Array<Year>>;
  openPanel = false;

  constructor(
    private router: Router,
    private errorHandler: ErrorHandler,
    private planService: PlanService
  ) {
    this.yearArray = this.planService.formatPlan();
  }

  @Input() set hasNewProfile(event: Event) {
    if (event) {
      this.yearArray = this.planService.formatPlan();
      this.openPanel = true;
    }
  }

  ngOnInit() {
    this.openPanel = true;
  }

  onClickEditPlan() {
    // TODO: ADD ROUTE AFTER ADDING EDIT PLAN
    this.router.navigate(["plan-editor"]);
  }
}
