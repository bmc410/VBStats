import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import { CarService } from "../../services/carservice";
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
  matchgameStats: statEntry[] = [];
  players: PlayerWithId[] = [];
  statviews: statView[] = [];
  match: gameMatch;
  gamesPlayed: GameWithId[] = [];
  selectedGame: GameWithId;
  games: number[] = [1, 2, 3, 4, 5];
  game = 1;

  playerRotation: any[] = [];

  selectedgame = 1;
  constructor(
    public route: ActivatedRoute,
    private matchService: MatchService
  ) {}

  matches: any[] = [];

  async ngOnInit() {
    if (this.route.snapshot.params.toString().length) {
      this.match = this.route.snapshot.params;
      this.selectedgame = this.match.gameNumber;
    }

    this.matchService.getGames().subscribe(data => {
      this.gamesPlayed = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as {})
        } as GameWithId;
      });
      this.selectedGame = this.gamesPlayed.find(
        game =>
          game.gamenumber === this.match.gameNumber &&
          game.matchid === this.match.id
      );

      this.matchService.getstats(this.selectedGame).subscribe(data => {
        this.allstats = data.map(e => {
          return {
            id: e.payload.doc.id,
            ...(e.payload.doc.data() as {})
          } as any;
        });
        this.stats = this.allstats.filter(x => x.matchid == this.match.id);
        this.stats = this.stats.filter(x => x.gamenumber == this.selectedgame);

        this.matchService.getPlayers().subscribe(data => {
          this.players = data.map(e => {
            return {
              id: e.payload.doc.id,
              ...(e.payload.doc.data() as {})
            } as PlayerWithId;
          });
          this.setupStatView();
          this.showData();
          this.showRotationalData();

          var statIndex = 0;
          for (let index = 0; index < this.stats.length; index++) {
            var pArray = [];
            for (let rotationIndex = 1; rotationIndex < 7; rotationIndex++) {
              pArray.push(this.stats[index].rotation[rotationIndex]);
            }
            if (statIndex == 0) {
              this.playerRotation.push(pArray);
            } else {
              var found = false;
              this.playerRotation.forEach(element => {
                if (element[0] === pArray[0] && element[1] === pArray[1]
                  && element[2] === pArray[2] && element[3] === pArray[3]
                  && element[4] === pArray[4] && element[5] === pArray[5]
                  && element[6] === pArray[6]) {
                    found = true
                  }
              });
              if(!found) {
                this.playerRotation.push(pArray);
              }
            }
            statIndex += 1;
          }
          console.log(this.playerRotation);
        });
      });
    });
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
        game.matchid === this.match.id
    );
    this.setupStatView();
    if (this.selectedGame) this.showData();
    else {
      this.selectedGame = new GameWithId();
      this.selectedGame.homescore = 0;
      this.selectedGame.opponentscore = 0;
    }
  }

  async getPlayers() {
    this.matchService.dbPlayers.subscribe(players => {
      this.players = players;
      this.setupStatView();
    });
  }

  setupStatView() {
    this.statviews = [];
    this.matchgameStats = [];
    this.players.forEach(element => {
      let sv = <statView>{};
      sv.firstName = element.firstName;
      sv.lastName = element.lastName;
      sv.jersey = element.jersey;
      sv.playerid = element.id;
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
      this.statviews.push(sv);
    });
  }

  showRotationalData() {
    this.matchgameStats = [];
    this.allstats.forEach(element => {
      if (
        element.matchid == this.match.id &&
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
    this.allstats.forEach(element => {
      if (
        element.matchid == this.match.id &&
        element.gamenumber == this.selectedgame
      ) {
        this.matchgameStats.push(element);
      }
    });

    this.matchgameStats.forEach(element => {
      const index = this.statviews.findIndex(
        sv => sv.playerid === element.playerid
      );
      switch (element.stattype) {
        case "k":
          this.statviews[index].k += 1;
          break;
        case "h":
          this.statviews[index].h += 1;
          break;
        case "he":
          this.statviews[index].he += 1;
          break;
        case "b":
          this.statviews[index].b += 1;
          break;
        case "bt":
          this.statviews[index].bt += 1;
          break;
        case "be":
          this.statviews[index].be += 1;
          break;
        case "a":
          this.statviews[index].a += 1;
          break;
        case "d":
          this.statviews[index].d += 1;
          break;
        case "bhe":
          this.statviews[index].bhe += 1;
          break;
        case "sre":
          this.statviews[index].sre += 1;
          break;
        case "se":
          this.statviews[index].se += 1;
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
