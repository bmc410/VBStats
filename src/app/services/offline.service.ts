import { Injectable, DoBootstrap } from '@angular/core';
import Dexie from 'dexie';
import { OfflineDatabase, IPlayers, IClubs, ITeamPlayers, ITeams, IMatches, IGames, IStats } from '../models/dexie-models';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { PlayerWithId, ClubWithId, TeamWithId, MatchWithId, GameWithId } from '../models/appModels';

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
  

  db: OfflineDatabase;
  constructor() { 
    this.db = new OfflineDatabase();
  }

  //#region ******* Stats  */

  //#endregion

  //#region ******* Games  */
  getGameForMatchByNumber(matchId: string, gameNumber: number) {
    return this.db.games.filter(function (g) {
      return g.GameNumber === gameNumber 
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

  //#endregion

  //#region ******* Matches  */
  createMatch(match: any) {
    return this.db.matches.add(match).then(()=>{
      this.loadMatches();
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

  getMatches(): Observable<any> {
    return this.Matches.asObservable();
  }
  //#endregion

  //#region ******* Teams  */
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
