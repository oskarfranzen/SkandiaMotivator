import { getSpotifyToken } from "./spotifyPlayer";

interface ISpotifyService {
  getPlaylists: () => Promise<SpotifyApi.PlaylistObjectSimplified[]>;
  getPlaylistTracks: (
    playlistId: string
  ) => Promise<SpotifyApi.AudioFeaturesObject[]>;
}

const spotifyBaseUrl = "https://api.spotify.com/v1/";

export const getSpotifyService = (): ISpotifyService => ({
  getPlaylists: async () => {
    const response = await fetch(spotifyBaseUrl + "me/playlists");
    return ((await response.json()) as SpotifyApi.CursorBasedPagingObject<
      SpotifyApi.PlaylistObjectSimplified
    >).items;
  },
  getPlaylistTracks: async (playlistId: string) => {
    const requestUri = `playlists/${playlistId}/tracks`;

    const response = await fetch(spotifyBaseUrl + requestUri, requestObject);

    const tracks = ((await response.json()) as SpotifyApi.CursorBasedPagingObject<
      SpotifyApi.TrackObjectSimplified
    >).items;
    const trackResponse = await fetch(
      "/audio-features?ids=" + tracks.map(track => track.id).join(","),
      requestObject
    );

    return ((await trackResponse.json()) as SpotifyApi.MultipleAudioFeaturesResponse)
      .audio_features;
  }
});

const requestObject = {
  method: "get",
  headers: new Headers({
    Authorization: "Bearer " + getSpotifyToken().authToken,
    "Content-Type": "application/json"
  })
};
