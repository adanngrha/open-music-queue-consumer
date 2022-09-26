const { Pool } = require('pg');
const { mapDBToModelPlaylistWithSongs } = require('./utils/mapDBToModelPlaylistWithSongs');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsFromPlaylistById(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name
      FROM playlists 
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const songsQuery = {
      text: `SELECT songs.id, songs.title, songs.performer 
      FROM playlist_songs
      JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1
      GROUP BY songs.id`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    const songsResult = await this._pool.query(songsQuery);

    playlistResult.rows[0].songs = songsResult.rows;

    return playlistResult.rows.map(mapDBToModelPlaylistWithSongs)[0];
  }
}

module.exports = PlaylistsService;