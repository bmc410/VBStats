import Dexie from "dexie";

export class OfflineDatabase extends Dexie {
    // Declare implicit table properties.
    // (just to inform Typescript. Instanciated by Dexie in stores() method)
    players: Dexie.Table<IPlayers, string>; 
    matches: Dexie.Table<IMatches, string>;
    games: Dexie.Table<IGames, string>;
    playbyplay: Dexie.Table<IPlayByPlay, string>;
    stats: Dexie.Table<IStats, string>;
    teamplayers: Dexie.Table<ITeamPlayers, string>;
    teams: Dexie.Table<ITeams, string>;
    clubs: Dexie.Table<IClubs, string>;

    constructor () {
        super("OfflineDatabase");
        var db = this;
        
        this.version(1).stores({
            players: 'objectId, firstname, lastname',
            matches: 'objectId, Home, HomeTeamId, Opponent, MatchDate',
            games: 'objectId, gamenumber, matchid, opponent, matchdate',
            playbyplay: 'objectId, action, playerid, homescore, opponentscore, stattype, rotation, gameid',
            stats: 'objectId, subs, playerid, homescore, opponentscore, stattype, rotation, gameid',
            teamplayers: 'objectId, playerid, teamid, jersey, clubyear',
            teams: 'objectId, TeamName, Year, ClubId',
            clubs: 'objectId, clubname'
        });

        this.players = this.table("players");
        this.matches = this.table("matches");
        this.games = this.table("games");
        this.playbyplay = this.table("playbyplay");
        this.stats = this.table("stats");
        this.teamplayers = this.table("teamplayers");
        this.teams = this.table("teams");
        this.clubs = this.table('clubs');
        
        
    }
}

export interface ITeams {
    objectId?: string;
    TeamName?: string;
    Year?: number;
    ClubId?: string;
}

export interface ITeamPlayers {
    objectId?: string;
    playerid?: string;
    teamid?: string;
    jersey?: string;
    clubyear?: string;
}

export interface IStats {
    objectId?: string;
    subs?: string;
    playerid?: string;
    homescore?: number;
    opponentscore?: number;
    stattype?: string;
    rotation?: string;
    gameid?: string;
}

export interface IPlayByPlay {
    objectId?: string;
    action?: string;
    playerid?: string;
    homescore?: number;
    opponentscore?: number;
    stattype?: string;
    rotation?: string;
    gameid?: string;
}

export interface IGames {
    objectId?: string;
    gamenumber?: number;
    matchid?: string;
    homescore?: number;
    opponentscore?: number;
    subs?: number;
}

export interface IClubs {
    objectId?: string;
    clubname?: string;
}

export interface IPlayers {
    objectId?: string;
    firstname?: string;
    lastname?: string;
}

export interface IMatches {
    objectId?: string;
    Home?: string;
    HomeTeamid?: string
    Opponent?: string;
    MatchDate?: string;
}


