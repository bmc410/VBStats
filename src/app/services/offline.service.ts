import { Injectable, DoBootstrap } from '@angular/core';
import Dexie from 'dexie';
import { OfflineDatabase, IPlayers, IClubs } from '../models/dexie-models';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { PlayerWithId, ClubWithId } from '../models/appModels';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  //private subPlayers = new BehaviorSubject<IPlayers[]>();
  public Players: BehaviorSubject<IPlayers[]> = new BehaviorSubject<IPlayers[]>([]);
  public Clubs: BehaviorSubject<IPlayers[]> = new BehaviorSubject<IClubs[]>([]);



  db: OfflineDatabase;
  constructor() { 
    this.db = new OfflineDatabase();
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
    return this.db.clubs.bulkAdd(clubs).then(result => {
        this.loadClubs();
      })
  }




  //******* Player  */
  bulkAddPlayers(players: IPlayers[]) {
    return this.db.players.bulkAdd(players).then(()=>{
      this.loadPlayers();
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
