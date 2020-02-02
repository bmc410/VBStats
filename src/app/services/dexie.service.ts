import Dexie from 'dexie';

export class DexieService extends Dexie {
  constructor() {
    super('FusionU172_3');
    this.version(1).stores({
      match: "++matchid,home,opponent,matchdate",
      player: "++playerid,jersey,firstName,lastName,islibero",
      stat: "++statid"
      //,matchid,gamenumber,stattype,pos,playerid,statdate,*pos",
      //game: "++gid,gameid,matchid,homescore,opponentscore"
    });
  }
}
