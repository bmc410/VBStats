import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faCoffee, faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-mobile-scoreboard',
  templateUrl: './mobile-scoreboard.component.html',
  styleUrls: ['./mobile-scoreboard.component.css']
})
export class MobileScoreboardComponent implements OnInit {
  faPlus = faPlus;
  faMinus=faMinus;
  @Input() homescore: number;
  @Input() opponentscore: number;
  @Output() scorepost = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  postSign(e) {
    this.updateGame(e.team, e.action, e.stat, e.player)
    console.log(e)
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
