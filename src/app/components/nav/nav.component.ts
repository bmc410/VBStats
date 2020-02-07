import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
  }

}
