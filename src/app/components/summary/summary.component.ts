import { Component, OnInit } from "@angular/core";
import {
  CourtPosition,
  Match,
  Stat,
  statView,
  statModel,
  PlayerWithId,
  statEntry,
  gameMatch,
  GameWithId,
  rotation
} from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
import { MenuItem } from "primeng/api/menuitem";
import { Router, ActivatedRoute } from "@angular/router";
import { MatTableDataSource } from '@angular/material/table';
import { NetworkService } from 'src/app/services/network.service';
import { OfflineService } from 'src/app/services/offline.service';
interface Food {
  value: string;
  viewValue: string;
}
export interface PeriodicElement {
  name?: string;
  position?: number;
  weight?: number;
  symbol?: string;
}


@Component({
  selector: "app-summary",
  templateUrl: "./summary.component.html",
  styleUrls: ["./summary.component.css"]
})
export class SummaryComponent implements OnInit {
  pct: number = 0;
  rotations: rotation[] = [];
  stats: statEntry[] = [];
  allstats: statEntry[] = [];
  playbyplay: any[] = [];
  matchgameStats: statEntry[] = [];
  players: PlayerWithId[] = [];
  allPlayers: PlayerWithId[] = [];
  statviews: statView[] = [];
  teamtotal: statView;
  teamtotals: statView[] = []
  match: gameMatch;
  gamesPlayed: GameWithId[] = [];
  selectedGame: GameWithId;
  games: number[] = [1, 2, 3, 4, 5];
  game = 1;
  displayedColumns: string[] = ['home', 'opponent'];
  offline: any;

  playerRotation: any[] = [];

  selectedgame = 1;
  constructor(
    public route: ActivatedRoute,
    private matchService: MatchService,
    private networkService: NetworkService,
    private offlineservice: OfflineService
  ) {
    this.networkService.currentStatus.subscribe(result => {
      this.offline = result
    })
  }

  matches: any[] = [];

  async ngOnInit() {
    if (this.route.snapshot.params.toString().length) {
      this.match = this.route.snapshot.params;
      this.selectedgame = this.match.gameNumber;
    }

    if (this.offline == false) {
      this.matchService.getPlayers().then(result => {
        var json = JSON.stringify(result);
        this.allPlayers = JSON.parse(json)
        this.matchService.getMatchById(this.match.objectId).then(result => {
          var json = JSON.stringify(result);
          var g = JSON.parse(json);
          this.matchService.getPlayersByTeamId(g[0].HomeTeamId).then(result => {
            var json = JSON.stringify(result);
            var g = JSON.parse(json);
            g.forEach(p => {
              this.players.push(this.allPlayers.filter(x => x.objectId == p.PlayerId)[0])
            });
            this.matchService.getstats(this.match.gameId).then(result => {
              var json = JSON.stringify(result);
              this.stats = JSON.parse(json);
              this.matchService.getPlayByPlay(this.match.gameId).then(result => {
                var json = JSON.stringify(result);
                this.playbyplay= JSON.parse(json);
              })
              this.setupStatView();
              this.showData();
            })
          })
        })
      })
    }
    else {
      this.offlineservice.getPlayers().subscribe(result => {
        this.allPlayers = result
        this.offlineservice.getMatchById(this.match.objectId).then(result => {
          var g = result
          this.offlineservice.getPlayersByTeamId(g[0].HomeTeamId).then(result => {
            result.forEach(p => {
              this.players.push(this.allPlayers.filter(x => x.objectId == p.playerid)[0])
            });
            this.offlineservice.getstats(this.match.gameId).then(result => {
              this.stats = result
              this.offlineservice.getPlayByPlayById(this.match.gameId).then(result => {
                this.playbyplay= result
                this.setupStatView();
                this.showData();
              })
            })
          })
        })
      })
    }
  }

  compare(arr1, arr2) {
    if (!arr1 || !arr2) return;
    let result;
    arr1.forEach((e1, i) =>
      arr2.forEach(e2 => {
        if (e1.length > 1 && e2.length) {
          result = this.compare(e1, e2);
        } else if (e1 !== e2) {
          result = false;
        } else {
          result = true;
        }
      })
    );

    return result;
  }

