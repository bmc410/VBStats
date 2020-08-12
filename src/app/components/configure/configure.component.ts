import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import { CarService } from "../../services/carservice";
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
  ClubWithId
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

@Component({
  selector: "app-configure",
  templateUrl: "./configure.component.html",
  styleUrls: ["./configure.component.css"]
})
export class ConfigureComponent implements OnInit {
  availableCars: Car[];
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

  constructor(
    private matchService: MatchService,
    private router: Router,
    private connectionService: ConnectionService
  ) {
    this.playerPositions = [];
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
    this.playerDialogDisplay = true;
  }

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

  onTeamSelect(event) {
    this.newTeam = false;
    this.team = this.cloneTeam(event.data);
    this.selectedTeamName = this.team.TeamName;
    this.selectedTeamId = this.team.objectId;
    this.selectedTeamClubId = this.team.ClubId
    this.selectedTeamYear = this.team.Year;
    this.getTeamPlayers()
    this.teamDialogDisplay = true;
  }

  showDialogToAdd() {

    //this.matchService.addPlayers();
    //this.getPlayers()
    //this.displayDialog = true;
  }

  AddPlayerToTeam() {
       this.playersDialogListDisplay = true
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
    this.router.navigate(["match", gm]);
  }

  summary() {
    this.matchDialogDisplay = false;
    let gm = new gameMatch();
    gm.gameNumber = this.game;
    gm.Home = this.match.Home;
    gm.MatchDate = this.match.MatchDate;
    gm.objectId = this.match.objectId;
    gm.Opponent = this.match.Opponent;
    this.router.navigate(["summary", gm]);
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

  ngOnInit() {

    let year = new Date().getFullYear();
    this.teamYears.push(year);
    for (let index = 1; index < 5; index++) {
      year += 1;
      this.teamYears.push(year);
    }

    this.matchService.getTeams().subscribe(data => {
      var json = JSON.stringify(data);
      this.teams = JSON.parse(json);
    });

    this.matchService.getClubs().subscribe(data => {
      var json = JSON.stringify(data);
      this.clubs = JSON.parse(json);
    });

   /*  Parse.serverURL = 'https://parseapi.back4app.com'; // This is your Server URL
    Parse.initialize(
      '6jtb78oSAiGeNv2mcJTN0h039TxkJh4HDrWBz7RT', // This is your Application ID
      'bRolkvWkFSewPWnlqQOaaRTpgT16ILr6r7PnU6AY', // This is your Javascript key
      'dHvEstEM97ue9pBcTcW8ofNyqS2ERqT7kg4CnYhX' // This is your Master key (never use it in the frontend)
    );
    const Matches = Parse.Object.extend('Matches');
    const query = new Parse.Query(Matches);
    var ma;
    return query.find().then((results) => {
      var json = JSON.stringify(results);
      //ma = JSON.parse(json);
      //console.log('Matches found', obj);
      this.matches = JSON.parse(json);
    }); */


    this.matchService.getMatches().subscribe(result => {
      var json = JSON.stringify(result);
      this.matches = JSON.parse(json);
    });
 
    this.matchService.getPlayers().subscribe(data => {
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

  SavePlayer() {
    let p = new PlayerWithId("","","",false)
    p.jersey = this.player.jersey
    p.FirstName = this.player.FirstName
    p.LastName = this.player.LastName
    p.islibero = this.player.islibero
    this.matchService.savePlayer(p)
    this.playerDialogDisplay = false;
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

  DeleteMatch() {
    const Match = Parse.Object.extend('Matches');
    const query = new Parse.Query(Match);
    // here you put the objectId that you want to delete
    query.get(this.match.objectId).then((object) => {
      object.destroy().then((response) => {
        this.matchService.getMatches().subscribe(result => {
          var json = JSON.stringify(result);
          this.matches = JSON.parse(json);
          this.matchDialogDisplay = false;
        });  
      });
    });
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

  SaveMatch() {
    let match = new MatchWithId()
    match.HomeTeamId = this.selectedTeamId
    match.MatchDate = this.gameDate.value
    match.objectId = this.dialogMatchId
    match.Opponent = this.dilogOpponent
    match.Home = this.selectedTeamName
    this.matchService.saveMatch(match).subscribe(data => {
      this.matchService.getMatches().subscribe(result => {
        var json = JSON.stringify(result);
        this.matches = JSON.parse(json);
      });
    });
    
    this.matchDialogDisplay = false;
  }

  onTeamPlayerSelection(e) {
      console.log(e);
  }

}
