import { Component, OnInit } from "@angular/core";
import {
  CourtPosition,
  Match,
  Stat,
  GameScore,
  StatNib,
  gameMatch,
  PlayerWithId,
  Game,
  GameWithId,
  statEntry,
  TeamWithId
} from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import { FormGroup, FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { catchError, switchMap } from 'rxjs/operators';
import { Parse } from 'parse';
import { NetworkService } from 'src/app/services/network.service';
import { OfflineService } from 'src/app/services/offline.service';
import { IGames } from 'src/app/models/dexie-models';
import { Guid } from 'guid-typescript';
import { faMinus, faPlus, faArrowsAlt, faPlay, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: "app-match",
  templateUrl: "./match.component.html",
  styleUrls: ["./match.component.css"]
})
export class MatchComponent implements OnInit {
  faMinus = faMinus;
  faPlus = faPlus;
  faArrowsAlt = faArrowsAlt;
  faPlay=faPlay;
  faExchangeAlt=faExchangeAlt;

  playerPositions: CourtPosition[];
  draggedplayer: PlayerWithId;
  players: PlayerWithId[] = [];
  allPlayers: PlayerWithId[] = [];
  games: GameWithId[] = [];
  game: GameWithId;
  match: gameMatch;
  teams: TeamWithId[] = [];
  team: TeamWithId;
  display = false;
  matchDate: Date;
  matchStats: Stat[] = [];
  stats: statEntry[] = [];
  stat: Stat;
  gameNumber = 1;
  gameScore: GameScore;
  statId = 0;
  home = "";
  opponent = "";
  homescore = 0;
  opponentscore = 0;
  homepointOptions = ["k", "sa", "b"];
  opponentpointOptions = ["he", "be", "bhe", "sre", "se"];
  liberoDisabled = false;
  hs = 0;
  os = 0;
  mobile = false;
  startHidden = false;
  offline: boolean;
  c: IGames
  zoom = false
  //currentGame: <Observable> GameWithId();
  //let currentGame = this.matchService.getGameByNumber(this.gameNumber, this.match.matchid);

  constructor(
    private matchService: MatchService,
    private route: ActivatedRoute,
    private router: Router,
    private networkService: NetworkService,
    private offlineservice: OfflineService
  ) {
    this.playerPositions = [];
    this.networkService.currentStatus.subscribe(result => {
      this.offline = result
    })
  }

