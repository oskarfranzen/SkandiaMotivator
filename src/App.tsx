import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { checkAuth, getSpotifyToken } from "./Spotify/spotifyPlayer";

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = checkAuth().authToken;
  const player = new Spotify.Player({
    name: "Skandia Hackathon player",
    getOAuthToken: cb => {
      cb(token);
    }
  });
  player.connect();
};

const App: React.FunctionComponent<any> = () => {
  return <div>{getSpotifyToken().authToken}</div>;
};

export default App;
