import { Injectable, DoBootstrap } from '@angular/core';
import Dexie from 'dexie';
import { OfflineDatabase, IPlayers, IClubs, ITeamPlayers, ITeams, IMatches, IGames, IStats, IPlayByPlay } from '../models/dexie-models';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { PlayerWithId, ClubWithId, TeamWithId, MatchWithId, GameWithId, CourtPosition, pbpPosition, Stat } from '../models/appModels';
import { MessageService } from 'primeng/api';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  //private subPlayers = new BehaviorSubject<IPlayers[]>();
  public Players: BehaviorSubject<IPlayers[]> = new BehaviorSubject<IPlayers[]>([]);
  public Clubs: BehaviorSubject<IPlayers[]> = new BehaviorSubject<IClubs[]>([]);
  public TeamPlayers: BehaviorSubject<ITeamPlayers[]> = new BehaviorSubject<ITeamPlayers[]>([]);
  public Teams: BehaviorSubject<ITeams[]> = new BehaviorSubject<ITeams[]>([]);
  public Matches: BehaviorSubject<IMatches[]> = new BehaviorSubject<IMatches[]>([]);
  public Games: BehaviorSubject<IGames[]> = new BehaviorSubject<IGames[]>([]);
  public Stats: BehaviorSubject<IStats[]> = new BehaviorSubject<IStats[]>([]);
  public PlayByPlay: BehaviorSubject<IPlayByPlay[]> = new BehaviorSubject<IPlayByPlay[]>([]);
  
  

  db: OfflineDatabase;
  constructor(private messageService: MessageService) { 
    this.db = new OfflineDatabase();
  }

  //#region ******* Play By Play  */

clearPBPTable() {
  this.db.playbyplay.clear().then(result => {
    this.loadPBP()
  })
}

getPlayByPlayById(gId: string) {
  return this.db.playbyplay.orderBy(":id").filter(function (tp) {
    return tp.gameid === gId
  }).toArray()
}

getPlayByPlay(): Observable<any> {
  return this.PlayByPlay.asObservable()
}


loadPBP() {
  this.db.playbyplay.toArray().then (results => {
    this.PlayByPlay.next(results);
  })
}

