import { getSpotifyToken, encodeQueryData } from "./spotifyPlayer";
import { ITrack } from "../App";

interface ISpotifyService {
  getPlaylists: () => Promise<SpotifyApi.PlaylistObjectSimplified[]>;
  getPlaylistTracks: (playlistId: string) => Promise<ITrack[]>;
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
  getPlaylistTracks: async (playlistId: string) => {
    const requestUri = `playlists/${playlistId}/tracks`;

    const response = await fetch(spotifyBaseUrl + requestUri, requestObject);

    const tracks = ((await response.json()) as SpotifyApi.CursorBasedPagingObject<
      SpotifyApi.PlaylistTrackObject
    >).items;

    const trackResponse = await fetch(
      spotifyBaseUrl +
        "audio-features?ids=" +
        tracks.map(track => track.track.id).join(","),
      requestObject
    );

    return ((await trackResponse.json()) as SpotifyApi.MultipleAudioFeaturesResponse).audio_features.map(
      track => {
        const trac = tracks.find(y => y.track.id === track.id);
        return {
          name: trac ? trac.track.name : "asd",
          uri: track.uri,
          tempo: track.tempo,
          danceability: track.danceability,
          loudness: track.loudness,
          energy: track.energy,
          id: track.id
        } as ITrack;
      }
    );
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
