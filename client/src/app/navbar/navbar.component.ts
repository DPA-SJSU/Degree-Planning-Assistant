import { Component, OnInit } from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";
import { UserService } from "../user.service";
import { Router } from "@angular/router";

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
    private userService: UserService,
    private router: Router
  ) {
    this.isSmallScreen = breakpointObserver.isMatched("(max-width: 599px)");
    this.userLoggedIn = this.userService.isLoggedIn();

    // updates userLoggedIn if the localStorage changes
    this.userService
      .isLoggedInAsync()
      .subscribe(result => (this.userLoggedIn = result));
  }

  ngOnInit() {}

  logoutButton() {
    this.userService.logout();
    this.router.navigate(["login"]);
  }
}
