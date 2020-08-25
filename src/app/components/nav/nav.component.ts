import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  home = "";
  opponent = "";
  homescore = 0;
  opponentscore = 0;
  currentUser: any;
  offline: boolean;

  constructor( private router: Router,
    private networkService: NetworkService,
    private authenticationService: AuthenticationService) { 
      
    }

  ngOnInit() {
    let _this = this
    this.networkService.currentStatus.subscribe(result => {
      _this.offline = result
    })
    this.authenticationService.currentUser.subscribe(x => {
        _this.currentUser = x
    })
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  config() {
    this.router.navigate(['/configure']);
  }
}
