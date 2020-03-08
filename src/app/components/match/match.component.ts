import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
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

@Component({
  selector: "app-match",
  templateUrl: "./match.component.html",
  styleUrls: ["./match.component.css"]
})
export class MatchComponent implements OnInit {
  availableCars: Car[];
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
  //currentGame: <Observable> GameWithId();
  //let currentGame = this.matchService.getGameByNumber(this.gameNumber, this.match.matchid);


  constructor(
    private matchService: MatchService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.playerPositions = [];
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


    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return false;
    }

    // first check to see if the position contains a player
    if (this.playerPositions[container].player) {
      this.players.push(this.playerPositions[container].player);
    }

    this.draggedplayer = event.previousContainer.data[event.previousIndex];
    event.previousContainer.data =
      event.previousContainer.data.filter(x => x.id != this.draggedplayer.id)

    //if not libero then add a sub
    if (!this.draggedplayer.islibero &&
        this.startHidden &&
      (this.playerPositions[container].player  &&
        !this.playerPositions[container].player.islibero))
      {
      //this.game.subs += 1;
      this.updateGame('subs', 'a', '', null)
    }

    if (container === 4) {
      this.playerPositions[4].posNo = 4;
      this.playerPositions[4].player = this.draggedplayer;
      this.playerPositions[4].playerPos =
        this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
    } else if (container === 3) {
      this.playerPositions[3].posNo = 3;
      this.playerPositions[3].player = this.draggedplayer;
      this.playerPositions[3].playerPos =
        this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
    } else if (container === 2) {
      this.playerPositions[2].posNo = 2;
      this.playerPositions[2].player = this.draggedplayer;
      this.playerPositions[2].playerPos =
        this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
    } else if (container === 5) {
      this.playerPositions[5].posNo = 5;
      this.playerPositions[5].player = this.draggedplayer;
      this.playerPositions[5].playerPos =
        this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
    } else if (container === 6) {
      this.playerPositions[6].posNo = 6;
      this.playerPositions[6].player = this.draggedplayer;
      this.playerPositions[6].playerPos =
        this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
    } else if (container === 1) {
      this.playerPositions[1].posNo = 1;
      this.playerPositions[1].player = this.draggedplayer;
      this.playerPositions[1].playerPos =
        this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
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

  async ngOnInit() {

    if (window.screen.width <= 768) { // 768px portrait
      this.mobile = true;
      console.log(this.mobile)
    }

    for (let index = 0; index < 7; index++) {
      const c = new CourtPosition();
      c.playerPos = " Drop Player Here";
      c.posNo = index;
      this.playerPositions.push(c);
    }

    if (this.route.snapshot.params.id != undefined)
      this.match = this.route.snapshot.params;
    else {
      this.router.navigate(['configure']);
      return
    }

    this.game = new GameWithId()
    this.gameScore = new GameScore();
    this.gameNumber = this.match.gameNumber;
    this.game.subs = 0;

    this.matchService.getGames().subscribe(data => {
      this.games = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as {}
        } as GameWithId;
      })

      this.game = this.games.find(
        game => game.gamenumber === this.gameNumber &&
          game.matchid === this.match.id);
      if (!this.game) {
        let g = new GameWithId()
        g.gamenumber = this.gameNumber
        g.matchid = this.match.id
        g.opponentscore = 0
        g.homescore = 0
        g.subs = 0
        this.matchService.createGame(g)
      }
      else {

        this.matchService.getPlayers().subscribe(data => {
          this.allPlayers = data.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as PlayerWithId;

          })

          this.players = this.allPlayers
          for (let index = 1; index < this.playerPositions.length; index++) {
            const element = this.playerPositions[index];
            if (element.player)
              this.players = this.players.filter(x => x.id != element.player.id)
          }


          this.matchService.getstats(this.game).subscribe(data => {
            this.stats = data.map(e => {
              return {
                id: e.payload.doc.id,
                ...e.payload.doc.data() as {}
              } as statEntry;
            })

            // if (this.stats && this.stats.length > 0) {
            //   this.startMatch();
            //   var r = this.stats[this.stats.length-1]
            //   var pos = r.rotation
            //   for (let i = 1; i < 7; i++) {
            //     var p1 = this.allPlayers.filter(p => p.firstName === pos[i])[0]
            //     this.playerPositions[i].posNo = i;
            //     this.playerPositions[i].player = p1;
            //     this.playerPositions[i].playerPos =
            //       p1?.firstName + " - " + p1?.jersey;
            //     this.players = this.players.filter(x => x.id != p1.id)
            //   }
            // }
          });
        });
      }
    });

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

  updateGame(team: string, action: any, stat: string, player: PlayerWithId) {


    if (team === "home") {
      if (action === "a"){
        this.game.homescore = this.game.homescore + 1
      }
      else {
        this.game.homescore = this.game.homescore - 1
      }
    }
    else if (team === "opponent") {
      if (action === "a") {
        this.game.opponentscore = this.game.opponentscore + 1
      }
      else {
        this.game.opponentscore = this.game.opponentscore - 1
      }
    }
    else {
        stat = "sub"
        if (action === "a")
          this.game.subs = this.game.subs + 1
        else
          this.game.subs = this.game.subs - 1
    }


    this.matchService.updateGame(this.game, this.playerPositions)
    this.matchService.addPlayByPlay(this.game,this.playerPositions,stat,
      player)

  }

  postStat(s: StatNib) {
    let p = this.playerPositions[s.pos].player;
    this.incrementStat(s.pos, p, s.stattype);
    console.log(p);
  }

  incrementStat(pos: number, player: PlayerWithId, stat: string) {
    const s = new Stat();
    s.gamenumber = this.gameNumber;
    s.homeScore = this.homescore;
    s.matchid = this.match.id;
    s.opponentScore = this.opponentscore;
    s.player = player;
    s.pos = pos;
    s.positions = this.playerPositions;
    s.statid = this.statId + 1;
    //s.stattime = new Date();
    s.stattype = stat;
    this.matchService.incrementStat(s, this.game);
    if (this.homepointOptions.indexOf(stat) > -1) {
      this.updateGame("home", "a", stat, player)
      //this.matchService.updateGame(this.game)
    } else if (this.opponentpointOptions.indexOf(stat) > -1) {
      this.updateGame("opponent", "a", stat, player)
      //this.matchService.updateGame(this.game)
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

  findIndex(player: PlayerWithId) {
    let index = -1;
    for (let i = 0; i < this.availableCars.length; i++) {
      if (player.id === this.availableCars[i].vin) {
        index = i;
        break;
      }
    }
    return index;
  }

  createMatch() {
    this.display = false;
  }

  startMatch() {
    this.liberoDisabled = true;
    this.startHidden = true;
    if (this.stats.length == 0) {
       this.matchService.addPlayByPlay(this.game,this.playerPositions,"start",
      null)
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

  createStat(): Stat {
    var randStat = this.fakestats[
      Math.floor(Math.random() * this.fakestats.length)
    ];
    var randomPlayer = this.players[
      Math.floor(Math.random() * this.players.length)
    ];
    var randomPos = this.fakePos[
      Math.floor(Math.random() * this.fakePos.length)
    ];
    let s = new Stat();
    s.gamenumber = this.gameNumber;
    s.matchid = this.match.id;
    s.opponentScore = this.opponentscore;
    s.homeScore = this.homescore;
    s.player = randomPlayer;
    s.pos = randomPos;
    //s.stattime = new Date();
    s.stattype = randStat;
    return s;
  }

  createFakeStats() {
    var s: Stat;
    s = this.createStat();
    this.incrementStat(s.pos,s.player,s.stattype);
    while (this.opponentscore < 25 && this.homescore < 25) {
      s = this.createStat();
      this.incrementStat(s.pos,s.player,s.stattype);
      console.log("Home: " + this.hs + " Opponent: " + this.os);
    }
  }

  private fakePos = [1,2,3,4,5,6]
  private fakestats = [
  'k',
  'he',
  'b',
  'b',
  'be',
  'a',
  'd',
  'bhe',
  'sre',
  'se']

}
