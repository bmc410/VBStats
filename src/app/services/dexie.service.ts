import Dexie from 'dexie';

export class DexieService extends Dexie {
  constructor() {
    super('FusionU172_4');
    this.version(1).stores({
      match: "++matchid,home,opponent,matchdate",
      player: "++playerid,jersey,firstName,lastName,islibero",
      stat: "++statid",
      game: "++gameid, gamenumber, matchid"
    });
  }
}
