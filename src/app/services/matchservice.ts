import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Player, Match, Stat } from "../models/appModels";
import Dexie from "dexie";

@Injectable({
  providedIn: "root"
})
export class MatchService {
  constructor(private http: HttpClient) {
    this.createDatabase();
  }
  private players: Player[] = [];
  private matches: Match[] = [];
  private stats: Stat[] = [];
  private db: any;

  private createDatabase() {
    this.db = new Dexie("GameMatchStat");
    this.db.version(1).stores({
      match: "++matchid,home,opponent,matchdate",
      player: "++playerid,jersey,firstName,lastName",
      stat: "++statid,matchid,gamenumber,stattype,pos,playerid,stattime,date"
    });
  }

  addPlayers(): Player[] {
    this.players = [];
    this.createPlayer("3", "Ally", "Nadzam");
    this.createPlayer("6", "Sophie", "Rojas");
    this.createPlayer("8", "Abbie", "Shultz");
    this.createPlayer("9", "Lauren", " Gretting");
    this.createPlayer("11", "Maddie", "Geeting");
    this.createPlayer("12", "Aubrie", "Thorne");
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

  createPlayer(jersey: string, fname: string, lname: string) {
    let player = new Player(jersey, fname, lname);
    this.players.push(player);
  }

  createMatch() {
    this.db
      .transaction("rw", this.db.match, function() {
        // Let's add some data to db:
        let insert_object = {
          home: "Fusion",
          opponent: "Ballyhoo",
          matchdate: new Date()
        };
        this.db.match.add(insert_object);
      })
      .catch(function(err) {
        console.error(err.stack || err);
      });
  }

  getAllMatches() {
    return this.db.table("match").toArray();
  }
}
