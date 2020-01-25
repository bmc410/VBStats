export class CourtPosition {
  posNo: number;
  player?: Player;
  playerPos: string;
}

export class Player {
  playerid: number;
  jersey: string;
  firstName: string;
  lastName: string;

  constructor(jersey: string, fname: string, lastname: string) {
    this.jersey = jersey;
    this.firstName = fname;
    this.lastName = lastname;
  }
}

export class Stat {
  statid: number;
  matchid: number;
  gamenumber: number;
  stattype: string;
  pos: number;
  playerid: number;
  stattime: Date;
}

export class Match {
  matchid?: number;
  home?: string;
  opponent?: string;
  matchdate?: Date;
}
