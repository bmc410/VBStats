import { Component, OnInit, NgZone } from "@angular/core";
import {
  CourtPosition,
  Match,
  gameMatch,
  PlayerWithId,
  Player,
  MatchWithId,
  TeamWithId,
  Team,
  TeamPlayerWithID,
  ClubWithId,
  GameWithId,
  Stat,
  pbpPosition
} from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
import { MenuItem } from "primeng/api/menuitem";
import { ListboxModule } from 'primeng/listbox'
import { Router } from "@angular/router";
import { ConnectionService } from "ng-connection-service";
import {FormControl} from '@angular/forms';
import { Parse } from 'parse';
import { NetworkService } from 'src/app/services/network.service';
import { OfflineService } from 'src/app/services/offline.service';
import { Guid } from 'guid-typescript';
import { formatDate } from '@angular/common';
import { stat } from 'fs';
import { IPlayByPlay, IClubs, ITeamPlayers, ITeams, IPlayers } from 'src/app/models/dexie-models';
import { MessageService } from 'primeng/api';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: "app-configure",
  templateUrl: "./configure.component.html",
  styleUrls: ["./configure.component.css"]
})
export class ConfigureComponent implements OnInit {
  playerPositions: CourtPosition[];
  draggedplayer: PlayerWithId;
  players: PlayerWithId[] = [];
  teamPlayers: TeamPlayerWithID[] = [];
  teamPlayer: PlayerWithId;
  teamPlayerIDs: TeamPlayerWithID[] = []
  pickedPlayers: PlayerWithId[] = [];
  selectedOptions: PlayerWithId[] = []
  match: MatchWithId = {};
  player: PlayerWithId = {};
  matches: Match[] = [];
  display: boolean = false;
  matchDate: Date;
  items: MenuItem[];
  teams: TeamWithId[] = [];
  team: TeamWithId;
  club: ClubWithId;
  clubs: ClubWithId[] = [];
  selectedTeamName = ""
  selectedTeamId = ""
  selectedClubName = ""
  selectedClubId = ""
  game = 1;
  teamName = "";
  teamClubId = "";
  selectedTeamClubId = "";
  faCheck=faCheck

  levels:Array<Object> = [
    {num: 0, name: "AA"},
    {num: 1, name: "BB"}
  ];
  selectTeam = 99;
 
  dialogHome: string
  dialogHomeId: string;
  dilogOpponent: string
  dialogGameDate: Date
  dialogGame: number
  dialogMatchId: string

  matchDialogDisplay: boolean = false;
  playerDialogDisplay: boolean = false;
  teamDialogDisplay: boolean = false;
  addTeamDialogDisplay: boolean = false;
  playersDialogListDisplay: boolean = false;
  selectedMatch: Match;
  selectedPlayer: Player;
  selectedPlayers: PlayerWithId[];
  availablePlayers:  PlayerWithId[] = [];
  selectedTeamPlayer: TeamPlayerWithID;
  selectedTeamPlayerId: string;
  selectedTeam: TeamWithId;
  newMatch: boolean;
  newPlayer: boolean;
  newTeam: boolean;
  gameMatch: gameMatch;
  status = "ONLINE";
  isConnected = true;
  matchsubcription: any;
  gameDate = new FormControl(new Date());
  teamYears: Number[] = [];
  selectedTeamYear: Number;
  offline: any;
  click : boolean = true;
  constructor(
    private matchService: MatchService,
    private router: Router,
    private connectionService: ConnectionService,
    private _ngZone: NgZone,
    private networkService: NetworkService,
    private offlineservice: OfflineService,
    private messageService: MessageService
  ) {
    this.playerPositions = [];
    this.networkService.currentStatus.subscribe(result => {
      this.offline = result
    })
    this.offlineservice.loadPlayers()
    this.offlineservice.loadTeams()
    this.offlineservice.loadClubs()
    this.offlineservice.loadTeamPlayers()
    this.offlineservice.loadMatches()
    this.offlineservice.loadGames()
    this.offlineservice.loadStats()
    this.offlineservice.loadPBP()
  }


