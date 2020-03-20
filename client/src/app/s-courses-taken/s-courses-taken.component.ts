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
  showModal = false;
  modalData: string;

  constructor(private userService: UserService) {
    this.profile = this.userService.userData;
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