  async ngOnInit() {

    var _this = this;
    if (window.screen.width <= 768) { // 768px portrait
      this.mobile = true;
      console.log(this.mobile)
    }

    for (let index = 0; index < 7; index++) {
      const c = new CourtPosition();
      c.playerPos = " Drop Player";
      c.posNo = index;
      this.playerPositions.push(c);
    }

    if (this.route.snapshot.params.objectId != undefined)
      this.match = this.route.snapshot.params;
    else {
      this.router.navigate(['configure']);
      return
    }

    this.game = new GameWithId()
    this.gameScore = new GameScore();
    this.gameNumber = Number(this.match.gameNumber);
    this.game.subs = 0;

    
    //#region 
    if(this.offline == true) {
      this.offlineservice.getPlayers().subscribe(async result => {
        var allplayers = result
        await this.offlineservice.getPlayersByTeamId(this.match.HomeTeamId).then(async result => {
          var teamplayers =  result
          teamplayers.forEach(p => {
            var player = allplayers.filter(x => x.objectId == p.playerid)[0]
            player.jersey = teamplayers.filter(x => x.playerid == player.objectId)[0].jersey
            this.players.push(player);
          });
          this.allPlayers = this.players.slice();
          
          await this.offlineservice.getGameId(this.gameNumber,this.match.objectId)
            .then(async game => {
              console.log(game)
              if (game.length == 0) {
                const g = {} as IGames
                g.GameNumber = this.gameNumber
                g.MatchId = this.match.objectId
                g.OpponentScore = 0
                g.HomeScore = 0
                g.Subs = 0
                g.objectId = Guid.create().toString()
                this.offlineservice.createGame(g).then(result => {
                  this.offlineservice.getGameId(this.gameNumber,this.match.objectId).then(result => {
                    this.game.objectId = result[0].objectId
                    this.game.HomeScore = 0;
                    this.game.OpponentScore = 0;
                    this.game.subs = 0;
                    this.game.gamenumber = this.gameNumber;
                  })
                })
              }
              else {
                this.game = new GameWithId()
                this.game.HomeScore = game[0].HomeScore
                this.game.objectId = game[0].objectId
                this.game.matchid = game[0].MatchId
                this.game.OpponentScore = game[0].OpponentScore
                this.game.subs = game[0].Subs

                var o = this.offlineservice.getofflinestats(this.game.objectId)

                await this.offlineservice.getstats(this.game.objectId).then(stats => {
                  stats.forEach(function (s) {
                    var rotation = JSON.parse(s.Rotation);
                    const st = {} as statEntry;
                      //statid: s.GameId,
                      st.PlayerId = s.PlayerId
                      st.homescore = s.HomeScore
                      st.opponentscore = s.OpponentScore
                      st.gamenumber = _this.match.gameNumber
                      st.StatType = s.StatType
                      st.id = s.objectId
                      st.rotation = rotation
                      st.subs = s.Subs
                    _this.stats.push(st); 
                  });
          
                  if (this.stats && this.stats.length > 0) {
                    this.startMatch();
                    var r = this.stats[this.stats.length-1]
                    this.game.HomeScore = r.homescore;
                    this.game.OpponentScore = r.opponentscore;
                    this.game.subs = r.subs;
                    var pos = r.rotation
                    for (let i = 0; i < 6; i++) {
                      var p1 = this.allPlayers.filter(p => p.objectId == pos[i].objectId)[0]
                      this.playerPositions[i + 1].posNo = pos[i].posNo;
                      this.playerPositions[i + 1].player = p1;
                      this.playerPositions[i + 1].playerPos =
                        p1.FirstName + " - " + p1.jersey;
                      this.players = this.players.filter(x => x.objectId != p1.objectId)
                    }
                  }
                });
                this.game.gamenumber = this.match.gameNumber;
                this.game.objectId = game[0].objectId;
                this.game.subs = game[0].Subs;


                
              }
            })
        })
      })
    } else {
      await this.matchService.getPlayers().then(async allPlayers => {
        var json = JSON.stringify(allPlayers);
        var tpData = JSON.parse(json);
        await this.matchService.getPlayersByTeamId(this.match.HomeTeamId).then(async teamPlayers => {
          var json1 = JSON.stringify(teamPlayers);
          var tpData1 = JSON.parse(json1);
          tpData1.forEach(p => {
            var player = tpData.filter(x => x.objectId == p.PlayerId)[0]
            player.jersey = tpData1.filter(x => x.PlayerId == player.objectId)[0].Jersey
            this.players.push(player);
          });
  
          this.allPlayers = this.players.slice();
    
          await this.matchService.getGameForMatchByNumber(this.match.objectId, this.match.gameNumber).then(async result => {
            var json = JSON.stringify(result);
            var game = JSON.parse(json);
            if (game.length == 0) {
                  let g = new GameWithId()
                  g.gamenumber = this.gameNumber
                  g.matchid = this.match.objectId
                  g.OpponentScore = 0
                  g.HomeScore = 0
                  g.subs = 0
                  this.matchService.createGame(g).subscribe(result => {
                    this.matchService.getGameForMatchByNumber(this.match.objectId, this.gameNumber).then(result => {
                      var j = JSON.stringify(result);
                      var game = JSON.parse(j);
                      this.game.objectId = game[0].objectId;
                      this.game.HomeScore = 0;
                      this.game.OpponentScore = 0;
                      this.game.subs = 0;
                      this.game.gamenumber = this.gameNumber;
                    })
                  })
            }
            
            else {
              this.game = game[0];
              await this.matchService.getstats(this.game.objectId).then(data => {
                var j = JSON.stringify(data);
                var stats = JSON.parse(j);
                stats.forEach(function (s) {
                  var rotation = JSON.parse(s.Rotation);
                  let stat = {
                    statid: s.GameId,
                    homescore: s.HomeScore,
                    matchid: s.OpponentScore,
                    gamenumber: _this.match.gameNumber,
                    stattype: s.StatType,
                    playerid: s.PlayerId,
                    statdate: s.createdAt,
                    //pos: Map<any,any>,
                    id: s.objectId,
                    opponentscore: s.OpponentScore,
                    rotation: rotation,
                    subs: s.Subs
                  }
                  _this.stats.push(stat); 
                });
        
                if (this.stats && this.stats.length > 0) {
                  this.startMatch();
                  var r = this.stats[this.stats.length-1]
                  this.game.HomeScore = r.homescore;
                  this.game.OpponentScore = r.opponentscore;
                  this.game.subs = r.subs;
                  var pos = r.rotation
                  for (let i = 0; i < 6; i++) {
                    var p1 = this.allPlayers.filter(p => p.objectId == pos[i].objectId)[0]
                    this.playerPositions[i + 1].posNo = pos[i].posNo;
                    this.playerPositions[i + 1].player = p1;
                    this.playerPositions[i + 1].playerPos =
                      p1.FirstName + " - " + p1.jersey;
                    this.players = this.players.filter(x => x.objectId != p1.objectId)
                  }
                }
              });
              this.game.gamenumber = this.match.gameNumber;
              this.game.objectId = game[0].objectId;
              this.game.subs = game[0].Subs;
              }
            })  
          })
      })
  
    }
    //#endregion
    
  

  }

