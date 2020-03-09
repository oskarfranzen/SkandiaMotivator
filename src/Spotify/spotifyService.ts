import { getSpotifyToken, encodeQueryData } from "./spotifyPlayer";
import { ITrack } from "../App";

interface ISpotifyService {
  getPlaylists: () => Promise<SpotifyApi.PlaylistObjectSimplified[]>;
  getPlaylistsTracks: (playlistId: string[]) => Promise<ITrack[]>;
  playTracks: (trackIds: string[]) => void;
}

const spotifyBaseUrl = "https://api.spotify.com/v1/";

export const getSpotifyService = (): ISpotifyService => ({
  getPlaylists: async () => {
    const response = await fetch(
      spotifyBaseUrl + "me/playlists",
      requestObject
    );
    return ((await response.json()) as SpotifyApi.CursorBasedPagingObject<
      SpotifyApi.PlaylistObjectSimplified
    >).items;
  },
  getPlaylistsTracks: async (playlistId: string[]) => {
    const listofTracks: ITrack[] = [];
    let trackResponse: SpotifyApi.AudioFeaturesObject[] = [];
    let tracks: SpotifyApi.PlaylistTrackObject[] = [];

    for (let index in playlistId) {
      if(tracks.length >= 100) continue;
      const requestUri = `playlists/${playlistId[index]}/tracks`;

      const response = await fetch(spotifyBaseUrl + requestUri, requestObject);

      const playListTracks = ((await response.json()) as SpotifyApi.CursorBasedPagingObject<
        SpotifyApi.PlaylistTrackObject
      >).items;


      tracks = tracks.concat(playListTracks.slice(0,10));
    }

    const audioResponse = await fetch(
      spotifyBaseUrl +
        "audio-features?ids=" +
        tracks.slice(0,100).map(track => track.track.id).join(","),
      requestObject
    );
    trackResponse = ((await audioResponse.json()) as SpotifyApi.MultipleAudioFeaturesResponse)
      .audio_features;

    trackResponse.forEach(track => {
      if (track === null) return {} as ITrack;
      const trac = tracks.find(y => y.track && y.track.id === track.id);
      listofTracks.push({
        name: trac ? trac.track.name : "asd",
        uri: track.uri,
        tempo: (track.tempo / 200) * 100,
        danceability: track.danceability * 100,
        loudness: track.loudness,
        energy: track.energy * 100,
        id: track.id
      } as ITrack);
    });
    return listofTracks;
  },
  playTracks: (trackIds: string[]) => {
    let body = JSON.stringify({
      uris: trackIds.map(x => "spotify:track:" + x)
    });

    fetch(
      spotifyBaseUrl +
        `me/player/play?${encodeQueryData({
          device_id: localStorage.getItem("spotify_device_id") || ""
        })}`,
      {
        method: "put",
        headers: new Headers({
          Authorization: "Bearer " + getSpotifyToken().authToken
        }),
        body: body
      }
    );
  }
});

const requestObject = {
  method: "get",
  headers: new Headers({
    Authorization: "Bearer " + getSpotifyToken().authToken,
    "Content-Type": "application/json"
  })
};
