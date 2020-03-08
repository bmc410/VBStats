import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {

  homescore: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  updateGame() {
    this.homescore += 1;
  }

}
