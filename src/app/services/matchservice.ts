import { Injectable, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, Subscriber, of, from } from "rxjs";
import { map } from 'rxjs/operators';
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
  PointPlay,
  TeamWithId,
  TeamPlayer,
  pbpPosition
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
import { MessageService } from 'primeng/api';
import { Action } from 'rxjs/internal/scheduler/Action';
import { Parse } from 'parse';
//import { url } from 'inspector';


@Injectable({
  providedIn: "root"
})
export class MatchService  {
  //matchtable: Dexie.Table<Match, number>;
  playertable: Dexie.Table<PlayerWithId, number>;
  stattable: Dexie.Table<statEntry, number>;
  gametable: Dexie.Table<GameWithId, number>;
  items: Observable<any[]>;
  dbPlayers: Observable<any>;
  dbMatches: Observable<any>;
  dbStats: Observable<any>;
  dbGames: Observable<any>;
  dbTeams: Observable<any>;
  playerCol: AngularFirestoreCollection<PlayerWithId>;
  matchCol: AngularFirestoreCollection<MatchWithId>;
  statCol: AngularFirestoreCollection<statEntry>;
  gameCol: AngularFirestoreCollection<GameWithId>;
  teamCol: AngularFirestoreCollection<TeamWithId>;
  match: Match[] = [];

