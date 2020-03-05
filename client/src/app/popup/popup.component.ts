import { Component, OnInit, Input } from "@angular/core";
import { MatMenu } from "@angular/material";

@Component({
  selector: "app-popup",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.css"]
})
export class PopupComponent implements OnInit {
  popupMenu: MatMenu;

  constructor() {}

  @Input()
  title = "Title";

  @Input()
  subtitle = "Subtitle";

  @Input()
  contentTitle = "Content Title";

  ngOnInit() {}
}
