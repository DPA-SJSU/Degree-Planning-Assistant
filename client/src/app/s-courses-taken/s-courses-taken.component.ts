import { Component, OnInit, Input } from "@angular/core";
import { UserService, UserProfile } from "../user.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"],
})
export class SCoursesTakenComponent implements OnInit {
  profile: Observable<UserProfile>;
  showModal = false;
  modalData: string;
  openPanel = false;

  constructor(private userService: UserService) {
    this.profile = this.userService.getUserData();
  }

  @Input() set hasNewProfile(event: Event) {
    if (event) {
      this.userService.fetchUserData(true);
      this.profile = this.userService.getUserData();
      this.openPanel = true;
    }
  }

  /**
   * Recieve a boolean from the child component ModalComponent
   * to determine if the modal is closed.
   * @param $event
   */
  modalStatus($event) {
    console.log("The event: ", $event);
    this.showModal = $event;
  }

  getModalData($event) {
    console.log("The data event: ", $event);
    this.modalData = $event;
  }

  ngOnInit() {}
}