  //mappedPos = new Array();

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient,
    private dexieService: DexieService,
    private messageService: MessageService
  ) {
    //this.matchtable = this.dexieService.table("match");
    this.playertable = this.dexieService.table("player");
    this.stattable = this.dexieService.table("stat");
    this.gametable = this.dexieService.table("game");
    this._gameData$ = new BehaviorSubject(null);
    this.dbPlayers = firestore.collection("players").valueChanges();
    this.dbMatches = firestore.collection("matches").valueChanges();
    this.dbStats = firestore.collection("stats").valueChanges();
    this.dbGames = firestore.collection("games").valueChanges();
    this.dbTeams = firestore.collection("teams").valueChanges();
    this.initParse()
  }

  private itemDoc: AngularFirestoreDocument<PlayerWithId>;

  private players: PlayerWithId[] = [];
  private matches: MatchWithId[] = [];
  private stats: Stat[] = [];
  private games: GameWithId[] = [];
  private teams: TeamWithId[] = [];

  //private db: any;
  //private _gamewithId: GameWithId;
  //public game: BehaviorSubject<GameWithId> = new BehaviorSubject<GameWithId>({});

  private _gameData$: BehaviorSubject<GameWithId>;
  public _gameData: GameWithId;

  initParse() {
    Parse.serverURL = 'https://parseapi.back4app.com'; // This is your Server URL
    Parse.initialize(
      '6jtb78oSAiGeNv2mcJTN0h039TxkJh4HDrWBz7RT', // This is your Application ID
      'bRolkvWkFSewPWnlqQOaaRTpgT16ILr6r7PnU6AY', // This is your Javascript key
      'dHvEstEM97ue9pBcTcW8ofNyqS2ERqT7kg4CnYhX' // This is your Master key (never use it in the frontend)
    );
  }

  get gameData$() {
    return this._gameData$.asObservable();
  }

  updatedGameSelection(data: GameWithId) {
    this._gameData$.next(data);
  }

  getMatches() {
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    return from(query.find()).pipe(map(result => result));
  }

  getPlayerById(id: string) {
    const Players = Parse.Object.extend('Players');
    const query = new Parse.Query(Players);
    query.equalTo("objectId", id);
    return from(query.find()).pipe(map(result => result));
    //return this.firestore.collection("players").snapshotChanges();
  }

  getPlayers() {
    const Players = Parse.Object.extend('Players');
    const query = new Parse.Query(Players);
    return from(query.find()).pipe(map(result => result));
  }

  getstats(id: string) {
    const Stats = Parse.Object.extend('Stats');
    const query = new Parse.Query(Stats);
    query.equalTo("GameId", id);
    query.ascending("createdAt");
    return from(query.find()).pipe(map(result => result));
    
    //return this.firestore.collection("games").doc(g.id).collection("stats", ref => ref.orderBy("statdate")).snapshotChanges();
    //return this.firestore.collection("stats").snapshotChanges();
  }

  getPlayByPlay(g: GameWithId) {
    return this.firestore.collection("games").doc(g.objectId).collection("playbyplay", ref => ref.orderBy("pbpDate", "desc")).snapshotChanges();
  }

  getPlayersFromRoster(playerNumbers: Array<any>) {
    const Players = Parse.Object.extend('Players');
    const query1 = new Parse.Query(Players);
    query1.containedIn("objectId", playerNumbers);
    return from(query1.find()).pipe(map(result => result));
  }

  getPlayersByTeamId(teamId: string){
    const Teams = Parse.Object.extend('Teams')
    const query = new Parse.Query(Teams);
    query.equalTo("objectId", teamId);
    query.include("Players");
    return from(query.find()).pipe(map(result => result));
    
  }

  getGamesForMatch(matchId: string) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    query.equalTo("MatchId", matchId);
    return from(query.find()).pipe(map(result => result));
    //return this.firestore.collection("games").snapshotChanges();
  }

  getGameById(gameId: string) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    query.equalTo("objectId", gameId);
    return from(query.find()).pipe(map(result => result));
    //return this.firestore.collection("games").snapshotChanges();
  }

  getGameForMatchByNumber(matchId: string, gameNumber: number) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    query.equalTo("MatchId", matchId);
    query.equalTo("GameNumber", Number(gameNumber));
    return from(query.find()).pipe(map(result => result));
    //return this.firestore.collection("games").snapshotChanges();
  }

  getTeams() {
    return this.firestore.collection("teams").snapshotChanges();
  }

  updatePlayer(p: PlayerWithId) {
    var player = this.firestore.collection("players").doc(p.objectId);
    return player
    .update({
      jersey: p.jersey,
      firstName: p.FirstName,
      lastName: p.LastName,
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
    var match = this.firestore.collection("matches").doc(m.objectId);
    return match
    .update({
      matchdate: m.MatchDate,
      opponent: m.Opponent,
      home: m.Home
    })
    .then(function() {
      console.log("Document successfully updated!");
    })
    .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });

  }

  courtPositionToArray(cp: CourtPosition[]) {

  }

  getActionFromStat(stat:string) {
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
          action = "Team error"
          break;
      case "tp":
            action = "Team point"
          break;
      case "sa":
          action = "Service ace by "
          break;
      default:
        action = action
        break;
    }
    return action
  }

  addPlayByPlay(g: GameWithId, cp: CourtPosition[], stat: string, p: PlayerWithId[], action: string = "" ) {
    var action = ""
    var rotations: pbpPosition[] = [];
    let pos = cp;
    if (stat === "start") {
      action = "Start [" + cp[1].player.FirstName + ", "
      + cp[2].player.FirstName + ", " + cp[3].player.FirstName + ", "
      + cp[4].player.FirstName + ", " + cp[5].player.FirstName + ", "
      + cp[6].player.FirstName + "]"
    } else if (stat === "sub") {
      action = "Sub [" + p[0].FirstName + " for " + p[1].FirstName +  "]"
    } else {
      action = this.getActionFromStat(stat) + p[0].FirstName + ' ' + p[0].LastName;
    }

    var player = null;
    var objId = null
    if (p != null) {
      player = p[0];
      objId = player.objectId;
    }

    let pbpObj = {
      id: g.objectId,
      pbpDate: this.datetoepoch(new Date()),
      player: player,
      stattype: stat,
      homescore: g.HomeScore,
      opponentscore: g.OpponentScore,
      action: action,
      rotation: {
        1: cp[1].player.FirstName,
        2: cp[2].player.FirstName,
        3: cp[3].player.FirstName,
        4: cp[4].player.FirstName,
        5: cp[5].player.FirstName,
        6: cp[6].player.FirstName
      },
    }

    pos = pos.splice(1, 6);
    var j = JSON.stringify(pos);
    var d = JSON.parse(j);
    d.forEach(element => {
      let r = new pbpPosition();
      r.posNo = element.posNo;
      r.playerName = element.player.FirstName;
      rotations.push(r);
    });

    var jR = JSON.stringify(rotations);    
    const PlayByPlay = Parse.Object.extend('PlayByPlay');
    const myNewObject = new PlayByPlay();

    myNewObject.set('action', action);
    myNewObject.set('homescore', g.HomeScore);
    myNewObject.set('opponentscore', g.OpponentScore);
    myNewObject.set('playerId', objId);
    myNewObject.set('stattype', stat);
    myNewObject.set('rotation', jR);

    myNewObject.save();
    //this.messageService.add({severity:'success', summary:'Service Message', detail:'Via MessageService'});
    //return this.createPBPInFirestore(pbpObj);

  }

  upDateTeam(t: TeamWithId) {
    var team = this.firestore.collection("teams").doc(t.id);

    return team
    .update({
      teamName: t.TeamName
    })
    .then(function() {
      console.log("Document successfully updated!");
    })
    .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });

  }


  updateGame(g: GameWithId) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    // here you put the objectId that you want to update
    return from(query.get(g.objectId).then((object) => {
      object.set('HomeScore', g.HomeScore);
      object.set('OpponentScore', g.OpponentScore);
      object.set('Subs', g.subs);
      object.save();
    }));
  }

  statsByMatchAndGame() {}

  createPlayerInFirestore(player: any) {
    return this.firestore.collection("players").add(player);
  }
  createMatchInFirestore(match: any) {
    return this.firestore.collection("matches").add(match);
  }
  createStat(stat: any, g: GameWithId) {
    var rotations: pbpPosition[] = [];
    // let pos = stat.rotation;

    // pos = pos.splice(1, 6);
    // var j = JSON.stringify(pos);
    // var d = JSON.parse(j);
    // d.forEach(element => {
    //   let r = new pbpPosition();
    //   r.posNo = element.posNo;
    //   r.playerName = element.player.FirstName;
    //   rotations.push(r);
    // });

    var jr = JSON.stringify(stat.rotation);   
    const Stats = Parse.Object.extend('Stats');
    const myNewObject = new Stats();
    myNewObject.set('GameId', g.objectId);
    myNewObject.set('HomeScore', g.HomeScore);
    myNewObject.set('OpponentScore', g.OpponentScore);
    myNewObject.set('PlayerId', stat.playerid);
    myNewObject.set('StatType', stat.stattype);
    myNewObject.set('Subs', g.subs);
    myNewObject.set('Rotation', jr);

    myNewObject.save()
    //return this.firestore.collection("games").doc(g.objectId).collection("stats").add(stat);
  }
  createGameInFirestore(game: any) {
    return this.firestore.collection("games").add(game);
  }
  createPBPInFirestore(pbp:any) {
    return this.firestore.collection("games").doc(pbp.id).collection("playbyplay").add(pbp);
  }
  createTeamInFirestore(team:any) {
    return this.firestore.collection("teams").doc(team.id).collection("team").add(team);
  }
  AddPlayerToFirestoreTeam(team:any, tp: TeamPlayer) {
    return this.firestore.collection("teams").doc(team.id).collection("players").add(tp);
  }
  RemovePlayerFromFirestoreTeam(team:any, tpId: string) {
    return this.firestore.collection("teams").doc(team.id).collection("players").doc(tpId).delete();
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
    const Games = Parse.Object.extend('Games');
    const newGame = new Games();

    newGame.set('GameNumber', Number(g.gamenumber));
    newGame.set('MatchId', g.matchid);
    newGame.set('HomeScore', g.HomeScore);
    newGame.set('OpponentScore', g.OpponentScore);
    newGame.set('Subs', g.subs);

    return from(newGame.save()).pipe(map(result => result));;
   
  }

  createTeam(t: TeamWithId) {
    let team = {
      teamName: t.TeamName
    };
    return this.createTeamInFirestore(team);
  }
 
  saveTeam(t: TeamWithId) {
    if (!t.id) {
      let team = {
        TeamName: t.TeamName
      };
      this.createTeamInFirestore(t);
    } else {
      let team = {
        TeamName: t.TeamName,
        id: t.id
      };
      this.upDateTeam(team)
    }
  }

  savePlayer(p: PlayerWithId) {
    if (!p.objectId) {
      let player = {
        jersey: p.jersey,
        firstName: p.FirstName,
        lastName: p.LastName,
        islibero: p.islibero
      };
      this.createPlayerInFirestore(player);
    } else {
      let player = {
        jersey: p.jersey,
        firstName: p.FirstName,
        lastName: p.LastName,
        islibero: p.islibero,
        id: p.objectId
      };
      this.updatePlayer(player);
    }
    //return this.matchtable.add(match);
  }


  saveMatch(m: MatchWithId) {
    let match = {
      home: m.Home,
      opponent: m.Opponent,
      matchdate: m.MatchDate,
    };
    if (m.objectId === "") {
      let match = {
        home: m.Home,
        opponent: m.Opponent,
        matchdate: m.MatchDate,
      };
      this.createMatchInFirestore(match);
    } else {
      let match = {
        Home: m.Home,
        Opponent: m.Opponent,
        MatchDate: m.MatchDate,
        objectId: m.objectId
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

    var rotations: pbpPosition[] = [];
    for (let index = 1; index < 7; index++) {
      let p = new pbpPosition();
      p.playerName = stat.positions[index].player.FirstName;
      p.posNo = index;
      p.objectId = stat.positions[index].player.objectId
      rotations.push(p);
    }

    let statObj = {
      //statorder: await this.getMaxStatId(),
      matchid: stat.matchid,
      gamenumber: stat.gamenumber,
      stattype: stat.stattype,
      homescore: g.HomeScore,
      opponentscore: g.OpponentScore,
      subs: g.subs,
      rotation: rotations,
      playerid: stat.player.objectId,
      //rotation: stat.positions,
      statdate: this.datetoepoch(new Date())
    };
    this.createStat(statObj,g);
    this.messageService.add({severity:'success', summary:'Service Message', detail:this.getActionFromStat(stat.stattype) + stat.player.FirstName});
    //this.stattable.add(statObj);
  }
}