  matchForm = new FormGroup({
    home: new FormControl(""),
    opponent: new FormControl(""),
    dateofmatch: new FormControl("")
  });

  droppedData: string;

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.log(this.matchForm.value);
    this.home = this.matchForm.value.home;
    this.opponent = this.matchForm.value.opponent;
    this.matchDate = this.matchForm.value.dateofmatch;
    //this.matchService.createMatch(this.home, this.opponent, this.matchDate);
    this.display = false;
  }

  drop(event: CdkDragDrop<PlayerWithId[]>, container: any) {

    var affectedPlayers: PlayerWithId[] = [];
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return false;
    }

    // first check to see if the position contains a player
    if (this.playerPositions[container].player) {
      affectedPlayers.push(this.playerPositions[container].player);
      this.players.push(this.playerPositions[container].player);
    }

    this.draggedplayer = event.previousContainer.data[event.previousIndex];
    affectedPlayers.push(this.draggedplayer);
    event.previousContainer.data =
      event.previousContainer.data.filter(x => x.objectId != this.draggedplayer.objectId)

    //if not libero then add a sub
    if (!this.draggedplayer.islibero &&
        this.startHidden &&
      (this.playerPositions[container].player  &&
        !this.playerPositions[container].player.islibero))
      {
      //this.game.subs += 1;
      this.updateGame('subs', 'a', '', affectedPlayers)
    }

    if (container === 4) {
      this.playerPositions[4].posNo = 4;
      this.playerPositions[4].player = this.draggedplayer;
      this.playerPositions[4].playerPos =
        this.draggedplayer.FirstName + " - " + this.draggedplayer.jersey;
    } else if (container === 3) {
      this.playerPositions[3].posNo = 3;
      this.playerPositions[3].player = this.draggedplayer;
      this.playerPositions[3].playerPos =
        this.draggedplayer.FirstName + " - " + this.draggedplayer.jersey;
    } else if (container === 2) {
      this.playerPositions[2].posNo = 2;
      this.playerPositions[2].player = this.draggedplayer;
      this.playerPositions[2].playerPos =
        this.draggedplayer.FirstName + " - " + this.draggedplayer.jersey;
    } else if (container === 5) {
      this.playerPositions[5].posNo = 5;
      this.playerPositions[5].player = this.draggedplayer;
      this.playerPositions[5].playerPos =
        this.draggedplayer.FirstName + " - " + this.draggedplayer.jersey;
    } else if (container === 6) {
      this.playerPositions[6].posNo = 6;
      this.playerPositions[6].player = this.draggedplayer;
      this.playerPositions[6].playerPos =
        this.draggedplayer.FirstName + " - " + this.draggedplayer.jersey;
    } else if (container === 1) {
      this.playerPositions[1].posNo = 1;
      this.playerPositions[1].player = this.draggedplayer;
      this.playerPositions[1].playerPos =
        this.draggedplayer.FirstName + " - " + this.draggedplayer.jersey;
    }

    this.players = this.players.filter(
      i => i.jersey !== this.draggedplayer.jersey
    );
    this.draggedplayer = null;
  }

  // dragEnd(event) {}

  logData(event) {
    console.log("Element was dragged", event);
  }

  showDialog() {
    this.display = true;
  }

  subClick() {

  }

  fillPlayerSpot(id: string) {

  }

  rotate() {
    let positionsFilled = true;
    for (let index = 1; index < 7; index++) {
      if (!this.playerPositions[index]) {
        positionsFilled = false;
        break;
      }
    }

    if (!positionsFilled) {
      return;
    }

    const tempPlayer = this.playerPositions[1];
    this.playerPositions[1] = this.playerPositions[2];
    this.playerPositions[2] = this.playerPositions[3];
    this.playerPositions[3] = this.playerPositions[4];
    this.playerPositions[4] = this.playerPositions[5];
    this.playerPositions[5] = this.playerPositions[6];
    this.playerPositions[6] = tempPlayer;
  }

  postScore(event) {
    console.log(event);
    this.updateGame(event.team, event.action, event.stat, event.player)
  }

  updateGame(team: string, action: any, stat: string, players: PlayerWithId[]) {


    if (team === "home") {
      if (action === "a"){
        this.game.HomeScore = this.game.HomeScore + 1
      }
      else {
        this.game.HomeScore = this.game.HomeScore - 1
      }
    }
    else if (team === "opponent") {
      if (action === "a") {
        this.game.OpponentScore = this.game.OpponentScore + 1
      }
      else {
        this.game.OpponentScore = this.game.OpponentScore - 1
      }
    }
    else {
        stat = "sub"
        if (action === "a")
          this.game.subs = this.game.subs + 1
        else
          this.game.subs = this.game.subs - 1
    }


    const myClonedArray = []; 

    if(this.offline == false) {
      this.matchService.updateGame(this.game)
      this.playerPositions.forEach(val => myClonedArray.push(Object.assign({}, val)));
      this.matchService.addPlayByPlay(this.game,myClonedArray,stat,
        players, "")
    }
    else {
      this.offlineservice.updateGame(this.game).then(result => {
        this.playerPositions.forEach(val => myClonedArray.push(Object.assign({}, val)));
        this.offlineservice.addPlayByPlay(this.game,myClonedArray,stat,
          players, "")
      })
    }
  }

  postStat(s: StatNib) {
    let p = this.playerPositions[s.pos].player;
    this.incrementStat(s.pos, p, s.stattype);
    console.log(p);
  }

  postSign(e) {
    this.updateGame(e.team, e.action, e.stat, e.player)
    //console.log(e)
  }

  postGame(e) {
    if (e.action === "a")
      this.game.gamenumber = this.game.gamenumber + 1
    else
      this.game.gamenumber = this.game.gamenumber - 1
  }


  incrementStat(pos: number, player: PlayerWithId, stat: string) {
    var affectedPlayer: PlayerWithId[] = [];
    const s = new Stat();
    s.gamenumber = this.gameNumber;
    s.homeScore = this.homescore;
    s.matchid = this.match.objectId;
    s.opponentScore = this.opponentscore;
    s.player = player;
    s.pos = pos;
    s.positions = this.playerPositions;
    s.statid = this.statId + 1;
    affectedPlayer.push(player);
    //s.stattime = new Date();
    s.stattype = stat;
    if (this.homepointOptions.indexOf(stat) > -1) {
      this.updateGame("home", "a", stat, affectedPlayer)
      //this.matchService.updateGame(this.game)
    } else if (this.opponentpointOptions.indexOf(stat) > -1) {
      this.updateGame("opponent", "a", stat, affectedPlayer)
      //this.matchService.updateGame(this.game)
    }

    if(this.offline == false) {
      this.matchService.incrementStat(s, this.game);
    } else {
      this.offlineservice.incrementStat(s, this.game);
    }
    

    //this.game.homescore = this.homescore;
    //this.game.opponentscore = this.opponentscore;
    //this.matchService.updateGame(this.game.gameid, this.game);
  }

  reOrder(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.playerPositions,
      event.previousIndex,
      event.currentIndex
    );
  }

  createMatch() {
    this.display = false;
  }

  ShowKeypad() {
    this.zoom = true
  }

  startMatch() {
    this.liberoDisabled = true;
    this.startHidden = true;
    const cp  = Object.assign([], this.playerPositions);
    if (this.stats.length == 0) {
      if(this.offline == false) {
        this.matchService.addPlayByPlay(this.game,cp,"start",
        null)
      } else {
        this.offlineservice.addPlayByPlay(this.game,cp,"start",
        null)
      }
    }

    //this.createFakeStats();
  }

  // updateGame() {
  //   let game = {
  //     gamenumber: this.gameNumber,
  //     matchid: this.match.id,
  //     homescore: this.homescore,
  //     opponentscore: this.opponentscore,
  //     lastupdate: new Date()
  //   };
  //   //this.matchService.updateGame(this.g)
  // }

  // createStat(): Stat {
  //   var randStat = this.fakestats[
  //     Math.floor(Math.random() * this.fakestats.length)
  //   ];
  //   var randomPlayer = this.players[
  //     Math.floor(Math.random() * this.players.length)
  //   ];
  //   var randomPos = this.fakePos[
  //     Math.floor(Math.random() * this.fakePos.length)
  //   ];
  //   let s = new Stat();
  //   s.gamenumber = this.gameNumber;
  //   s.matchid = this.match.objectId;
  //   s.opponentScore = this.opponentscore;
  //   s.homeScore = this.homescore;
  //   s.player = randomPlayer;
  //   s.pos = randomPos;
  //   //s.stattime = new Date();
  //   s.stattype = randStat;
  //   return s;
  // }

  // createFakeStats() {
  //   var s: Stat;
  //   s = this.createStat();
  //   this.incrementStat(s.pos,s.player,s.stattype);
  //   while (this.opponentscore < 25 && this.homescore < 25) {
  //     s = this.createStat();
  //     this.incrementStat(s.pos,s.player,s.stattype);
  //     console.log("Home: " + this.hs + " Opponent: " + this.os);
  //   }
  // }

  // private fakePos = [1,2,3,4,5,6]
  // private fakestats = [
  // 'k',
  // 'he',
  // 'b',
  // 'b',
  // 'be',
  // 'a',
  // 'd',
  // 'bhe',
  // 'sre',
  // 'se']

}
