import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor(private connectionService: ConnectionService, private router: Router) { }

  ngOnInit() {
  }

  logoutButton() {
    this.connectionService.logout();
    this.router.navigate(['login']);
  }

}
