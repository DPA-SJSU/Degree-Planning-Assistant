import { Component, OnInit } from "@angular/core";
import { UserService, UserProfile } from "../user.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"]
})
export class SCoursesTakenComponent implements OnInit {
  profile: Observable<UserProfile>;
  showPopup = false;
  popupData: string;
  constructor(private userService: UserService) {
    this.profile = this.userService.getProfile("coursesTaken");
  }

  /**
   * Recieve a boolean from the child component PopupComponent
   * to determine if the popup is closed.
   * @param $event
   */
  popupStatus($event) {
    console.log("The event: ", $event);
    this.showPopup = $event;
  }

  getPopupData($event) {
    console.log("The data event: ", $event);
    this.popupData = $event;
  }

  ngOnInit() {}
}
