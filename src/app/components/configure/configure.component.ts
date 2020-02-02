import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import { CarService } from "../../services/carservice";
import { CourtPosition, Match, gameMatch, PlayerWithId } from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
import { MenuItem } from "primeng/api/menuitem";
import { Router } from '@angular/router';

@Component({
  selector: "app-configure",
  templateUrl: "./configure.component.html",
  styleUrls: ["./configure.component.css"]
})
export class ConfigureComponent implements OnInit {
  availableCars: Car[];
  playerPositions: CourtPosition[];
  draggedplayer: PlayerWithId;
  players: PlayerWithId[] = [];
  match: Match = {};
  matches: Match[] = [];
  display: boolean = false;
  matchDate: Date;
  items: MenuItem[];
  games = [
    {label:'1', value:1},
    {label:'2', value:2},
    {label:'3', value:3},
    {label:'4', value:4},
    {label:'5', value:5}
  ];
  game = 1;

  displayDialog: boolean = false;
  selectedMatch: Match;
  newMatch: boolean;
  gameMatch: gameMatch;

  constructor(private matchService: MatchService, private router: Router) {
    this.playerPositions = [];
  }

  showDialog() {
    this.display = true;
  }

  showDialogToAdd() {
    this.matchService.addPlayers();
    this.getPlayers()
    //this.displayDialog = true;
  }

  showMatchDialogToAdd() {
    this.matchService.createMatch("Fusion", "Ballyhoo", new Date());
    this.getMatches();
  }

  onRowSelect(event) {
    this.newMatch = false;
    this.match = this.cloneMatch(event.data);
    this.displayDialog = true;
  }

  start() {
    this.displayDialog = false;
    let gm = new gameMatch();
    gm.gameNumber = this.game;
    gm.home = this.match.home;
    gm.matchdate = this.match.matchdate;
    gm.matchid = this.match.matchid;
    gm.opponent = this.match.opponent;
    this.router.navigate(['match', gm]);
  }

  summary() {
    this.displayDialog = false;
    this.router.navigate(['summary', this.match]);
  }

  cloneMatch(m: Match): Match {
    let match = {};
    for (let prop in m) {
      match[prop] = m[prop];
    }
    return match;
  }

  async getMatches() {
    this.matchService.getAllMatches().then((matches: Match[]) => {
      this.matches = matches;
    });
  }

  async getPlayers() {
    this.matchService.getAllPlayers().then((players: PlayerWithId[]) => {
      this.players = players;
    });
  }

  ngOnInit() {
    //this.matchService.createMatch("Fusion", "Ballyhoo", new Date());
    //this.matchService.addPlayers();

    this.getMatches();
    this.getPlayers()
  };

  delete() {
    this.matchService.deleteMatch(this.match.matchid).then(() => {
      this.getMatches();
    });
    this.displayDialog = false;
  }

  save() {
    this.matchService
      .createMatch(this.match.home, this.match.opponent, this.match.matchdate)
      .then(() => {
        this.getMatches();
      })
    this.displayDialog = false;
  }
}
