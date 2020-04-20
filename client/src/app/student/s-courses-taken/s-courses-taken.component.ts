import { Component, OnInit, Input } from "@angular/core";
import { UserService, UserProfile } from "../../user.service";
import { Observable } from "rxjs";
import { CourseService, CourseData } from "../../course.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"],
})
export class SCoursesTakenComponent implements OnInit {
  profile: Observable<UserProfile>;
  allCourses: Observable<CourseData[]>;
  showModal = false;
  modalData: string;
  openPanel = false;
  searchResults: Observable<CourseData[]>;
  private listOfCourses: CourseData[] = [];

  searchForm = new FormGroup({
    searchTerm: new FormControl("", [Validators.required]),
  });

  visible = true;
  selectable = true;
  removable = true;

  constructor(
    private userService: UserService,
    private courseService: CourseService
  ) {
    this.profile = this.userService.getUserData();
    this.courseService.fetchAllCourses("sjsu");
    this.allCourses = this.courseService.getAllCourses();
  }

  ngOnInit() {}

  @Input() set hasNewProfile(event: Event) {
    if (event) {
      this.profile = this.userService.refreshAndGetUserData();
      this.openPanel = true;
    }
  }

  onSearch() {
    if (!this.searchForm.valid) {
      // alert("Please enter in a search.");
      return;
    }
    this.searchResults = this.courseService.searchCourses(
      this.searchForm.value.searchTerm
    );
    this.searchForm.reset();
  }

  /**
   * Adds course to listOfCourses that represents the newly
   * inputted courses taken.
   * @param course
   */
  addToListOfCourses(course: CourseData) {
    if (!this.listOfCourses.includes(course)) {
      this.listOfCourses.push(course);
    }
    console.log(this.listOfCourses);
  }

  /**
   * Saves listOfCourses to the user's profile
   * @param courses
   */
  saveToUserProfile() {
    this.userService.addToCoursesTaken(this.listOfCourses).subscribe(() => {
      this.profile = this.userService.refreshAndGetUserData();
      this.openPanel = true;
    });
  }

  /**
   * Recieve a boolean from the child component ModalComponent
   * to determine if the modal 'Submit' button was clicked.
   * @param $event
   */
  modalSubmission($event) {
    console.log("submission: ", $event);
    const submitted = $event;
    if (submitted) {
      this.saveToUserProfile();
      // save list to user profile
      // trigger a requery so to display the new data in the courses taken
    }
  }

  /**
   * Recieve a boolean from the child component ModalComponent
   * to determine if the modal is closed.
   * @param $event
   */
  modalClose($event) {
    console.log("close: ", !$event);
    this.showModal = $event;
  }

  /**
   * Recieve data from the child component ModalComponent.
   * @param $event
   */
  getModalData($event) {
    console.log("The data event: ", $event);
    this.modalData = $event;
  }

  /**
   * Removes an item from the chip list in the template
   * @param course
   */
  removeChipFromList(course: CourseData): void {
    const index = this.listOfCourses.indexOf(course);

    if (index >= 0) {
      this.listOfCourses.splice(index, 1);
    }
    console.log(this.listOfCourses);
    this.selectable = false;
  }
}
