import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { NetworkService } from './services/network.service';
//import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser: any;
  offline: any;

  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
      private networkService: NetworkService
  ) {
      this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
      this.networkService.currentStatus.subscribe(x => this.offline = x);
      this.networkService.currentStatus.subscribe(result => {
        this.offline = result,
        console.log(this.offline)
      })
  }

  logout() {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
  }
}
