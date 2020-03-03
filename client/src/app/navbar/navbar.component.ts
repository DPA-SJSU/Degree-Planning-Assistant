import { Component, OnInit } from "@angular/core";

import { BreakpointObserver } from "@angular/cdk/layout";
import { UserService } from "../user.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  isSmallScreen;
  userLoggedIn;

  constructor(
    breakpointObserver: BreakpointObserver,
    private userService: UserService
  ) {
    this.isSmallScreen = breakpointObserver.isMatched("(max-width: 599px)");
    this.userLoggedIn = this.userService.isLoggedIn();
  }

  ngOnInit() {
    this.userLoggedIn = this.userService.isLoggedIn();
  }
}
