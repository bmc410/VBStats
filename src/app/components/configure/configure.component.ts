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
  TeamPlayerWithID
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
  teamPlayers: PlayerWithId[] = [];
  teamPlayerIDs: TeamPlayerWithID[] = []
  match: MatchWithId = {};
  player: PlayerWithId = {};
  matches: Match[] = [];
  display: boolean = false;
  matchDate: Date;
  items: MenuItem[];
  teams: TeamWithId[] = [];
  team: TeamWithId;
  selectedTeamName = ""
  selectedTeamId = ""
  game = 1;

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
  playersDialogListDisplay: boolean = false;
  selectedMatch: Match;
  selectedPlayer: Player;
  selectedPlayers: PlayerWithId[];
  selectedTeamPlayer: Player;
  selectedTeam: TeamWithId;
  newMatch: boolean;
  newPlayer: boolean;
  newTeam: boolean;
  gameMatch: gameMatch;
  status = "ONLINE";
  isConnected = true;
  matchsubcription: any;
  gameDate = new FormControl(new Date());

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

  onPlayerSelect(event) {
    this.newPlayer = false;
    this.player = this.clonePlayer(event.data);
    this.playerDialogDisplay = true;
  }

  getTeamPlayers() {
    this.teamPlayers = []
    this.teamPlayerIDs = []
    this.matchService.getPlayersByTeamId(this.team.objectId).subscribe(result => {
      var json = JSON.stringify(result);
      var data = JSON.parse(json);
      var data1 = JSON.parse(data[0].Roster);
      this.teamPlayers = []
      data1.forEach(element => {
        this.teamPlayers.push(element)        
      });

      this.teamPlayers.sort((a, b) => {
        return +a.jersey - +b.jersey;
      });

      //this.teamPlayers.sort((a, b) => (a.jersey - b.jersey) ? 1 : -1)
      console.log(this.teamPlayers)
    });
  }s

  onTeamSelect(event) {
    this.newTeam = false;
    this.team = this.cloneTeam(event.data);
    this.selectedTeamName = this.team.TeamName;
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
    console.log(this.selectedPlayers)
    for (let index = 0; index < this.selectedPlayers.length; index++) {
      const player = this.selectedPlayers[index];
      let tp = {
        playerId: player.playerid
      }
      this.matchService.AddPlayerToFirestoreTeam(this.selectedTeam, tp)
      //this.getTeamPlayers()
      this.playersDialogListDisplay = false
    }
  }

  RemovePlayer() {
    console.log(this.selectedPlayers)
    const teamplayer = this.teamPlayerIDs.filter(x => x.playerId === this.selectedTeamPlayer.playerid)[0]
    this.matchService.RemovePlayerFromFirestoreTeam(this.selectedTeam, teamplayer.id)
    //this.getTeamPlayers()
    this.playersDialogListDisplay = false

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

    this.matchService.getTeams().subscribe(data => {
      var json = JSON.stringify(data);
      this.teams = JSON.parse(json);
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

  SaveTeam() {
    let t = new TeamWithId()
    t.TeamName = this.team.TeamName
    this.matchService.saveTeam(t);
    this.playerDialogDisplay = false;
  }


  DeletePlayer() {

  }
  
  onChange($event) {
    this.selectedTeamName = $event.target.options[$event.target.options.selectedIndex].text;
    var split = $event.target.options[$event.target.options.selectedIndex].value.split(":");
    this.selectedTeamId = split[1].trim();
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

  async DeleteMatch() {

    let promise = new Promise((resolve, reject) => {
      this.matchService.deleteMatch(this.match.objectId)
    });

    let result = await promise; // wait until the promise resolves (*)
    this.matchService.getMatches().subscribe(result => {
      var json = JSON.stringify(result);
      this.matches = JSON.parse(json);
      this.matchDialogDisplay = false;
    });
    
    // await this.matchService.deleteMatch(this.match.objectId).then(result => {
    //   this.matchService.getMatches().subscribe(result => {
    //     var json = JSON.stringify(result);
    //     this.matches = JSON.parse(json);
    //     this.matchDialogDisplay = false;
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
}
