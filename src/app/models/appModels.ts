//import { staticViewQueryIds } from '@angular/compiler';

export class CourtPosition {
  posNo: number;
  player?: PlayerWithId;
  playerPos: string;
}

export class Player {
  jersey?: string;
  firstName?: string;
  lastName?: string;
  islibero?: boolean = false;


  constructor(jersey: string, fname: string, lastname: string, libero: boolean) {
    this.jersey = jersey;
    this.firstName = fname;
    this.lastName = lastname;
  }
}

export class PlayerWithId extends Player {
  id?: string;
}



export class StatNib {
  pos?: number;
  stattype?: string;
  constructor(pos: number, stattype: string,) {
    this.pos = pos;
    this.stattype = stattype;
  }
}

export class Stat {
  statid?: number;
  matchid?: string;
  gamenumber?: number;
  stattype?: string;
  pos?: number;
  player?: PlayerWithId;
  stattime?: number;
  positions?: CourtPosition[];
  homeScore?: number;
  opponentScore?: number;
}

export class Match {
  home?: string;
  opponent?: string;
  matchdate?: number;
  displaydate?: Date;
  //gameDate?: number;
}

export class MatchWithId extends Match {
  id?: string;
}

export class Game {
  gamenumber?: number;
  matchid?: string;
  homescore?: number;
  opponentscore?: number;
  subs?: number;
}

export class GameWithId extends Game {
  id?: string;
}

export class gameMatch extends MatchWithId {
  gameNumber?: number;
}

export class GameScore {
  home = 0;
  opponent = 0;
}

export interface Position {
  playerPos: string;
  posNo: number;
}

export interface ArrayOfStats {
  gamenumber: number;
  homeScore: number;
  opponentScore: number;
  pos: number;
  positions: Position[];
  statid: number;
  stattime: Date;
  stattype: string;
}

export interface rotation {
  pos?: number;
  playerId?: string;
}


export interface statEntry {
  statid?: number,
  matchid?: string,
  gamenumber?: number,
  stattype?: string,
  playerid?: string,
  statdate?: number,
  pos?: Map<any,any>
}

export interface statModel {
  matchid: number;
  gamenumber: number;
  stattype: string;
  pos: number;
  playerid: number;
  statdate: Date;
  statid: number;
}

export interface RotationPlayer {
  id: string;
  firstName: string;
  islibero: boolean;
  jersey: string;
  lastName: string;
  playerid: string;
}

export interface RotationObject {
  playerPos: string;
  posNo: number;
  player: Player;
}

export class PlayerNib {
  pos?: number;
  playerid?: string;
  constructor(pos: number, playerid: string,) {
    this.pos = pos;
    this.playerid = playerid;
  }
}


export interface statView {
  jersey: string;
  firstName: string;
  lastName: string;
  playerid: string;
  k: number;
  h: number
  he: number;
  b: number;
  bt: number;
  be: number;
  a: number;
  d: number;
  bhe: number;
  sre: number;
  se: number;
}
