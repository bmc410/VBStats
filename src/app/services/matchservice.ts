import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import {
  Match,
  Stat,
  statModel,
  PlayerWithId,
  Player,
  statEntry,
  Game,
  GameWithId
} from "../models/appModels";
import Dexie from "dexie";
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { Guid } from "guid-typescript";

import { DexieService } from "./dexie.service";
import * as firebase from 'firebase';
import 'firebase/firestore';

@Injectable({
  providedIn: "root"
})
export class MatchService {
  matchtable: Dexie.Table<Match, number>;
  playertable: Dexie.Table<PlayerWithId, number>;
  stattable: Dexie.Table<statEntry, number>;
  gametable: Dexie.Table<GameWithId, number>;
  items: Observable<any[]>;
  dbPlayers: Observable<any>;
  dbMatches: Observable<any>;
  dbStats: Observable<any>;
  playerCol: AngularFirestoreCollection<PlayerWithId>;
  matchCol: AngularFirestoreCollection<Match>;
  statCol: AngularFirestoreCollection<statEntry>;

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient,
    private dexieService: DexieService
  ) {
    this.matchtable = this.dexieService.table("match");
    this.playertable = this.dexieService.table("player");
    this.stattable = this.dexieService.table("stat");
    this.gametable = this.dexieService.table("game");
    this._gameData$ = new BehaviorSubject(null);
    this.dbPlayers = firestore.collection('players').valueChanges();
    this.dbMatches = firestore.collection('matches').valueChanges();
    this.dbStats = firestore.collection("stats").valueChanges();
  }

  private itemDoc: AngularFirestoreDocument<PlayerWithId>;

  private players: PlayerWithId[] = [];
  private matches: Match[] = [];
  private stats: Stat[] = [];
  //private db: any;
  //private _gamewithId: GameWithId;
  //public game: BehaviorSubject<GameWithId> = new BehaviorSubject<GameWithId>({});

  private _gameData$: BehaviorSubject<GameWithId>;
  public _gameData: GameWithId;

  get gameData$() {
    return this._gameData$.asObservable();
  }

  updatedGameSelection(data: GameWithId) {
    this._gameData$.next(data);
  }

  getMatches() {
    return this.firestore.collection('matches').snapshotChanges();
    //return this.matchtable.toArray()
  }

  getPlayers() {
    return this.firestore.collection('players').snapshotChanges();
  }

  getstats() {
    return this.firestore.collection('stats').snapshotChanges();
  }

  statsByMatchAndGame() {

  }

  createPlayerInFirestore(player: any) {
    return this.firestore.collection("players").add(player);
  }
  createMatchInFirestore(match: any) {
    return this.firestore.collection("matches").add(match);
  }
  createStatInFirestore(stat: any) {
    return this.firestore.collection("stats").add(stat);
  }

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
      islibero: false,
      playerid: String(Guid.create())
    };
    this.createPlayerInFirestore(player);
    return this.playertable.add(player);
  }

  getPlayerById(id: number) {
    this.playertable
      .where("playerid")
      .equals(id)
      .first(data => {
        return data;
      });
  }

  updateGame(id, data) {
    this.gametable.update(id, data);
    this.updatedGameSelection(data);
  }

  getGameByNumber(id: number, matchId: string) {
    var d: GameWithId;
    this.gametable
      .where({
        gamenumber: Number.parseInt(id.toString()),
        matchid: Number.parseInt(matchId.toString())
      })
      .first(data => {
        d = data;
        if (!d) {
          this.createGame(id, matchId, 0, 0);
          this.gametable
            .where({
              gamenumber: Number.parseInt(id.toString()),
              matchid: Number.parseInt(matchId.toString())
            })
            .first(data => {
              this.updatedGameSelection(data);
              //console.log(data);
            });
        } else {
          this.updatedGameSelection(d);
        }
        //this.updatedGameSelection(d);
        //return d;
      });
  }

  createGame(gameNumber, matchId, hScore, oScore) {
    let game = {
      gamenumber: +gameNumber,
      matchid: +matchId,
      homescore: +hScore,
      opponentscore: +oScore,
      lastupdate: new Date()
    };
    this.gametable.add(game);
  }

  createMatch(home, opponent, matchDate) {
    let match = {
      home: home,
      opponent: opponent,
      matchdate: this.datetoepoch(matchDate),
      matchid: String(Guid.create())
    };
    this.createMatchInFirestore(match);
    return this.matchtable.add(match);
  }

  deleteMatch(id: string) {
    return;
    //return this.matchtable.delete(id);
  }

  datefromepoch(epoch: any) {
    let x: number = epoch
    console.log(epoch)
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(epoch.seconds)
    console.log(d)
    return d
  }

  datetoepoch(date: Date) {
    return Math.round(date.getTime() / 1000);
  }

  // async getStats(matchId: string) {
  //   let stats: statEntry[] = [];
  //   if (navigator.onLine) {
  //     await this.dbStats.subscribe(data => {
  //       stats = data;
  //     });
  //   } else {
  //     await this.stattable.each((stat: statEntry) => {
  //       if (stat.matchid == matchId) {
  //         stats.push(stat);
  //       }
  //     });
  //     return stats;
  //   }
  // }

  async getMaxStatId() {
    let i = await this.stattable.toCollection().count();
    console.log(i);
    return i;
  }

  async incrementStat(stat: Stat) {
    //this.getMaxStatId();
    let statObj = {
      //statorder: await this.getMaxStatId(),
      matchid: stat.matchid,
      gamenumber: stat.gamenumber,
      stattype: stat.stattype,
      pos: JSON.stringify(stat.positions),
      playerid: stat.player.playerid,
      statdate: this.datetoepoch(new Date())
    };
    this.createStatInFirestore(statObj);
    this.stattable.add(statObj);
  }
}
