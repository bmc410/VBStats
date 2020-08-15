import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-mobile-scoreboard',
  templateUrl: './mobile-scoreboard.component.html',
  styleUrls: ['./mobile-scoreboard.component.css']
})
export class MobileScoreboardComponent implements OnInit {

  @Input() homescore: number;
  @Input() opponentscore: number;
  @Output() scorepost = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }


  updateGame(team: string, action: any, stat: string, player: any) {
    let gameScore = {
      team: team,
      action: action,
      stat: stat,
      player: player
    }
    this.scorepost.emit(gameScore);
  }
}