  showGame(event) {
    this.selectedgame = event.value;
    this.selectedGame = this.gamesPlayed.find(
      game =>
        game.gamenumber === event.value.toString() &&
        game.matchid === this.match.objectId
    );
    this.setupStatView();
    if (this.selectedGame) this.showData();
    else {
      this.selectedGame = new GameWithId();
      this.selectedGame.HomeScore = 0;
      this.selectedGame.OpponentScore = 0;
    }
  }

  async getPlayers() {
    this.matchService.dbPlayers.subscribe(players => {
      this.players = players;
      this.setupStatView();
    });
  }

  setupStatView() {
    this.teamtotal = {
      jersey: "",
      firstName: "",
      lastName: "",
      PlayerId: "",
      k: 0,
      h: 0,
      he: 0,
      b: 0,
      bt: 0,
      be: 0,
      a: 0,
      d: 0,
      bhe: 0,
      sre: 0,
      se: 0,
      sa: 0
    }
    this.statviews = [];
    this.teamtotals = [];
    this.matchgameStats = [];
    this.players.forEach(element => {
      let sv = <statView>{};
      sv.firstName = element.FirstName;
      sv.lastName = element.LastName;
      //sv.jersey = element.jersey;
      sv.PlayerId = element.objectId;
      sv.k = 0;
      sv.h = 0;
      sv.a = 0;
      sv.b = 0;
      sv.be = 0;
      sv.bhe = 0;
      sv.bt = 0;
      sv.d = 0;
      sv.he = 0;
      sv.se = 0;
      sv.sre = 0;
      sv.sa = 0;
      this.statviews.push(sv);
    });
  }

  showRotationalData() {
    this.matchgameStats = [];
    this.allstats.forEach(element => {
      if (
        element.matchid == this.match.objectId &&
        element.gamenumber == this.selectedgame
      ) {
        this.matchgameStats.push(element);
      }
    });

    //first get the rotations
    var iRotation = 1;
    this.rotations = [];
    let rotationStrings = "";
    this.matchgameStats.forEach(element => {
      let rotationString = "";
      //var obj = JSON.parse(element.pos)
      //rotationString = iRotation.toString() + ":"
      //for (let index = 1; index < obj.length; index++) {
      //if (iRotation == 1) {
      //const element = <CourtPosition>obj[index];
      //rotationString = rotationString + element.posNo + "," + element.player.id + "|"
      //var rotation: rotation = {}
      //rotation.playerId = element.player.id;
      //rotation.pos = element.posNo
      //this.rotations.push(rotation);
      //}
      //else {
      //  for (let index = 1; index = obj.length; index++) {
      //    const element = obj[index];

      //  }
      // }

      //console.log(this.rotations);
      //this.rotations.push()
      //}
      //rotationStrings = rotationStrings + "\r\n" + rotationString
      iRotation += 1;
    });
    console.log(rotationStrings);
  }

  showData() {
      
    this.stats.forEach(element => {
      const index = this.statviews.findIndex(
        sv => sv.PlayerId === element.PlayerId
      );
      switch (element.StatType) {
        case "k":
          this.statviews[index].k += 1;
          this.teamtotal.k += 1;
          break;
        case "h":
          this.statviews[index].h += 1;
          this.teamtotal.h += 1;
          break;
        case "he":
          this.statviews[index].he += 1;
          this.teamtotal.he += 1;
          break;
        case "b":
          this.statviews[index].b += 1;
          this.teamtotal.b += 1;
          break;
        case "bt":
          this.statviews[index].bt += 1;
          this.teamtotal.bt += 1;
          break;
        case "be":
          this.statviews[index].be += 1;
          this.teamtotal.be += 1;
          break;
        case "a":
          this.statviews[index].a += 1;
          this.teamtotal.a += 1;
          break;
        case "d":
          this.statviews[index].d += 1;
          this.teamtotal.d += 1;
          break;
        case "bhe":
          this.statviews[index].bhe += 1;
          this.teamtotal.bhe += 1;
          break;
        case "sre":
          this.statviews[index].sre += 1;
          this.teamtotal.sre += 1;
          break;
        case "se":
          this.statviews[index].se += 1;
          this.teamtotal.se += 1;
          break;
        case "sa":
            this.statviews[index].sa += 1;
            this.teamtotal.sa += 1;
            break;
        default:
          break;
      }
      this.pct =
        (this.statviews[index].k - this.statviews[index].he) /
        (this.statviews[index].k + this.statviews[index].h);
    });
  }
}
