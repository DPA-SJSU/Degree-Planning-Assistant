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

  constructor(private router: Router, private planService: PlanService) {
    this.openPanel = true;
  }

  @Input() set hasNewProfile(event: Event) {
    if (event) {
      this.yearArray = this.planService.formatPlan();
      this.openPanel = true;
    }
  }

  ngOnInit() {
    this.yearArray = this.planService.formatPlan();
  }

  onClickEditPlan() {
    this.router.navigate(["plan-editor"]);
  }
}
