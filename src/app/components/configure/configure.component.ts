import { Component, OnInit } from "@angular/core";
import { Car } from "src/app/models/cars";
import { CarService } from "../../services/carservice";
import { CourtPosition, Player, Match } from "src/app/models/appModels";
import { MatchService } from "src/app/services/matchservice";
import { DialogModule } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
import { MenuItem } from "primeng/api/menuitem";

@Component({
  selector: "app-configure",
  templateUrl: "./configure.component.html",
  styleUrls: ["./configure.component.css"]
})
export class ConfigureComponent implements OnInit {
  availableCars: Car[];
  playerPositions: CourtPosition[];
  draggedplayer: Player;
  players: Player[] = [];
  match: Match = {};
  matches: Match[] = [];
  display: boolean = false;
  matchDate: Date;
  items: MenuItem[];
  testDate: Date = new Date();

  displayDialog: boolean = false;
  selectedMatch: Match;
  newMatch: boolean;

  constructor(private matchService: MatchService) {
    this.playerPositions = [];
  }

  showDialog() {
    this.display = true;
  }

  onRowSelect(event) {
    this.newMatch = false;
    this.match = this.cloneMatch(event.data);
    this.displayDialog = true;
  }

  cloneMatch(m: Match): Match {
    let match = {};
    for (let prop in m) {
      match[prop] = m[prop];
    }
    return match;
  }

  async ngOnInit() {
    this.items = [
      { label: "Stats", icon: "fa fa-fw fa-bar-chart", routerLink: ["/match"] },
      { label: "Calendar", icon: "fa fa-fw fa-calendar" },
      { label: "Documentation", icon: "fa fa-fw fa-book" },
      { label: "Support", icon: "fa fa-fw fa-support" },
      { label: "Social", icon: "fa fa-fw fa-twitter" }
    ];
    //this.matchService.createMatch();
    let allMatches = await this.matchService.getAllMatches();
    allMatches.forEach(element => {
      this.matches.push(element);
    });

    console.log(this.matches);
  }

  dragStart(event, player: Player) {
    this.draggedplayer = player;
  }

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

  drop(event, container) {
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
  }

  dragEnd(event) {
    this.draggedplayer = null;
  }

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
