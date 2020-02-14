import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import { CarService } from "../../services/carservice";
import {
  CourtPosition,
  Match,
  gameMatch,
  PlayerWithId,
  Player
} from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
import { MenuItem } from "primeng/api/menuitem";
import { Router } from "@angular/router";
import { ConnectionService } from "ng-connection-service";

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

  displayDialog: boolean = false;
  playerDialog: boolean = false;
  selectedMatch: Match;
  selectedPlayer: Player;
  newMatch: boolean;
  newPlayer: boolean;
  gameMatch: gameMatch;
  status = "ONLINE";
  isConnected = true;
  matchsubcription: any;

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
    this.matchService.addPlayers();
    //this.getPlayers()
  }

  onPlayerSelect(event) {
    let t = this.matchService.getPlayerById(1);

    this.newPlayer = false;
    this.player = this.clonePlayer(event.data);
    this.playerDialog = true;
  }

  onRowSelect(event) {
    this.newMatch = false;
    this.match = this.cloneMatch(event.data);
    this.displayDialog = true;
  }
  showDialogToAdd() {
    this.matchService.addPlayers();
    //this.getPlayers()
    //this.displayDialog = true;
  }

  showMatchDialogToAdd() {
    this.matchService.createMatch("Fusion", "Ballyhoo", new Date());
    //this.getMatches();
  }

  start() {
    this.displayDialog = false;
    let gm = new gameMatch();
    gm.gameNumber = this.game;
    gm.home = this.match.home;
    gm.matchdate = this.match.matchdate;
    gm.matchid = this.match.matchid;
    gm.opponent = this.match.opponent;
    this.router.navigate(["match", gm]);
  }

  summary() {
    this.displayDialog = false;
    let gm = new gameMatch();
    gm.gameNumber = this.game;
    gm.home = this.match.home;
    gm.matchdate = this.match.matchdate;
    gm.matchid = this.match.matchid;
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

    // this.matchsubcription = this.matchService.playertable.subscribe(players => {
    //   this.players = players;
    //   this.matchService.matchtable.subscribe(matches => {
    //     for (let index = 0; index < matches.length; index++) {
    //       matches[index].matchdate = this.matchService.datefromepoch(
    //         matches[index].matchdate
    //       );
    //     }
    //     this.matches = matches;

    //   //   this.connectionService.monitor().subscribe(isConnected => {
    //   //     this.isConnected = isConnected;
    //   //     if (this.isConnected) {
    //   //       this.status = "ONLINE";
    //   //     } else {
    //   //       this.status = "OFFLINE";
    //   //     }
    //   //     console.log(this.status);
    //   //   });

    //   });
    // });

  }

  delete() {
    // this.matchService.deleteMatch(this.match.matchid).then(() => {
    //   this.getMatches();
    // });
    this.displayDialog = false;
  }

  save() {
    this.matchService
      .createMatch(this.match.home, this.match.opponent, this.match.matchdate)
      .then(() => {
        //this.getMatches();
      });
    this.displayDialog = false;
  }
}
