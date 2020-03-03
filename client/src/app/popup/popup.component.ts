import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-popup",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.css"]
})
export class PopupComponent implements OnInit {
  popupData;
  constructor() {}

  // From parent component
  @Input()
  isOpen = false;

  @Input()
  title = "Title";

  // To parent component
  @Output()
  onClose = new EventEmitter<boolean>();

  @Output()
  onInput = new EventEmitter<any>();

  ngOnInit() {}

  /**
   * Send popup status of closed to parent component
   */
  closePopup() {
    this.isOpen = false;
    this.onClose.emit(this.isOpen);
  }

  /**
   * Send input data from popup to parent component
   */
  sendInputData() {
    console.log("Sending input data ", this.popupData);
    this.onInput.emit(this.popupData);
  }
}
