import { staticViewQueryIds } from '@angular/compiler';

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
  playerid?: number;
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
  matchid?: number;
  gamenumber?: number;
  stattype?: string;
  pos?: number;
  player?: PlayerWithId;
  stattime?: Date;
  positions?: CourtPosition[];
  homeScore?: number;
  opponentScore?: number;
}

export class Match {
  matchid?: number;
  home?: string;
  opponent?: string;
  matchdate?: Date;
}

export class Game {
  id?: number;
  gameid?: number;
  matchid?: number;
  homescore?: number;
  opponentscore?: number;
}

export class gameMatch extends Match {
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

export interface statEntry {
  statid?: number,
  matchid?: number,
  gamenumber?: number,
  stattype?: string,
  playerid?: number,
  statdate?: Date,
  pos?: CourtPosition[]
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


export interface statView {
  jersey: string;
  firstName: string;
  lastName: string;
  playerid: number;
  k: number;
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
