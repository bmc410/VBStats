import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Match, Stat, statModel, PlayerWithId, Player, statEntry } from "../models/appModels";
import Dexie from "dexie";

import { DexieService } from "./dexie.service";

@Injectable({
  providedIn: "root"
})
export class MatchService {
  matchtable: Dexie.Table<Match, number>;
  playertable: Dexie.Table<PlayerWithId, number>;
  stattable: Dexie.Table<statEntry, number>;


  constructor(private http: HttpClient, private dexieService: DexieService) {
    this.matchtable = this.dexieService.table("match");
    this.playertable = this.dexieService.table("player");
    this.stattable = this.dexieService.table('stat');
    //this.gametable = this.dexieService.table('match');
  }
  private players: PlayerWithId[] = [];
  private matches: Match[] = [];
  private stats: Stat[] = [];
  private db: any;

  addPlayers(): PlayerWithId[] {
    this.players = [];
    this.createPlayer("3", "Ally", "Nadzam");
    this.createPlayer("6", "Sophie", "Rojas");
    this.createPlayer("8", "Abbie", "Shultz");
    this.createPlayer("9", "Lauren", " Gretting");
    this.createPlayer("11", "Maddie", "Geeting");
    this.createPlayer("14", "Roxy", "Ladar");
    this.createPlayer("16", "Gracie", "Singleton");
    this.createPlayer("22", "Megan", "Hoffer");
    this.createPlayer("26", "Kayla", "Unger");
    this.createPlayer("27", "Sydney", "Devine");

    // this.players.forEach(player => {
    //   this.db.player.add(player).then(async () => {});
    // });

    return this.players;
  }

  // createPlayer1(jersey: string, fname: string, lname: string) {
  //   let player = new Player(jersey, fname, lname);
  //   this.players.push(player);
  // }

  createPlayer(jersey: string, fname: string, lname: string) {
    let player = {
      jersey: jersey,
      firstName: fname,
      lastName: lname,
      islibero: false
    };
    return this.playertable.add(player);
  }

  createMatch(home, opponent, matchDate) {
    let match = {
      home: home,
      opponent: opponent,
      matchdate: matchDate
    };
    return this.matchtable.add(match);
  }

  getAllMatches() {
    return this.matchtable.toArray();
  }

  getAllPlayers() {
    return this.playertable.toArray();
  }

  deleteMatch(id: number) {
    return this.matchtable.delete(id);
  }

  async getStats(matchId: number) {
    let stats: statEntry[] = [];
    await this.stattable.each((stat: statEntry) => {
      if (stat.matchid == matchId) {
        stats.push(stat);
      }
    });
    return stats;
  }

  incrementStat(stat: Stat) {
        let insert_object = {
          matchid: stat.matchid,
          gamenumber: stat.gamenumber,
          stattype: stat.stattype,
          pos: stat.positions,
          playerid: stat.player.playerid,
          statdate: new Date()
        };
        this.stattable.add(insert_object);
  }
}
