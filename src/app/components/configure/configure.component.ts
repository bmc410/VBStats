import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import { CarService } from "../../services/carservice";
import {
  CourtPosition,
  Match,
  gameMatch,
  PlayerWithId,
  Player,
  MatchWithId
} from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
import { MenuItem } from "primeng/api/menuitem";
import { Router } from "@angular/router";
import { ConnectionService } from "ng-connection-service";
import {FormControl} from '@angular/forms';

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
  match: MatchWithId = {};
  player: Player = {};
  matches: Match[] = [];
  display: boolean = false;
  matchDate: Date;
  items: MenuItem[];
  games = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 }
  ];
  game = 1;

  dialogHome: string
  dilogOpponent: string
  dialogGameDate: Date
  dialogGame: number
  dialogMatchId: string

  matchDialogDisplay: boolean = false;
  playerDialogDisplay: boolean = false;
  selectedMatch: Match;
  selectedPlayer: Player;
  newMatch: boolean;
  newPlayer: boolean;
  gameMatch: gameMatch;
  status = "ONLINE";
  isConnected = true;
  matchsubcription: any;
  gameDate = new FormControl(new Date());

  constructor(
    private matchService: MatchService,
    private router: Router,
    private connectionService: ConnectionService
  ) {
    this.playerPositions = [];
  }

  showDialog() {
    this.display = true;
  }
  showPlayerDialog() {
    this.newPlayer = false;
    this.player = new PlayerWithId("","","",false,)
    this.playerDialogDisplay = true;
    //this.matchService.addPlayers();
    //this.getPlayers()
  }

  onPlayerSelect(event) {
    this.newPlayer = false;
    this.player = this.clonePlayer(event.data);
    this.playerDialogDisplay = true;
  }



  showDialogToAdd() {

    //this.matchService.addPlayers();
    //this.getPlayers()
    //this.displayDialog = true;
  }



  start() {
    this.matchDialogDisplay = false;
    let gm = new gameMatch();
    gm.gameNumber = this.game;
    gm.home = this.match.home;
    gm.matchdate = this.match.matchdate;
    gm.id = this.match.id;
    gm.opponent = this.match.opponent;
    this.router.navigate(["match", gm]);
  }

  summary() {
    this.matchDialogDisplay = false;
    let gm = new gameMatch();
    gm.gameNumber = this.game;
    gm.home = this.match.home;
    gm.matchdate = this.match.matchdate;
    gm.id = this.match.id;
    gm.opponent = this.match.opponent;
    this.router.navigate(["summary", gm]);
  }

  cloneMatch(m: Match): Match {
    let match = {};
    for (let prop in m) {
      match[prop] = m[prop];
    }
    return match;
  }

  clonePlayer(p: Player): Player {
    let player = {};
    for (let prop in p) {
      player[prop] = p[prop];
    }
    return player;
  }

  setGame(n) {
    this.game = n
  }

  // async getMatches() {
  //   this.matches = await  this.matchService.getMatches()
  // }

  // async getPlayers() {
  //   this.players = await  this.matchService.getPlayers()
  // }

  ngOnDestroy() {
    //this.matchsubcription.unsubscribe();
    //this.matchService.dbMatches.unsubscribe();
    //this.connectionService.monitor().unsubscribe();
  }

  ngOnInit() {
    //this.matchService.createMatch("Fusion", "Ballyhoo", new Date());
    //this.matchService.addPlayers();

    this.matchService.getMatches().subscribe(data => {
      this.matches = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as {}
        } as Match;
      })
      for (let index = 0; index < this.matches.length; index++) {
        this.matches[index].displaydate = this.matchService.datefromepoch(this.matches[index].matchdate)
      }
    });

    this.matchService.getPlayers().subscribe(data => {
      this.players = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as {}
        } as PlayerWithId;
      })
    });
  }

  SavePlayer() {
    let p = new PlayerWithId("","","",false)
    p.jersey = this.player.jersey
    p.firstName = this.player.firstName
    p.lastName = this.player.lastName
    p.islibero = this.player.islibero
    this.matchService.savePlayer(p)
    this.playerDialogDisplay = false;
  }

  DeletePlayer() {

  }
  AddMatch() {
    this.dialogHome = ""
    this.dilogOpponent = ""
    this.gameDate.setValue(new Date)
    this.dialogMatchId = ""
    this.matchDialogDisplay = true;
    //this.matchService.createMatch("Fusion", "Ballyhoo", new Date());
    //this.getMatches();
  }

  DeleteMatch() {
    // this.matchService.deleteMatch(this.match.matchid).then(() => {
    //   this.getMatches();
    // });
    this.matchDialogDisplay = false;
  }

  onRowSelect(event) {
    this.dialogHome = event.data.home
    this.dilogOpponent = event.data.opponent
    this.gameDate.setValue(this.matchService.datefromepoch(event.data.matchdate))
    this.dialogMatchId = event.data.id
    this.match = event.data
    this.matchDialogDisplay = true;
    this.newMatch = false;
  }

  SaveMatch() {
    let match = new MatchWithId()
    match.matchdate = this.gameDate.value
    match.id = this.dialogMatchId
    match.opponent = this.dilogOpponent
    match.home = this.dialogHome
    this.matchService.saveMatch(match)
    this.matchDialogDisplay = false;
  }
}
