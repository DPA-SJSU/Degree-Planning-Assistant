import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";

@Component({
  selector: "app-s-dashboard",
  templateUrl: "./s-dashboard.component.html",
  styleUrls: ["./s-dashboard.component.css"]
})
export class SDashboardComponent implements OnInit {
  constructor(private userService: UserService) {}

  ngOnInit() {}
}
