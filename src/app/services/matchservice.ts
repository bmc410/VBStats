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
import { OfflineService } from './offline.service';
//import { url } from 'inspector';


@Injectable({
  providedIn: "root"
})
export class MatchService {
  //matchtable: Dexie.Table<Match, number>;
  items: Observable<any[]>;
  dbPlayers: Observable<any>;
  dbMatches: Observable<any>;
  dbStats: Observable<any>;
  dbGames: Observable<any>;
  dbTeams: Observable<any>;
  match: Match[] = [];
  public Matches: BehaviorSubject<MatchWithId[]> = new BehaviorSubject<MatchWithId[]>([]);


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

  //#region ******* Matches  */

  deleteMatch(mId: string) {
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    // here you put the objectId that you want to delete
    return query.get(mId).then((object) => {
      var json = JSON.stringify(object);
      var d = JSON.parse(json);
      object.destroy().then((response) => {
        var json = JSON.stringify(response);
        var d = JSON.parse(json);
       this.getAllGameForMatch(mId).then(result => {
          var json = JSON.stringify(result);
          var d = JSON.parse(json);
          d.forEach(element => {
            this.deleteGameById(element.objectId)
            this.getPlayByPlay(element.objectId).then(result => {
              var json = JSON.stringify(result);
              var d = JSON.parse(json);
              d.forEach(element => {
                this.deletePBPById(element.objectId)
              })
              this.getstats(element.objectId).then(result => {
                var json = JSON.stringify(result);
                var d = JSON.parse(json);
                d.forEach(element => {
                  this.deleteStat(element.objectId)
                })
                this.loadMatches()
              })
            })
          });
        })
      })
    });
  }

  saveMatch(match: MatchWithId) {
    if (match.objectId == 'undefined' || match.objectId == null || match.objectId == "") {
      match.objectId = Guid.create().toString()
      return this.createMatch(match);
    } else {
      return this.updateMatch(match);
    }
  }

  getMatches() {
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    return query.find();
  }

  loadMatches() {
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    return query.find().then(result => {
      this.Matches.next(result);
    })
  }

  getMatchesAsync() {
    return this.Matches.asObservable()
  }

  getMatchById(id: string) {
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    query.equalTo("objectId", id);
    return query.find();
    //return this.firestore.collection("players").snapshotChanges();
  }

  updateMatch(m: MatchWithId) {
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    // here you put the objectId that you want to update
    return query.get(m.objectId).then((object) => {
      object.set('Home', m.Home);
      object.set('Opponent', m.Opponent);
      object.set('MatchDate', m.MatchDate);
      object.set('HomeTeamId', m.HomeTeamId);
      return object.save()
    });
  }

  createMatch(m: MatchWithId) {
    const Matches = Parse.Object.extend('Matches');
    const myNewObject = new Matches();

    let newDate = new Date(m.MatchDate);
    var md = this.DateToYYYYMMDD(newDate);
    myNewObject.set('Home', m.Home);
    myNewObject.set('Opponent', m.Opponent);
    myNewObject.set('MatchDate', md);
    myNewObject.set('HomeTeamId', m.HomeTeamId);

    return myNewObject.save()

  }
  //#endregion

  //#region ******* Games  */

