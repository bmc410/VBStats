import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, Subscriber } from "rxjs";
import {
  Match,
  Stat,
  statModel,
  PlayerWithId,
  Player,
  statEntry,
  Game,
  GameWithId,
  MatchWithId,
  PlayerNib,
  CourtPosition,
  PointPlay
} from "../models/appModels";
import Dexie from "dexie";
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { Guid } from "guid-typescript";

import { DexieService } from "./dexie.service";
import * as firebase from "firebase";
import "firebase/firestore";

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
  dbGames: Observable<any>;
  playerCol: AngularFirestoreCollection<PlayerWithId>;
  matchCol: AngularFirestoreCollection<MatchWithId>;
  statCol: AngularFirestoreCollection<statEntry>;
  gameCol: AngularFirestoreCollection<GameWithId>;
  //mappedPos = new Array();

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
    this.dbPlayers = firestore.collection("players").valueChanges();
    this.dbMatches = firestore.collection("matches").valueChanges();
    this.dbStats = firestore.collection("stats").valueChanges();
    this.dbGames = firestore.collection("games").valueChanges();
  }

  private itemDoc: AngularFirestoreDocument<PlayerWithId>;

  private players: PlayerWithId[] = [];
  private matches: MatchWithId[] = [];
  private stats: Stat[] = [];
  private games: GameWithId[] = [];

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
    return this.firestore.collection("matches").snapshotChanges();
    //return this.matchtable.toArray()
  }

  getPlayers() {
    return this.firestore.collection("players").snapshotChanges();
  }

  getstats(g: GameWithId) {
    return this.firestore.collection("games").doc(g.id).collection("stats", ref => ref.orderBy("statdate")).snapshotChanges();
    //return this.firestore.collection("stats").snapshotChanges();
  }

  getPlayByPlay(g: GameWithId) {
    return this.firestore.collection("games").doc(g.id).collection("playbyplay", ref => ref.orderBy("pbpDate")).snapshotChanges();
  }

  getGames() {
    return this.firestore.collection("games").snapshotChanges();
  }

  updatePlayer(p: PlayerWithId) {
    var player = this.firestore.collection("players").doc(p.id);
    return player
    .update({
      jersey: p.jersey,
      firstName: p.firstName,
      lastName: p.lastName,
      islibero: p.islibero,
    })
    .then(function() {
      console.log("Document successfully updated!");
    })
    .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });

  }

  updateMatch(m: MatchWithId) {
    var match = this.firestore.collection("matches").doc(m.id);
    return match
    .update({
      matchdate: m.matchdate,
      opponent: m.opponent,
      home: m.home
    })
    .then(function() {
      console.log("Document successfully updated!");
    })
    .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });

  }

  addPlayByPlay(g: GameWithId, cp: CourtPosition[], stat: string, p: PlayerWithId, action: string = "" ) {
    var action = ""

    switch (stat) {
      case "k":
        action = "Kill by "
        break;
      case "he":
          action = "Attack error by "
          break;
      case "be":
          action = "Block error by "
          break;
      case "bhe":
          action = "Ball handling error by "
          break;
      case "sre":
          action = "Serve receive error by "
          break;
      case "se":
          action = "Service error by "
          break;
      case "te":
          action = "Team error by "
          break;
      default:
        action = action
        break;
    }

    let pbpObj = {
      id: g.id,
      pbpDate: this.datetoepoch(new Date()),
      player: p,
      stattype: stat,
      homescore: g.homescore,
      opponentscore: g.opponentscore,
      action: action,
      rotation: {
        1: cp[1].player.firstName,
        2: cp[2].player.firstName,
        3: cp[3].player.firstName,
        4: cp[4].player.firstName,
        5: cp[5].player.firstName,
        6: cp[6].player.firstName
      },
    }

    return this.createPBPInFirestore(pbpObj);

  }



  updateGame(g: GameWithId, cp: CourtPosition[]) {
    var game = this.firestore.collection("games").doc(g.id);

    // Set the "capital" field of the city 'DC'
    return game
      .update({
        homescore: g.homescore,
        opponentscore: g.opponentscore,
        subs: g.subs,
        rotation: {
          1: cp[1].player.firstName,
          2: cp[2].player.firstName,
          3: cp[3].player.firstName,
          4: cp[4].player.firstName,
          5: cp[5].player.firstName,
          6: cp[6].player.firstName
        },
      })
      .then(function() {
        console.log("Document successfully updated!");
      })
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }

  statsByMatchAndGame() {}

  createPlayerInFirestore(player: any) {
    return this.firestore.collection("players").add(player);
  }
  createMatchInFirestore(match: any) {
    return this.firestore.collection("matches").add(match);
  }
  createStatInFirestore(stat: any, g: GameWithId) {
    return this.firestore.collection("games").doc(g.id).collection("stats").add(stat);
  }
  createGameInFirestore(game: any) {
    return this.firestore.collection("games").add(game);
  }
  createPBPInFirestore(pbp:any) {
    return this.firestore.collection("games").doc(pbp.id).collection("playbyplay").add(pbp);
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


    return this.players;
  }


  createPlayer(jersey: string, fname: string, lname: string) {
    let player = {
      jersey: jersey,
      firstName: fname,
      lastName: lname,
      islibero: false,
      playerid: String(Guid.create())
    };
    return this.createPlayerInFirestore(player);
  }

  createGame(g: GameWithId) {
    let game = {
      gamenumber: g.gamenumber,
      matchid: g.matchid,
      homescore: g.homescore,
      opponentscore: g.opponentscore,
      subs: g.subs
    };
    return this.createGameInFirestore(game);
  }


  getPlayerById(id: number) {
    // let p = this.dbPlayers.
    // this.playertable
    //   .where("playerid")
    //   .equals(id)
    //   .first(data => {
    //     return data;
    //   });
  }

  savePlayer(p: PlayerWithId) {
    if (!p.id) {
      let player = {
        jersey: p.jersey,
        firstName: p.firstName,
        lastName: p.lastName,
        islibero: p.islibero
      };
      this.createPlayerInFirestore(player);
    } else {
      let player = {
        jersey: p.jersey,
        firstName: p.firstName,
        lastName: p.lastName,
        islibero: p.islibero,
        id: p.id
      };
      this.updatePlayer(player);
    }
    //return this.matchtable.add(match);
  }


  saveMatch(m: MatchWithId) {
    let match = {
      home: m.home,
      opponent: m.opponent,
      matchdate: m.matchdate,
    };
    if (m.id === "") {
      let match = {
        home: m.home,
        opponent: m.opponent,
        matchdate: m.matchdate,
      };
      this.createMatchInFirestore(match);
    } else {
      let match = {
        home: m.home,
        opponent: m.opponent,
        matchdate: m.matchdate,
        id: m.id
      };
      this.updateMatch(match);
    }
    //return this.matchtable.add(match);
  }

  deleteMatch(id: string) {
    return;
    //return this.matchtable.delete(id);
  }

  datefromepoch(epoch: any) {
    let x: number = epoch.seconds;
    console.log(epoch);
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(epoch.seconds);
    console.log(d);
    return d;
  }

  datetoepoch(date: Date) {
    return Math.round(date.getTime() / 1000);
  }

  async getMaxStatId() {
    let i = await this.stattable.toCollection().count();
    console.log(i);
    return i;
  }

  async incrementStat(stat: Stat, g: GameWithId) {
    //this.getMaxStatId();
    // let posArray: Array<any>[] = [];
    // //var mappedPos = new map()[];
    // for (let index = 1; index < stat.positions.length; index++) {
    //   const element = stat.positions[index];
    //   var pos = { element.player.id, index };
    //   posArray.push(pos)
    // }
    let statObj = {
      //statorder: await this.getMaxStatId(),
      matchid: stat.matchid,
      gamenumber: stat.gamenumber,
      stattype: stat.stattype,
      homescore: g.homescore,
      opponentscore: g.opponentscore,
      subs: g.subs,
      rotation: {
        1: stat.positions[1].player.firstName,
        2: stat.positions[2].player.firstName,
        3: stat.positions[3].player.firstName,
        4: stat.positions[4].player.firstName,
        5: stat.positions[5].player.firstName,
        6: stat.positions[6].player.firstName
      },
      playerid: stat.player.id,
      //rotation: stat.positions,
      statdate: this.datetoepoch(new Date())
    };
    this.createStatInFirestore(statObj,g);
    //this.stattable.add(statObj);
  }
}