  async ngOnInit() {

    var _this = this
    let year = new Date().getFullYear();
    this.teamYears.push(year);
    for (let index = 1; index < 5; index++) {
      year += 1;
      this.teamYears.push(year);
    }

     //#region  Offline check for --- clubs ---
     if (this.offline == true) {
      await this.offlineservice.getClubs().subscribe(results => {
        this.clubs = results;
      });
    } else {
      await this.matchService.getClubs().then(data => {
        var json = JSON.stringify(data);
        this.clubs = JSON.parse(json);
      });
    }
    //#endregion

     //#region  Offline check for --- teams ---
     if (this.offline == true) {
      await this.offlineservice.getTeams().subscribe(results => {
        this.teams = results;
      });

     } else {
      await this.matchService.getTeams().then(data => {
        var json = JSON.stringify(data);
        this.teams = JSON.parse(json);
      });
     }
    //#endregion
   
    //#region Offline check for --- matches --- 
    if (this.offline == true) {
      await this.offlineservice.getMatches().subscribe(results => {
        this.matches = results;
      });
    }
    else {
      this.matchService.loadMatches();
      await this.matchService.getMatchesAsync().subscribe(result => {
        var json = JSON.stringify(result);
        this.matches = JSON.parse(json);
      });
    }
    //#endregion
 
    //#region  Offline check for --- players ---
    if (this.offline == true) {
      console.log("app is offline")
      await this.offlineservice.getPlayers().subscribe(results => {
        console.log("players")
        console.log(results)
        results.forEach(element => {
          const p: PlayerWithId = {}
          p.FirstName = element.FirstName,
          p.LastName = element.LastName,
          p.objectId = element.objectId,
          p.islibero = false,
          p.fullName = element.FirstName + ' ' + element.LastName
          _this.players.push(p);
        })

          _this.selectedPlayers = _this.players.slice()  
          _this.selectedPlayers = _this.selectedPlayers.sort((t1, t2) => {
            const name1 = t1.LastName.toLowerCase();
            const name2 = t2.LastName.toLowerCase();
            if (name1 > name2) { return 1; }
            if (name1 < name2) { return -1; }
            return 0;
          });

          this.players = this.selectedPlayers;
          this.availablePlayers = this.selectedPlayers;
          // this.players = data.map(e => {
          //   return {
          //     id: e.payload.doc.id,
          //     ...e.payload.doc.data() as {}
          //   } as PlayerWithId;
          // })
          for (let index = 0; index < this.players.length; index++) {
            const element = this.players[index];
            this.players[index].fullName = this.players[index].FirstName + " " + this.players[index].LastName
          }
      })
    }
    else {
      console.log("app is online")
      await this.matchService.getPlayers().then(data => {
        var json = JSON.stringify(data);
        var d = JSON.parse(json);
        this.selectedPlayers = d
  
        this.selectedPlayers = this.selectedPlayers.sort((t1, t2) => {
          const name1 = t1.LastName.toLowerCase();
          const name2 = t2.LastName.toLowerCase();
          if (name1 > name2) { return 1; }
          if (name1 < name2) { return -1; }
          return 0;
        });
  
        this.players = this.selectedPlayers;
        this.availablePlayers = this.selectedPlayers;
        // this.players = data.map(e => {
        //   return {
        //     id: e.payload.doc.id,
        //     ...e.payload.doc.data() as {}
        //   } as PlayerWithId;
        // })
        for (let index = 0; index < this.players.length; index++) {
          const element = this.players[index];
          this.players[index].fullName = this.players[index].FirstName + " " + this.players[index].LastName
        }
      });
    }
    //#endregion
  
  }


  //#region Dialogs
  AddMatch() {
    this.dialogHome = ""
    this.dilogOpponent = ""
    this.gameDate.setValue(new Date)
    this.dialogMatchId = ""
    this.matchDialogDisplay = true;
    this.selectedTeamId = "";
    //this.matchService.createMatch("Fusion", "Ballyhoo", new Date());
    //this.getMatches();
  }
  showDialog() {
    this.display = true;
  }
  showPlayerDialog() {
    this.newPlayer = false;
    this.player = new PlayerWithId("","","",false,)
    this.playerDialogDisplay = true;
    //this.matchService.addPlayers();
    //this.getPlayers()
  }
  showAddTeamDialog() {
    //this.newPlayer = false;
    //this.player = new PlayerWithId("","","",false,)
    this.addTeamDialogDisplay = true;
    //this.matchService.addPlayers();
    //this.getPlayers()
  }
  onPlayerSelect(event) {
    this.newPlayer = false;
    this.player = this.clonePlayer(event.data);
    this.player.objectId = event.data.objectId;
    this.playerDialogDisplay = true;
  }
  async onTeamSelect(event) {
    this.newTeam = false;
    this.team = this.cloneTeam(event.data);
    this.selectedTeamName = this.team.TeamName;
    this.selectedTeamId = this.team.objectId;
    this.selectedTeamClubId = this.team.ClubId
    this.selectedTeamYear = this.team.Year;
    await this.matchService.getPlayers().then(data => {
      var json = JSON.stringify(data);
      var d = JSON.parse(json);
      this.selectedPlayers = d
      this.getTeamPlayers()
      this.teamDialogDisplay = true;
    })
  }
  showDialogToAdd() {

    //this.matchService.addPlayers();
    //this.getPlayers()
    //this.displayDialog = true;
  }
  AddPlayerToTeam() {
       this.playersDialogListDisplay = true
  }
  //#endregion

  
  //#region Operations
  async getTeamPlayers() {
    this.teamPlayers = []
    this.teamPlayerIDs = []
    this.pickedPlayers = []
    this.availablePlayers = []
    this.selectedPlayers.forEach((x) => {
      this.availablePlayers.push(Object.assign({}, x));
    })
     await this.matchService.getPlayersByTeamId(this.team.objectId).then(result => {
      var json = JSON.stringify(result);
      var data = JSON.parse(json);
      data.forEach(p => {
        var pl = this.selectedPlayers.filter(x => x.objectId == p.PlayerId)[0];
        this.availablePlayers.forEach( (item, index) => {
          if(item.objectId == pl.objectId) 
          {
            this.availablePlayers.splice(index,1); 
          }
        });
        //this.pickedPlayers.push(this.selectedPlayers.filter(x => x.objectId = p.PlayerId)[0]);
        let tp = new TeamPlayerWithID()
        tp.FirstName = pl.FirstName
        tp.LastName = pl.LastName
        tp.objectId = p.objectId;
        tp.jersey = p.Jersey
        this.teamPlayers.push(tp);
      });
    })
  }