  deleteGameById(gId) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    // here you put the objectId that you want to delete
    query.get(gId).then((object) => {
      object.destroy()
    });
  }

  getAllGameForMatch(matchId: string) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    query.equalTo("MatchId", matchId);
    return query.find();
  }

  getGameForMatchByNumber(matchId: string, gameNumber: number) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    query.equalTo("MatchId", matchId);
    query.equalTo("GameNumber", Number(gameNumber));
    return query.find();
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
  getGameId(gn: Number, matchId: string) {
    const Games = Parse.Object.extend('Games');
    const query = new Parse.Query(Games);
    query.equalTo("GameNumber", gn);
    query.equalTo("MatchId", matchId);
    return query.find()
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

  //#endregion

  //#region ******* Players  */
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
  getPlayersByTeamId(teamId: string) {
    const Teams = Parse.Object.extend('TeamPlayers')
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
  //#endregion

  //#region ******* PlayByPlay  */

  deletePBPById(pbpId){
    const PlayByPlay = Parse.Object.extend('PlayByPlay');
    const query = new Parse.Query(PlayByPlay);
    // here you put the objectId that you want to delete
    query.get(pbpId).then((object) => {
      object.destroy()
    });
  }

  getPlayByPlay(gId: string) {
    const PlayByPlay = Parse.Object.extend('PlayByPlay');
    const query = new Parse.Query(PlayByPlay);
    query.equalTo("gameId", gId);
    return query.find()
  }
  addPlayByPlay(g: GameWithId, cp: CourtPosition[], stat: string, p: PlayerWithId[], action: string = "") {
    var rotations: pbpPosition[] = [];
    let pos = cp;
    if (stat === "start") {
      action = "Start [" + cp[1].player.FirstName + ", "
        + cp[2].player.FirstName + ", " + cp[3].player.FirstName + ", "
        + cp[4].player.FirstName + ", " + cp[5].player.FirstName + ", "
        + cp[6].player.FirstName + "]"
    } else if (stat === "sub") {
      action = "Sub [" + p[0].FirstName + " for " + p[1].FirstName + "]"
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
      //pbpDate: this.datetoepoch(new Date()),
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

  syncPlayByPlay(g: GameWithId, rotation: string, stat: string, pId: string, action: string = "") {

    const PlayByPlay = Parse.Object.extend('PlayByPlay');
    const myNewObject = new PlayByPlay();

    myNewObject.set('action', action);
    myNewObject.set('homescore', g.HomeScore);
    myNewObject.set('opponentscore', g.OpponentScore);
    myNewObject.set('playerId', pId);
    myNewObject.set('stattype', stat);
    myNewObject.set('rotation', rotation);
    myNewObject.set('gameId', g.objectId);

    myNewObject.save();
  }

  //#endregion

  //#region ******* Stats  */

  deleteStat(sId) {
    const Stats = Parse.Object.extend('Stats');
    const query = new Parse.Query(Stats);
    // here you put the objectId that you want to delete
    query.get(sId).then((object) => {
      object.destroy()
    })
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
    this.createStat(statObj, g);
    this.messageService.add({ severity: 'success', summary: 'Service Message', detail: this.getActionFromStat(stat.stattype) + stat.player.FirstName });
    //this.stattable.add(statObj);
  }
  getstats(id: string) {
    const Stats = Parse.Object.extend('Stats');
    const query = new Parse.Query(Stats);
    query.equalTo("GameId", id);
    query.ascending("createdAt");
    return query.find();
  }
  getActionFromStat(stat: string) {
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
  //#endregion

  //#region ******* Teams  */
  getAllTeamPlayers() {
    const Teams = Parse.Object.extend('TeamPlayers')
    const query = new Parse.Query(Teams);
    return query.find();
  }
  getTeams() {
    const Teams = Parse.Object.extend('Teams');
    const query = new Parse.Query(Teams);
    return query.find();
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
  createTeam(t: TeamWithId) {
    const Teams = Parse.Object.extend('Teams');
    const newTeam = new Teams();
    newTeam.set('objectId', t.objectId);
    newTeam.set('TeamName', t.TeamName);
    newTeam.set('Year', 2020);
    newTeam.set('ClubId', t.ClubId);

    return from(newTeam.save()).pipe(map(result => result));;

  }
  addPlayersToTeam(players: PlayerWithId[], teamId: string): Observable<any[]> {
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
  //#endregion

  //#region ******* Clubs  */
  getClubs() {
    const Clubs = Parse.Object.extend('Clubs');
    const query = new Parse.Query(Clubs);
    return query.find();
  }

  //#endregion

  //#region ******* Utilities  */
  DateToYYYYMMDD(Date: Date): string {
    let DS: string = ('0' + (Date.getMonth() + 1)).slice(-2)
      + '/' + ('0' + Date.getDate()).slice(-2)
      + '/' + Date.getFullYear()
    return DS
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
  //#endregion

}