addPlayByPlay(g: GameWithId, cp: CourtPosition[], stat: string, p: PlayerWithId[], action: string = "" ) {
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
  const pbp = {
   action: action,
   homescore: g.HomeScore,
   opponentscore: g.OpponentScore,
   playerid: objId,
   stattype: stat,
   rotation: jR,
   gameid: g.objectId,
   objectId: Guid.create().toString(),
  } as IPlayByPlay
  
  this.db.playbyplay.add(pbp).then(result => {
    this.loadPBP()
  })

}
//#endregion

  //#region ******* Stats  */
  clearStatsTable() {
    this.db.stats.clear().then(result => {
      this.loadStats()
    })
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

  incrementStat(stat: Stat, g: GameWithId) {
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
      statdate: Date.now
    };
    this.createStat(statObj,g);
    this.messageService.add({severity:'success', summary:'Service Message', detail:this.getActionFromStat(stat.stattype) + stat.player.FirstName});
    //this.stattable.add(statObj);
  }

  async createStat(stat: any, g: GameWithId) {
    var jr = JSON.stringify(stat.rotation);
    const st = {} as IStats
    st.GameId = g.objectId
    st.HomeScore = g.HomeScore
    st.OpponentScore = g.OpponentScore
    st.PlayerId = stat.playerid
    st.StatType = stat.stattype
    st.Subs = g.subs
    st.Rotation = jr
    st.StatDate = new Date()
    st.objectId = Guid.create().toString() 
    await this.db.stats.add(st).then(() => {
      this.loadStats()
    })
  }

  getstats(id: string) {
    return this.db.stats.filter(function (tp) {
      return tp.GameId === id
    }).toArray()
    //return this.firestore.collection("games").doc(g.id).collection("stats", ref => ref.orderBy("statdate")).snapshotChanges();
    //return this.firestore.collection("stats").snapshotChanges();
  }

  getofflinestats(id: string) {
    return JSON.stringify(this.db.stats.filter(function (tp) {
      return tp.GameId === id
    }).toArray())
  }

  loadStats() {
    this.db.stats.toArray().then (results => {
      this.Stats.next(results);
      console.log(results)
    })
  }
  //#endregion

  //#region ******* Games  */

  clearGamesTable() {
    this.db.games.clear().then(result => {
      this.loadGames()
    })
  }

  updateGame(g: GameWithId) {
    return this.db.games.update(g.objectId, 
      {HomeScore: g.HomeScore, OpponentScore: g.OpponentScore, Subs: g.subs}
    ).then(result => {
      this.loadGames()
    })
  }

  getGameId(gn: Number, matchId: string) {
    return this.db.games.filter(function (g) {
      return g.GameNumber === gn 
        && g.MatchId === matchId 
    }).toArray()
  }

  createGame(g: IGames) {
    return this.db.games.add(g).then(()=>{
      this.loadGames();
    })
  }
  loadGames() {
    this.db.games.toArray().then (results => {
      this.Games.next(results);
    })
  }
  getGames(): Observable<any> {
    return this.Games.asObservable();
  }

  getGamesForSync(matchid) {
    return this.db.games.filter(function (tp) {
      return tp.MatchId === matchid
    }).toArray()
  }

  //#endregion

  //#region ******* Matches  */
  getMatchById(id: string) {
   return this.db.matches.filter(function (tp) {
      return tp.objectId === id
    }).toArray()
  }
  
  createMatch(match: any) {
    return this.db.matches.add(match).then(()=>{
      this.loadMatches();
    })
  }

  clearMatchesTable() {
    this.db.matches.clear().then(result => {
      this.loadMatches()
    })
  }

  deleteAllMatches() {
    this.db.matches.clear()
  }
  
  loadMatches() {
    this.db.matches.toArray().then (results => {
      this.Matches.next(results);
    })
  }

  getMatchesForSync() {
    return this.db.matches.toArray()
  }

  getMatches(): Observable<IMatches[]> {
    return this.Matches.asObservable();
  }

  //#endregion

  //#region ******* Teams  */
  clearTeamsTable() {
    this.db.teams.clear().then(result => {
      this.loadTeams()
    })
  }

  bulkAddTeams(teams: ITeams[]) {
    this.db.teams.clear().then(result => {
    return this.db.teams.bulkAdd(teams).then(result => {
        this.loadTeams();
      })
    })
  }
  loadTeams() {
    const tIds: TeamWithId[] = []
    this.db.teams.toArray().then (results => {
      this.Teams.next(results)
        // results.forEach(element => {
        // const t = new TeamWithId()
        // t.ClubId = element.clubid,
        // t.TeamName = element.teamname,
        // t.Year = element.year,
        // t.objectId = element.objectId
        // tIds.push(t)
      //})
    })
    //this.Teams.next(tIds);
  }

  getTeams(): Observable<any> {
    return this.Teams.asObservable();
  }

  //#endregion

  //#region - Team Players
  clearTeamPlayersTable() {
    this.db.teamplayers.clear().then(result => {
      this.loadTeamPlayers()
    })
  }

  loadTeamPlayers() {
      this.db.teamplayers.toArray().then (results => {
        this.TeamPlayers.next(results);
      })
  }

  getTeamPlayers(): Observable<any> {
    return this.TeamPlayers.asObservable();
  }

  bulkAddTeamPlayers(teamplayers: ITeamPlayers[]) {
    this.db.teamplayers.clear().then(result => {
    return this.db.teamplayers.bulkAdd(teamplayers).then(result => {
        this.loadTeamPlayers();
      })
    })
  }
  //#endregion

  //#region - Clubs  */
  clearClubsTable() {
    this.db.clubs.clear().then(result => {
      this.loadClubs()
    })
  }

  loadClubs() {
      const cIds: ClubWithId[] = []
      this.db.clubs.toArray().then (results => {
      results.forEach(element => {
        const c = new ClubWithId()
        c.objectId = element.objectId,
        c.ClubName = element.clubname
        cIds.push(c)
      });
      this.Clubs.next(cIds);
      })
  }

  getClubs(): Observable<any> {
    return this.Clubs.asObservable();
  }

  bulkAddClubs(clubs: IClubs[]) {
    this.db.clubs.clear().then(result => {
      return this.db.clubs.bulkAdd(clubs).then(result => {
          this.loadClubs();
        })
      })
  }
  //#endregion

  //#region ******* Players  */
  clearPlayersTable() {
    this.db.players.clear().then(result => {
      this.loadPlayers()
    })
  }

  bulkAddPlayers(players: IPlayers[]) {
    return this.db.players.clear().then(result => {
      this.db.players.bulkAdd(players).then(()=>{
        this.loadPlayers();
      })
    })
  }

  addPlayer(player: any) {
    return this.db.players.add(player).then(()=>{
      this.loadPlayers();
    })
  }

  getPlayersByTeamId(teamId) {
    return this.db.teamplayers.filter(function (tp) {
      return tp.teamid === teamId
    }).toArray()
  }

  getPlayers(): Observable<any> {
    return this.Players.asObservable();
  }

  loadPlayers() {
    const pIds: PlayerWithId[] = []
    this.db.players.toArray().then (results => {
      results.forEach(element => {
        const p: PlayerWithId = {}
          p.FirstName = element.firstname
          p.LastName = element.lastname,
          p.objectId = element.objectId,
          p.islibero = false,
          p.fullName = element.firstname + ' ' + element.lastname
          pIds.push(p)
      });
      this.Players.next(pIds);
    })
  }

  deletePlayer(id: any) {
    return this.db.players.delete(id).then(()=>{
      this.loadPlayers();
    })
  }
  
  bulkdeletePlayers() {
    return this.db.players.clear().then(()=>{
      return this.loadPlayers();
    })
  }
  //#endregion


 

}