  onEditComplete(event) {
    this.matchService.updatePlayerJersey(event.field, event.data).subscribe(result => {
    })
  }

 

  AddPlayer() {
    this.matchService.addPlayersToTeam(this.pickedPlayers, this.team.objectId).subscribe(result => {
      this.getTeamPlayers()
      this.playersDialogListDisplay = false
    })
  }

 
  RemovePlayer() {
    const TeamPlayers = Parse.Object.extend('TeamPlayers');
    const query = new Parse.Query(TeamPlayers);
    // here you put the objectId that you want to delete
    query.get(this.selectedTeamPlayerId).then((object) => {
      object.destroy().then((result) => {
        this.getTeamPlayers()
      })
    })
  }

  start() {
    this.matchDialogDisplay = false;
    let gm = new gameMatch();
    gm.gameNumber = this.game;
    gm.Home = this.match.Home;
    gm.MatchDate = this.match.MatchDate;
    gm.objectId = this.match.objectId;
    gm.Opponent = this.match.Opponent;
    gm.HomeTeamId = this.match.HomeTeamId;

    this._ngZone.run(() => {
      this.router.navigate(["match", gm]).then(result => {
        this.matchDialogDisplay = false;
      });
    });

   
  }

  summary() {

    this.matchDialogDisplay = false;
    let gm = new gameMatch();
    if(this.offline == false) {
      this.matchService.getGameId(this.game, this.match.objectId).then(result => {
        var json = JSON.stringify(result);
        var g = JSON.parse(json);
        gm.gameNumber = this.game;
        gm.Home = this.match.Home;
        gm.MatchDate = this.match.MatchDate;
        gm.objectId = this.match.objectId;
        gm.Opponent = this.match.Opponent;
        gm.gameId = g[0].objectId
        this.router.navigate(["summary", gm]);
      })
    } else {
      this.offlineservice.getGameId(this.game, this.match.objectId).then(result => {
        var json = JSON.stringify(result);
        var g = JSON.parse(json);
        gm.gameNumber = this.game;
        gm.Home = this.match.Home;
        gm.MatchDate = this.match.MatchDate;
        gm.objectId = this.match.objectId;
        gm.Opponent = this.match.Opponent;
        gm.gameId = g[0].objectId
        this.router.navigate(["summary", gm]);
      })
    }
  }

  cloneMatch(m: Match): Match {
    let match = {};
    for (let prop in m) {
      match[prop] = m[prop];
    }
    return match;
  }

  cloneTeam(t: Team): Team {
    let team = {};
    for (let prop in t) {
      team[prop] = t[prop];
    }
    return team;
  }

  clonePlayer(p: Player): Player {
    let player = {};
    for (let prop in p) {
      player[prop] = p[prop];
    }
    return player;
  }



  setGame(n) {
    this.game = n
  }


  ngOnDestroy() {
  }

  SavePlayer() {
    this.matchService.savePlayer(this.player).then(result => {
      this.matchService.getPlayers().subscribe(data => {
        var json = JSON.stringify(data);
        var d = JSON.parse(json);
        this.players = d
        this.playerDialogDisplay = false;
      })
    })
  }

