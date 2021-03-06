import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { UserService } from "./user.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.userService.isLoggedIn() && this.userService.fetchUserData()) {
      return true;
    }

    window.alert(
      "You don't have permission to view this page. Please log in first."
    );
    this.userService.logout();
    this.router.navigate(["/login"]);
    return false;
  }
}
