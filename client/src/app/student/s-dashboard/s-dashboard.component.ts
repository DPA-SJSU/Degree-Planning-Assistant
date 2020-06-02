import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user.service";

@Component({
  selector: "app-s-dashboard",
  templateUrl: "./s-dashboard.component.html",
  styleUrls: ["./s-dashboard.component.css"],
})
export class SDashboardComponent implements OnInit {
  private profileEvent: Event;
  constructor() {}

  ngOnInit() {}

  updateProfile(event: Event) {
    this.profileEvent = event;
  }
}