  SaveTeam($event) {
    if (this.selectedTeamId == "") {
      let t = new TeamWithId()
      t.TeamName = this.teamName;
      t.ClubId = this.selectedClubId;
      this.matchService.createTeam(t).subscribe(data => {
        this.addTeamDialogDisplay = false;
        this.teamDialogDisplay = false;
        this.matchService.getTeams().subscribe(data => {
          var json = JSON.stringify(data);
          this.teams = JSON.parse(json);
        });
      })
    }
    else {
      let t = new TeamWithId()
      t.TeamName = this.selectedTeamName;
      t.ClubId = this.selectedTeamClubId;
      t.Year = this.selectedTeamYear
      t.objectId = this.selectedTeamId
      this.matchService.upDateTeam(t).subscribe(data => {
        this.addTeamDialogDisplay = false;
        this.teamDialogDisplay = false;
        this.matchService.getTeams().subscribe(data => {
          var json = JSON.stringify(data);
          this.teams = JSON.parse(json);
        });
      })
    } 
   
  }


  DeletePlayer() {
    this.matchService.deletePlayer(this.player).then(result => {
      this.matchService.getPlayers().subscribe(data => {
        var json = JSON.stringify(data);
        var d = JSON.parse(json);
        this.players = d
        this.playerDialogDisplay = false;
      })
    })
  }

  getClubNameById(id: string) {
    var c =  this.clubs.filter(x => x.objectId == id)[0]
    if (c) {
      return c.ClubName
    }
    else {
      return ''
    }
  }
  
  onChange($event) {
    this.selectedTeamName = $event.target.options[$event.target.options.selectedIndex].text;
    var split = $event.target.options[$event.target.options.selectedIndex].value.split(":");
    this.selectedTeamId = split[1].trim();
  } 

  onClubChange($event) {
    this.selectedClubName = $event.target.options[$event.target.options.selectedIndex].text;
    var split = $event.target.options[$event.target.options.selectedIndex].value.split(":");
    this.selectedClubId = split[1].trim();
  } 

  onTeamClubChange($event) {
    var split = $event.target.options[$event.target.options.selectedIndex].value.split(":");
    this.selectedTeamClubId = split[1].trim();
  }

  onClubYearChange($event) {
    var split = $event.target.options[$event.target.options.selectedIndex].value.split(":");
    this.selectedTeamYear = Number(split[1].trim());
  }

 

  DeleteMatch() {
    this.matchService.deleteMatch(this.match.objectId).then(result => {
      console.log(result)
    })
    // const Match = Parse.Object.extend('Matches');
    // const query = new Parse.Query(Match);
    // // here you put the objectId that you want to delete
    // query.get(this.match.objectId).then((object) => {
    //   object.destroy().then(async (response) => {
    //     await this.matchService.getMatches().then(result => {
    //       var json = JSON.stringify(result);
    //       this.matches = JSON.parse(json);
    //       this.matchDialogDisplay = false;
    //     });  
    //   });
    // });
  }

  onRowSelect(event) {
    this.dialogHome = event.data.Home
    this.dilogOpponent = event.data.Opponent
    //this.gameDate.setValue(this.matchService.datefromepoch(event.data.matchdate))
    this.dialogMatchId = event.data.objectId
    this.match = event.data
    this.selectedTeamId = event.data.HomeTeamId;
    this.matchDialogDisplay = true;
    this.newMatch = false;
  }

  onTeamPlayerSelect(e) {
    this.selectedTeamPlayerId = e.data.objectId
  }

  async SaveMatch() {
    let match = new MatchWithId()
    match.HomeTeamId = this.selectedTeamId
    //match.Home = this.ma
    let formattedDt = formatDate(this.gameDate.value, 'MM/dd/yyyy', 'en_US')
    match.MatchDate = formattedDt
    match.objectId = this.dialogMatchId
    match.Home = this.match.Home
    // if(match.objectId == 'undefined' || match.objectId == null || match.objectId == "")
    // {
    //   match.objectId = Guid.create().toString()
    // }
    match.Opponent = this.dilogOpponent
    match.Home = this.selectedTeamName
    if(this.offline == true) {
      await this.offlineservice.createMatch(match).then( result => {
        this.offlineservice.getMatches().subscribe(result => {
          this.matches = result;
        });
      })
    }
    else {
      this.matchService.saveMatch(match).then(data => {
        this.matchService.getMatches().then(result => {
          var json = JSON.stringify(result);
          this.matches = JSON.parse(json);
        });
      });
    }
    this.matchDialogDisplay = false;
    this.click = false
  }

  onTeamPlayerSelection(e) {
      console.log(e);
  }
  //#endregion

