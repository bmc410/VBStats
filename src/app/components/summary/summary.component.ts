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
  statEntry
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
  stats: statEntry[] = [];
  allstats: statEntry[] = [];
  matchgameStats: statEntry[] = [];
  players: PlayerWithId[] = [];
  statviews: statView[] = [];
  match: Match;
  games: number[] = [1, 2, 3, 4, 5];
  selectedgame = 1;
  constructor(
    public route: ActivatedRoute,
    private matchService: MatchService
  )
  {

  }

  matches: any[] = [];

  async ngOnInit() {
    if (this.route.snapshot.params.toString().length)
      this.match = this.route.snapshot.params;

      this.matchService.getstats().subscribe(data => {
        this.allstats = data.map(e => {
          return {
            id: e.payload.doc.id,
            ...e.payload.doc.data()
          } as statEntry;
        })
        this.stats = this.allstats.filter(x => x.matchid == this.match.matchid)
        this.stats = this.stats.filter(x => x.gamenumber == this.selectedgame)

        this.matchService.getPlayers().subscribe(data => {
          this.players = data.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data()
            } as PlayerWithId;
          })
          this.setupStatView();
          this.showData();
        });

      });


      // this.matchService.dbPlayers.subscribe((players) => {
      //   this.players = players;
      //   this.matchService.dbStats.subscribe((statsfromdb) => {
      //   this.allstats = statsfromdb
      //   this.stats = this.allstats.filter(x => x.matchid == this.match.matchid)
      //   this.stats = this.stats.filter(x => x.gamenumber == this.selectedgame)
      //   this.setupStatView();
      //   this.showData();
      //   //console.log(st)
      //   })
      // });





    // let s = await this.matchService.getStats(this.match.matchid)((stats: statEntry[]) => {
    //   this.stats = stats;
    //   this.selectedgame = this.selectedgame
    //   this.setupStatView();
    //   this.showData();
    // });
  }

  showGame(event) {
    this.selectedgame = event.value;
    this.setupStatView();
    this.showData();
  }

  async getPlayers() {
    this.matchService.dbPlayers.subscribe((players) => {
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
      sv.playerid = element.playerid;
      sv.k = 0;
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

  showData() {

    this.stats.forEach(element => {
      if (
        element.matchid == this.match.matchid &&
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
        case 'k':
          this.statviews[index].k += 1;
          break;
        case 'he':
          this.statviews[index].he += 1;
          break;
        case 'b':
          this.statviews[index].b += 1;
          break;
        case 'bt':
          this.statviews[index].bt += 1;
          break;
        case 'be':
          this.statviews[index].be += 1;
          break;
        case 'a':
          this.statviews[index].a += 1;
          break;
        case 'd':
          this.statviews[index].d += 1;
          break;
        case 'bhe':
          this.statviews[index].bhe += 1;
          break;
        case 'sre':
          this.statviews[index].sre += 1;
          break;
        case 'se':
          this.statviews[index].se += 1;
          break;
        default:
          break;
      }

    });








  }
}

