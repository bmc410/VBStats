import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import {
  CourtPosition,
  Match,
  Stat,
  GameScore,
  StatNib,
  gameMatch,
  PlayerWithId
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
  match: gameMatch;
  display = false;
  matchDate: Date;
  matchStats: Stat[] = [];
  stat: Stat;
  gameNumber = 1;
  gameScore: GameScore;
  statId = 0;
  home = "";
  opponent = "";
  homescore = 0;
  opponentscore = 0;
  subs = 0;
  homepointOptions = ["k"];
  opponentpointOptions = ["he", "be", "bhe", "sre", "se"];
  liberoDisabled = false;
  hs = 0;
  os = 0;

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
    this.matchService.createMatch(this.home, this.opponent, this.matchDate);
    this.display = false;
  }

  drop(event: CdkDragDrop<PlayerWithId[]>, container: any) {
    // first check to see if the position contains a player
    if (this.playerPositions[container].player) {
      this.players.push(this.playerPositions[container].player);
    }

    // console.log(event.previousContainer.data[event.previousIndex]);
    // console.log(event.container.id);
    this.draggedplayer = event.previousContainer.data[event.previousIndex];

    //if not libero then add a sub
    if (!this.draggedplayer.islibero && this.liberoDisabled) {
      this.subs += 1;
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

  async ngOnInit() {
    for (let index = 0; index < 7; index++) {
      const c = new CourtPosition();
      c.playerPos = " Drop Player Here";
      c.posNo = index;
      this.playerPositions.push(c);
    }

    if (this.route.snapshot.params.toString().length)
      this.match = this.route.snapshot.params;

    this.gameScore = new GameScore();
    this.gameNumber = this.match.gameNumber;
    this.players = [];
    this.players = await this.matchService.getAllPlayers();
    //console.log(this.players)
    //this.match = new Match();
    //this.match.matchid = 1;
    //this.match.home = 'Fusion 17W';
    //this.match.opponent = 'Ballyhoo';
    //this.match.matchdate = new Date();
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

  increment(team: string) {
    if (team === "home") {
      this.homescore += 1;
    } else if (team === "opponent") {
      this.opponentscore += 1;
    } else {
      this.subs += 1;
    }
  }

  postStat(s: StatNib) {
    let p = this.playerPositions.find(e => e.posNo === s.pos).player;
    this.incrementStat(s.pos, p, s.stattype);
    console.log(p);
  }

  incrementStat(pos: number, player: PlayerWithId, stat: string) {
    const s = new Stat();
    s.gamenumber = this.gameNumber;
    s.homeScore = this.homescore;
    s.matchid = this.match.matchid;
    s.opponentScore = this.opponentscore;
    s.player = player;
    s.pos = pos;
    s.positions = this.playerPositions;
    s.statid = this.statId + 1;
    s.stattime = new Date();
    s.stattype = stat;
    this.matchService.incrementStat(s);
    if (this.homepointOptions.indexOf(stat) > -1) {
      this.homescore += 1;
    } else if (this.opponentpointOptions.indexOf(stat) > -1) {
      this.opponentscore += 1;
    }
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
      if (player.playerid === this.availableCars[i].vin) {
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
    this.createFakeStats();
  }

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
    s.matchid = this.match.matchid;
    s.opponentScore = this.opponentscore;
    s.homeScore = this.homescore;
    s.player = randomPlayer;
    s.pos = randomPos;
    s.stattime = new Date();
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
