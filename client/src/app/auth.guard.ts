import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ConnectionService } from './connection.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private connectionService: ConnectionService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.connectionService.isLoggedIn()) {
            return true;
        }

        window.alert('You don\'t have permission to view this page. Please log in first.');
        this.router.navigate(['/login']);
        return false;
    }
}