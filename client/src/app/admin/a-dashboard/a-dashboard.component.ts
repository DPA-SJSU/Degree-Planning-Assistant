import { Component, OnInit } from "@angular/core";
import { ProgramData, ProgramService } from "src/app/program.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-a-dashboard",
  templateUrl: "./a-dashboard.component.html",
  styleUrls: ["./a-dashboard.component.css"],
})
export class ADashboardComponent implements OnInit {
  newProgram: Observable<ProgramData>;
  program: Observable<[ProgramData]>;
  constructor(private programService: ProgramService) {}

  ngOnInit() {}

  createNewProgram() {
    const program: ProgramData = {
      school: "SJSU",
      major: "Chemical Engineering",
      catalogYear: 2016,
    };
    this.newProgram = this.programService.createProgram(program);
  }

  getNewProgram() {
    this.program = this.programService.getProgram({ school: "SJSU" });
  }
}
