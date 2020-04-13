import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { UserProfile, UserService } from "../user.service";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";

@Component({
  selector: "app-s-profile-dash",
  templateUrl: "./s-profile-dash.component.html",
  styleUrls: ["./s-profile-dash.component.css"],
})
export class SProfileDashComponent implements OnInit {
  profile: Observable<UserProfile>;
  uploadForm: any;
  displayUploadSpinner = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
    this.profile = this.userService.getUserData();
  }

  @Output() profileUpdated = new EventEmitter<Event>();

  ngOnInit() {
    this.uploadForm = this.formBuilder.group({
      file: [""],
    });
  }

  /**
   * Check if file is selected and set form
   * @param event
   */
  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get("file").setValue(file);
    }
  }

  /**
   * Upload form value to scan the file
   */
  uploadFile(event: Event): void {
    this.displayUploadSpinner = true;
    this.userService
      .scanFile(this.uploadForm.get("file").value, "transcript")
      .subscribe({
        complete: () => {
          this.displayUploadSpinner = false;
          this.profileUpdated.emit(event);
        },
        error: (err) => {
          this.displayUploadSpinner = false;
          console.log("Scanned file error", err);
        },
      });
  }

  //----------------------------------------------
  onClickEditProfile() {
    this.router.navigate(["profile"]);
  }
}
