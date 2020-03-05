import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { checkAuth, getSpotifyToken } from "./Spotify/spotifyPlayer";

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = checkAuth().authToken;
  const player = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: cb => {
      cb(token);
    }
  });
};

const App: React.FunctionComponent<any> = () => {
  return <div>{getSpotifyToken().authToken}</div>;
};

export default App;
