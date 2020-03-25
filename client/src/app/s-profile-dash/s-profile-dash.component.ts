import { Component, OnInit } from "@angular/core";
import { UserProfile, UserService } from "../user.service";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-s-profile-dash",
  templateUrl: "./s-profile-dash.component.html",
  styleUrls: ["./s-profile-dash.component.css"]
})
export class SProfileDashComponent implements OnInit {
  profile: Observable<UserProfile>;

  constructor(private router: Router, private userService: UserService) {
    this.profile = this.userService.getUserData();
  }

  ngOnInit() {}

  onClickEditProfile() {
    this.router.navigate(["profile"]);
  }
}