  //#region Data Sync

  async SyncOfflineData() {
    await this.offlineservice.getMatchesForSync().then(matches => {
      matches.forEach(match => {
        const offlineMatchId = match.objectId
        const newMatch = {
          Home: match.Home,
          HomeTeamId: match.HomeTeamId,
          Opponent: match.Opponent,
          MatchDate: match.MatchDate
        } as MatchWithId;
        //First create the matrch and get the objectId 
        this.matchService.createMatch(newMatch).subscribe(result => {
          this.matchService.loadMatches()
          var json = JSON.stringify(result);
          var data = JSON.parse(json);
          let matchId = data.objectId
          //Now create the games
          this.offlineservice.getGamesForSync(offlineMatchId).then(games => {
            games.forEach(game => {
              const offlineGameId = game.objectId
              const newGame = {
                gamenumber: game.GameNumber,
                matchid: matchId,
                HomeScore: game.HomeScore,
                OpponentScore: game.OpponentScore,
                subs: game.Subs
              } as GameWithId
              this.matchService.createGame(newGame).subscribe(result => {
                var json = JSON.stringify(result);
                var data = JSON.parse(json);
                let gameid = data.objectId
                newGame.objectId = data.objectId
                var rotation = ""
                //For each game create stats and play-by-play
                this.offlineservice.getstats(offlineGameId).then(stats => {
                  stats.forEach(stat => {
                    
                    const data = JSON.parse(stat.Rotation)

                    // var rotations: pbpPosition[] = [];
                    // for (let index = 1; index < 7; index++) {
                    //   let p = new pbpPosition();
                    //   p.playerName = stat.positions[index].player.FirstName;
                    //   p.posNo = index;
                    //   p.objectId = stat.positions[index].player.objectId
                    //   rotations.push(p);
                    // }

                    let statObj = {
                      //statorder: await this.getMaxStatId(),
                      gameId : newGame.objectId,
                      homeScore : stat.HomeScore,
                      opponentScore : stat.OpponentScore,
                      playerid : stat.PlayerId,
                      stattype : stat.StatType,
                      subs : stat.Subs,
                      rotation: data,
                    };
                    
                    this.matchService.createStat(statObj, newGame)
                  });
                  this.offlineservice.getPlayByPlayById(offlineGameId).then(plays => {
                    plays.forEach(play => {
                      
                      const cp = new CourtPosition();
                      this.matchService.syncPlayByPlay(newGame,rotation,play.stattype, play.playerid, play.action )
                    });
                    this.messageService.add({severity:'success', summary:'Upload Successfull', detail:'The data from this device has been successfully uploaded'});
                  })
                })
              })
            });
          })
        })
      });
    })
  }


  //#endregion

  //#region Download Teams
  async DownloadData() {
    this.getPlayByPlay()
    this.offlineservice.loadMatches()
    this.getOnlineClubs()
    this.getTeamPlayersAsync()
    this.getTeams()
    this.getGames()
    this.deletePlayers().then(result => {
      this.getOnlinePlayers()
    })
    this.messageService.add({severity:'success', summary:'Download Successfull', detail:'This device is ready for offline usage'});
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
      await this.offlineservice.bulkAddPlayers(players)
    })
  }

  async deletePlayers() {
    await this.offlineservice.bulkdeletePlayers().then(result => {
      return result;
    })
  }
  async getGames() {
    this.offlineservice.loadGames()
    this.offlineservice.getGames().subscribe(result => {
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
      await this.offlineservice.bulkAddTeams(teams)
      //this.addPlayer()
    })
  }

  async getTeamPlayersAsync() {
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
      await this.offlineservice.bulkAddTeamPlayers(teamplayers)
      //this.addPlayer()
    })
  }

  async getPlayByPlay() {
    this.offlineservice.loadPBP()
    this.offlineservice.getPlayByPlay().subscribe(result => {
      //console.log(result)
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
      await this.offlineservice.bulkAddClubs(clubs)
      //this.addPlayer()
    })
  }
 
  //#endregion

  //#region Reset Database
  resetDatabase() {
    this.offlineservice.clearPBPTable()
    this.offlineservice.clearStatsTable()
    this.offlineservice.clearGamesTable()
    this.offlineservice.clearMatchesTable()
    this.offlineservice.clearTeamsTable()
    this.offlineservice.clearTeamPlayersTable()
    this.offlineservice.clearClubsTable()
    this.offlineservice.clearPlayersTable()
    this.messageService.add({severity:'success', summary:'Reset Successfull', detail:'The data from this device has been cleared'});
  }
  //#endregion

}
