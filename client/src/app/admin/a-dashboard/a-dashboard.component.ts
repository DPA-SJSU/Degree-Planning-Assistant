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
      major: "Bio Engineering",
      catalogYear: 2020,
    };
    this.newProgram = this.programService.createProgram(program);
  }

  getNewProgram() {
    this.program = this.programService.getProgram({ school: "SJSU" });
  }
}
