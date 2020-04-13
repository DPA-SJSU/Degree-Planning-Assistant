import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.css"]
})
export class ModalComponent implements OnInit {
  modalData;
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
  onSubmit = new EventEmitter<boolean>();

  @Output()
  onInput = new EventEmitter<any>();

  ngOnInit() {}

  /**
   * Send modal status of closed to parent component
   */
  submitModal(submitted: boolean) {
    this.isOpen = false;
    this.onClose.emit(this.isOpen);
    this.onSubmit.emit(submitted);
  }

  /**
   * Send input data from modal to parent component
   */
  sendInputData() {
    console.log("Sending input data ", this.modalData);
    this.onInput.emit(this.modalData);
  }
}
