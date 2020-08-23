import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faCoffee, faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {
  faPlus = faPlus;
  faMinus=faMinus;
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
