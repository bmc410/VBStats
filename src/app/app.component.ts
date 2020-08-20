import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { NetworkService } from './services/network.service';
import { OfflineService } from './services/offline.service';
import { IPlayers, IClubs, ITeamPlayers } from './models/dexie-models';
import { Guid } from "guid-typescript";
import { MatchService } from './services/matchservice';
import { Club } from './models/appModels';
//import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentUser: any;
  offline: any;
  players: IPlayers[] = []
  player: IPlayers = {
    objectId: Guid.create().toString(),
    firstname: 'Bill',
    lastname: 'McCoy'
  };
  player1: IPlayers = {
    objectId: Guid.create().toString(),
    firstname: 'Kadi',
    lastname: 'McCoy'
  };

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private networkService: NetworkService,
    private offlineService: OfflineService,
    private matchService: MatchService
  ) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.networkService.currentStatus.subscribe(x => this.offline = x);
    this.networkService.currentStatus.subscribe(result => {
      if (result == true) {
        this.getOnlineClubs()
        this.getTeamPlayers()
        this.deletePlayers().then(result => {
          this.getOnlinePlayers()
        })
        
      } else {
        this.deletePlayers()
      }
      this.offline = result
    })
    this.offlineService.getPlayers().subscribe(result => {
      this.players = result
    })
  }

  
  async getOnlineClubs() {
    const clubs: IClubs[] = []
    await this.matchService.getClubs().then(async results => {
      var j = JSON.stringify(results);
      var onlineClubs = JSON.parse(j);
      onlineClubs.forEach(element => {
        const club: IClubs = {}
        club.clubname = element.ClubName,
        club.objectId = element.objectId
        clubs.push(club)
      });
      await this.offlineService.bulkAddClubs(clubs)
      //this.addPlayer()
    })
  }

  async getTeamPlayers() {
    const teamplayers: ITeamPlayers[] = []
    await this.matchService.getAllTeamPlayers().then(async results => {
      var j = JSON.stringify(results);
      var onlineTP = JSON.parse(j);
      onlineTP.forEach(element => {
        const tp: ITeamPlayers = {}
        tp.objectId = element.objectId,
        tp.teamid = element.TeamId,
        tp.playerid = element.PlayerId,
        tp.jersey = element.Jersey,
        tp.clubyear = element.ClubYear
      });
      await this.offlineService.bulkAddTeamPlayers(onlineTP)
      //this.addPlayer()
    })
  }
  

  async getOnlinePlayers() {
    const players: IPlayers[] = []
    await this.matchService.getPlayers().then(async results => {
      var j = JSON.stringify(results);
      var onlinePlayers = JSON.parse(j);
      onlinePlayers.forEach(element => {
        const player: IPlayers = {}
        player.objectId = element.objectId,
          player.firstname = element.FirstName,
          player.lastname = element.LastName
        players.push(player)
      });
      await this.offlineService.bulkAddPlayers(players)
    })
  }

  async deletePlayers() {
      await this.offlineService.bulkdeletePlayers().then(result => {
        return result;
      })
  }

  async addPlayers() {
    this.players.push(this.player)
    this.players.push(this.player1)
    await this.offlineService.bulkAddPlayers(this.players).then(result => {
      //console.log(this.players);
    })
  }

  async addPlayer() {
    await this.offlineService.addPlayer(this.player).then(result => {
      //console.log(this.players);
    })
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
