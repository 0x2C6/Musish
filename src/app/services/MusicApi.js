import axios from 'axios';
import Alert from 'react-s-alert';
import { API_URL } from '../utils/Utils';

export default class MusicApi {
  static getNextSongs(path) {
    return axios({
      method: 'get',
      url: `${API_URL}${path}`,
      headers: this.getHeaders(),
    });
  }

  static async addSongsToPlaylist(playlistId, songs) {
    const payload = {
      data: songs.map(song => ({
        id: song,
        type: 'song',
      })),
    };

    try {
      await axios({
        method: 'post',
        url: `${API_URL}/v1/me/library/playlists/${playlistId}/tracks`,
        data: payload,
        headers: this.getHeaders(),
      });
      Alert.success("Added to your playlist, it'll show up in a few seconds. Hold tight!");
    } catch (error) {
      Alert.error("You're unable to add songs to this playlist.");
    }
  }

  static async addAlbumToPlaylist(playlistId, albumId) {
    const music = MusicKit.getInstance();

    const album = await (isNaN(albumId)
      ? music.api.library.album(albumId)
      : music.api.album(albumId));

    const tracks = album.relationships.tracks.data.map(track => ({
      id: track.id,
      type: 'song',
    }));

    this.addSongsToPlaylist(playlistId, tracks);
  }

  static async addPlaylistToPlaylist(playlistId, sourcePlaylistId) {
    const music = MusicKit.getInstance();

    const playlist = await (sourcePlaylistId.startsWith('p.')
      ? music.api.library.playlist(sourcePlaylistId)
      : music.api.playlist(sourcePlaylistId));

    const tracks = playlist.relationships.tracks.data.map(track => ({
      id: track.id,
      type: 'song',
    }));

    this.addSongsToPlaylist(playlistId, tracks);
  }

  static async addToLibrary(mediaType, songs) {
    try {
      await axios({
        method: 'post',
        url: `${API_URL}/v1/me/library?ids[${mediaType}]=${songs.map(s => s).join(',')}`,
        headers: this.getHeaders(),
      });
      Alert.success("Added to your library, it'll show up in a few seconds. Hold tight!");
    } catch (error) {
      Alert.error("We're unable to add these songs to your library.");
    }
  }

  static getHeaders() {
    const music = MusicKit.getInstance();

    return {
      Authorization: `Bearer ${music.developerToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Music-User-Token': music.musicUserToken,
    };
  }
}
