import { Injectable, DoBootstrap } from '@angular/core';
import Dexie from 'dexie';
import { OfflineDatabase, IPlayers, IClubs, ITeamPlayers } from '../models/dexie-models';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { PlayerWithId, ClubWithId } from '../models/appModels';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  //private subPlayers = new BehaviorSubject<IPlayers[]>();
  public Players: BehaviorSubject<IPlayers[]> = new BehaviorSubject<IPlayers[]>([]);
  public Clubs: BehaviorSubject<IPlayers[]> = new BehaviorSubject<IClubs[]>([]);
  public TeamPlayers: BehaviorSubject<ITeamPlayers[]> = new BehaviorSubject<ITeamPlayers[]>([]);



  db: OfflineDatabase;
  constructor() { 
    this.db = new OfflineDatabase();
  }


    //******* Clubs  */
    loadTeamPlayers() {
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

  getTeamPlayers(): Observable<any> {
    return this.TeamPlayers.asObservable();
  }

  bulkAddTeamPlayers(teamplayers: ITeamPlayers[]) {
    this.db.teamplayers.clear().then(result => {
    return this.db.teamplayers.bulkAdd(teamplayers).then(result => {
        //this.loadTeamPlayers();
      })
    })
  }

  //******* Clubs  */
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




  //******* Player  */
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

}
