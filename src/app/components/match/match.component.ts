import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import { CarService } from "src/app/services/carservice";
import { Player, CourtPosition, Match } from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";

@Component({
  selector: "app-match",
  templateUrl: "./match.component.html",
  styleUrls: ["./match.component.css"]
})
export class MatchComponent implements OnInit {
  availableCars: Car[];
  playerPositions: CourtPosition[];
  draggedplayer: Player;
  players: Player[] = [];
  match: Match;
  display: boolean = false;
  matchDate: Date;

  constructor(private matchService: MatchService) {
    this.playerPositions = [];
  }

  droppedData: string;

  drop(event: CdkDragDrop<Player[]>, container: any) {
    //first check to see if the position contains a player
    if (this.playerPositions[container].player) {
      this.players.push(this.playerPositions[container].player);
    }

    console.log(event.previousContainer.data[event.previousIndex]);
    console.log(event.container.id);
    this.draggedplayer = event.previousContainer.data[event.previousIndex];

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
      i => i.jersey != this.draggedplayer.jersey
    );
    this.draggedplayer = null;

    // console.log(event.previousContainer.data[event.previousIndex]);
    // console.log(event.container.id);
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
    // } else {
    //   transferArrayItem(
    //     event.previousContainer.data,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
    // }
  }

  // dragEnd(event) {}

  logData(event) {
    console.log("Element was dragged", event);
  }

  showDialog() {
    this.display = true;
  }

  ngOnInit() {
    for (let index = 0; index < 7; index++) {
      let c = new CourtPosition();
      c.playerPos = "Drop Player Here";
      c.posNo = index + 1;
      this.playerPositions.push(c);
    }

    this.players = [];
    this.players = this.matchService.addPlayers();
  }

  // dragStart(event, player: Player) {
  //   this.draggedplayer = player;
  // }

  rotate() {
    var positionsFilled = true;

    for (let pos of this.playerPositions) {
      if (!pos.player) {
        positionsFilled = false;
        break;
      }
    }

    if (!positionsFilled) {
      return;
    }

    let tempPlayer = this.playerPositions[1].player;
    this.playerPositions[1].player = this.playerPositions[2].player;
    this.playerPositions[2].player = this.playerPositions[3].player;
    this.playerPositions[3].player = this.playerPositions[4].player;
    this.playerPositions[4].player = this.playerPositions[5].player;
    this.playerPositions[5].player = this.playerPositions[6].player;
    this.playerPositions[6].player = tempPlayer;
  }

  incrementStat(pos: number, stat: string) {}

  /*  drop(event, container) {
    //first check to see if the position contains a player
    if (this.playerPositions[container].player) {
      this.players.push(this.playerPositions[container].player);
    }

    if (this.draggedplayer) {
      if (container === "4") {
        this.playerPositions[4].posNo = 4;
        this.playerPositions[4].player = this.draggedplayer;
        this.playerPositions[4].playerPos =
          this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
      } else if (container === "3") {
        this.playerPositions[3].posNo = 3;
        this.playerPositions[3].player = this.draggedplayer;
        this.playerPositions[3].playerPos =
          this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
      } else if (container === "2") {
        this.playerPositions[2].posNo = 2;
        this.playerPositions[2].player = this.draggedplayer;
        this.playerPositions[2].playerPos =
          this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
      } else if (container === "5") {
        this.playerPositions[5].posNo = 5;
        this.playerPositions[5].player = this.draggedplayer;
        this.playerPositions[5].playerPos =
          this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
      } else if (container === "6") {
        this.playerPositions[6].posNo = 6;
        this.playerPositions[6].player = this.draggedplayer;
        this.playerPositions[6].playerPos =
          this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
      } else if (container === "1") {
        this.playerPositions[1].posNo = 1;
        this.playerPositions[1].player = this.draggedplayer;
        this.playerPositions[1].playerPos =
          this.draggedplayer.firstName + " - " + this.draggedplayer.jersey;
      }

      this.players = this.players.filter(
        i => i.jersey != this.draggedplayer.jersey
      );
      this.draggedplayer = null;
    }
  } */

  /*  dragEnd(event) {
    this.draggedplayer = null;
  } */

  findIndex(player: Player) {
    let index = -1;
    for (let i = 0; i < this.availableCars.length; i++) {
      if (player.playerid === this.availableCars[i].vin) {
        index = i;
        break;
      }
    }
    return index;
  }

  createMatch() {}
}
