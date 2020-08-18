import { Injectable, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, Subscriber, of, from, forkJoin } from "rxjs";
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
  pbpPosition,
  TeamPlayerWithID
} from "../models/appModels";
import Dexie from "dexie";
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { Guid } from "guid-typescript";

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
  items: Observable<any[]>;
  dbPlayers: Observable<any>;
  dbMatches: Observable<any>;
  dbStats: Observable<any>;
  dbGames: Observable<any>;
  dbTeams: Observable<any>;
  match: Match[] = [];

  //mappedPos = new Array();

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this._gameData$ = new BehaviorSubject(null);
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
    return query.find();
  }

  getClubs() {
    const Clubs = Parse.Object.extend('Clubs');
    const query = new Parse.Query(Clubs);
    return from(query.find()).pipe(map(result => result));
  }

  getMatchById(id: string) {
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    query.equalTo("objectId", id);
    return query.find();
    //return this.firestore.collection("players").snapshotChanges();
  }

  deleteMatch(match) {
    return from(match.destroy()).pipe(map(result => result));
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
    return query.find();
  }

  getAllPlayers() {
    const Players = Parse.Object.extend('Players');
    const query = new Parse.Query(Players);
    return query.find();
  }

  getstats(id: string) {
    const Stats = Parse.Object.extend('Stats');
    const query = new Parse.Query(Stats);
    query.equalTo("GameId", id);
    query.ascending("createdAt");
    return query.find();
    
    //return this.firestore.collection("games").doc(g.id).collection("stats", ref => ref.orderBy("statdate")).snapshotChanges();
    //return this.firestore.collection("stats").snapshotChanges();
  }

  getPlayByPlay(gId: string) {
    const PlayByPlay = Parse.Object.extend('PlayByPlay');
    const query = new Parse.Query(PlayByPlay);
    query.equalTo("gameId", gId);
    return query.find()
  }

  getPlayersFromRoster(playerNumbers: Array<any>) {
    const Players = Parse.Object.extend('Players');
    const query1 = new Parse.Query(Players);
    query1.containedIn("objectId", playerNumbers);
    return from(query1.find()).pipe(map(result => result));
  }

  getPlayersByTeamId(teamId: string){
    const Teams = Parse.Object.extend('TeamPlayers')
    const query = new Parse.Query(Teams);
    query.equalTo("TeamId", teamId);
    return query.find();
    
  }

  getPlayersById(teamId: string){
    const Teams = Parse.Object.extend('Players')
    const query = new Parse.Query(Teams);
    query.equalTo("TeamId", teamId);
    return query.find();
    
  }

  updatePlayerJersey(jersey: string, objectId: string) {
    const TeamPlayers = Parse.Object.extend('TeamPlayers');
    const query = new Parse.Query(TeamPlayers);
    // here you put the objectId that you want to update
    return from(query.get(objectId).then((object) => {
      object.set('Jersey', jersey);
      return object.save()
    }))
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
    return query.find();
    //return this.firestore.collection("games").snapshotChanges();
  }

  getTeams() {
    const Teams = Parse.Object.extend('Teams');
    const query = new Parse.Query(Teams);
    return from(query.find()).pipe(map(result => result));
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
      case "bt":
          action = "Block touch by "
          break;
      case "h":
          action = "Attach by "
          break;
      case "d":
          action = "Dig by "
          break;
      case "b":
          action = "Block by "
          break;
      case "a":
          action = "Assist by "
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
    myNewObject.set('gameId', g.objectId);

    myNewObject.save();
    //this.messageService.add({severity:'success', summary:'Service Message', detail:'Via MessageService'});
    //return this.createPBPInFirestore(pbpObj);

  }

  upDateTeam(t: TeamWithId) {
    const Teams = Parse.Object.extend('Teams');
    const query = new Parse.Query(Teams);
    // here you put the objectId that you want to update
    return from(query.get(t.objectId).then((object) => {
      object.set('TeamName', t.TeamName);
      object.set('Year', t.Year);
      object.set('ClubId', t.ClubId);
      object.save()
    }));  
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

  getGameId(gn: Number, matchId: string) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    query.equalTo("GameNumber", gn);
    query.equalTo("MatchId", matchId);
    return query.find()
  }
  
  DateToYYYYMMDD(Date: Date): string {
    let DS: string = ('0' + (Date.getMonth() + 1)).slice(-2) 
        + '/' + ('0' + Date.getDate()).slice(-2)
        + '/' + Date.getFullYear()
    return DS
  }

  createMatch(match: MatchWithId) {
    const Matches = Parse.Object.extend('Matches');
    const myNewObject = new Matches();

    let newDate = new Date(match.MatchDate);
    var md = this.DateToYYYYMMDD(newDate);
    myNewObject.set('Home', match.Home);
    myNewObject.set('Opponent', match.Opponent);
    myNewObject.set('MatchDate', md);
    myNewObject.set('HomeTeamId', match.HomeTeamId);

    return from(myNewObject.save()).pipe(map(result => result));;

  }
  createStat(stat: any, g: GameWithId) {
    var rotations: pbpPosition[] = [];
    //let pos = stat.rotation;

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
  
  savePlayer(p: any) {
    if (!p.objectId) {
      return this.createPlayer(p)
    } else {
      return this.updatePlayer(p)
    }
  }

  updatePlayer(p: any) {
    const Players = Parse.Object.extend('Players');
    const query = new Parse.Query(Players);
    // here you put the objectId that you want to update
    return query.get(p.objectId).then((object) => {
      object.set('FirstName', p.FirstName);
      object.set('LastName', p.LastName);
      object.save()
    }) 
  }

  createPlayer(p: any) {
    const Players = Parse.Object.extend('Players');
    const myNewObject = new Players();
    
    myNewObject.set('FirstName', p.FirstName);
    myNewObject.set('LastName', p.LastName);
    
    return myNewObject.save()

  }

  deletePlayer(p: any) {
    const Players = Parse.Object.extend('Players');
    const query = new Parse.Query(Players);
    // here you put the objectId that you want to delete
    return query.get(p.objectId).then((object) => {
      object.destroy()
    })
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
    const Teams = Parse.Object.extend('Teams');
    const newTeam = new Teams();
    newTeam.set('objectId', t.objectId);
    newTeam.set('TeamName', t.TeamName);
    newTeam.set('Year', 2020);
    newTeam.set('ClubId', t.ClubId);

    return from(newTeam.save()).pipe(map(result => result));;

  }

  removePlayerFromTeam(id: string) {
    const TeamPlayers = Parse.Object.extend('TeamPlayers');
    const query = new Parse.Query(TeamPlayers);
    // here you put the objectId that you want to delete
    query.get(id).then((object) => {
      object.destroy()
      })
    }

  addPlayersToTeam(players: PlayerWithId[], teamId: string) : Observable<any[]> {
    var arrayOfResponses: Array<any> = [];

    players.forEach(p => {
      const TeamPlayers = Parse.Object.extend('TeamPlayers');
      const myNewObject = new TeamPlayers();
      myNewObject.set('PlayerId', p.objectId);
      myNewObject.set('TeamId', teamId);
      var resp = from(myNewObject.save())
      arrayOfResponses.push(resp);
    });

    return forkJoin(arrayOfResponses);
  }


  // getPlayersByIds(players: any[]){
  //    const Players = Parse.Object.extend('Players');
  //     const query = new Parse.Query(Players);
  //     query.equalTo("objectId", p.PlayerId);
  //     return query.find()
 
  //   // return forkJoin(arrayOfResponses);
  // }
 
  updateTeam(t: TeamWithId) {
    const Teams = Parse.Object.extend('Teams');
    const query = new Parse.Query(Teams);
    // here you put the objectId that you want to update
    query.get(t.objectId).then((object) => {
      object.set('TeamName', t.TeamName);
      object.set('Year', 2020);
      object.set('ClubId', t.ClubId);
      object.save()
    })
  }
  
  saveMatch(m: MatchWithId) {
      return this.createMatch(m);
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

  async incrementStat(stat: Stat, g: GameWithId) {
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
