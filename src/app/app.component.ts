import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { NetworkService } from './services/network.service';
import { OfflineService } from './services/offline.service';
import { IPlayers, IClubs, ITeamPlayers, ITeams } from './models/dexie-models';
import { Guid } from "guid-typescript";
import { MatchService } from './services/matchservice';
import { Club } from './models/appModels';
//import { NetworkService } from './services/network.service';
import { ConnectionService } from 'ng-connection-service';

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
  isConnected = true;
  status = 'ONLINE';

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private networkService: NetworkService,
    private offlineService: OfflineService,
    private matchService: MatchService,
    private connectionService: ConnectionService
  ) {

    this.networkService.HasInternet().subscribe(isConnected => {
      this.isConnected = isConnected;
      console.log(isConnected)
      if (this.isConnected) {
        this.status = "ONLINE";
      }
      else {
        this.status = "OFFLINE";
      }
    })

    var status = this.networkService.getlaststatus();
    if(status == true) {
      this.networkService.NetworkChange(status)
    }
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.networkService.currentStatus.subscribe(x => this.offline = x);
    // this.networkService.currentStatus.subscribe(result => {
    //   // if (result == true) {
    //   //   //this.offlineService.deleteAllMatches()
    //   //   //this.offlineService.clearPBPTable()
    //   //   this.getPlayByPlay()
    //   //   this.offlineService.loadMatches()
    //   //   this.getOnlineClubs()
    //   //   this.getTeamPlayers()
    //   //   this.getTeams()
    //   //   this.getGames()
    //   //   this.deletePlayers().then(result => {
    //   //     this.getOnlinePlayers()
    //   //   })
        
    //   // } else {
    //   //   //this.deletePlayers()
    //   // }
    //   this.offline = result
    // })
    this.offlineService.getPlayers().subscribe(result => {
      this.players = result
    })
  }

  async getPlayByPlay() {
    this.offlineService.loadPBP()
    this.offlineService.getPlayByPlay().subscribe(result => {
      console.log(result)
    })
  }

  async getGames() {
    this.offlineService.loadGames()
    this.offlineService.getGames().subscribe(result => {
      console.log(result)
    })
  }

  async getTeams() {
    const teams: ITeams[] = []
    await this.matchService.getTeams().then(async results => {
      var j = JSON.stringify(results);
      var onlineT = JSON.parse(j);
      onlineT.forEach(element => {
        const t: ITeams = {}
        t.objectId = element.objectId,
        t.ClubId = element.ClubId,
        t.TeamName = element.TeamName,
        t.Year = element.Year
        teams.push(t)
      });
      await this.offlineService.bulkAddTeams(teams)
      //this.addPlayer()
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
        teamplayers.push(tp)
      });
      await this.offlineService.bulkAddTeamPlayers(teamplayers)
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
