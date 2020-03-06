import React, { useState, useEffect } from "react";
import "./App.css";
import { checkAuth, getSpotifyToken } from "./Spotify/spotifyPlayer";
import { getSpotifyService } from "./Spotify/spotifyService";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Button,
  Container,
  Row
} from "reactstrap";
import ReactSlider from "react-slider";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

interface ISelection {
  name: string;
  id: string;
}

export interface ITrack {
  name: string;
  uri: string;
  tempo: number;
  danceability: number;
  loudness: number;
  energy: number;
  id: string;
}

const App: React.FunctionComponent<any> = () => {
  let player: Spotify.SpotifyPlayer;
  const windowLocal = (window as unknown) as any;

  window.onSpotifyWebPlaybackSDKReady = () => {
    setPlayerReady(true);
  };

  const [token, setToken] = useState(checkAuth().authToken);
  const [playerReady, setPlayerReady] = useState(false);
  const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState>();

  const [tempo, setTempo] = useState<number>(0);
  const [danceability, setDanceability] = useState<number>(0);
  const [loudness, setLoudness] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);

  const spotifyService = getSpotifyService();

  const [isOpen, setIsOpen] = useState(false);
  const [availablePlayLists, setAvailablePlayLists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);
  const [availableTracks, setSelectedTracks] = useState<ITrack[]>([]);

  const [selectedItem, setSelectedItem] = useState({} as ISelection);

  useEffect(() => {
    const load = async () =>
      spotifyService.getPlaylists().then(x => {
        spotifyService.getPlaylistsTracks(x.map(x => x.id)).then(tracks => {
          console.log(tracks);
          setSelectedTracks(tracks);
        });
      });

    load();
  }, [token]);

  useEffect(() => {
    if (selectedItem.id) {
    }
  }, [selectedItem]);

  useEffect(() => {
    if (playerReady) {
      const token = checkAuth().authToken;
      ((window as unknown) as any).player = new Spotify.Player({
        name: "Skandia Hackathon player",
        getOAuthToken: cb => {
          cb(token);
        }
      });
      player = ((window as unknown) as any).player;
      player.connect();
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        localStorage.setItem("spotify_device_id", device_id);
      });
      player.addListener(
        "player_state_changed",
        (playbackState: Spotify.PlaybackState) => {
          console.log(playbackState);
          setPlaybackState(playbackState);
        }
      );
    }
  }, [playerReady]);

  useEffect(() => {
    const setBestTrack = availableTracks.reduce((current: any, next) => {
      const score = (Math.abs(next.danceability - danceability) + Math.abs(next.tempo - tempo) + Math.abs(next.energy - energy) + Math.abs(next.loudness - loudness));
      if(score < current.score) {
        return {id: next.id, score};
      } 
      return current;
      
    }, {id: '', score: 99999})
    console.log(availableTracks.find(x=> x.id === setBestTrack.id))
    console.log(setBestTrack)
  }, [tempo, danceability,loudness,energy])

  player = ((window as unknown) as any).player;
  return (
    <Container>
      {playbackState && playbackState.paused ? (
        <Button onClick={() => player.resume()}>play</Button>
      ) : (
        <Button onClick={() => player.pause()}>pause</Button>
      )}
      <div>
        <p>tempo</p>
        <Slider onChange={value => setTempo(value)} min={0} max={100} />
      </div>
      <div>
        <p>danceability</p>
        <Slider onChange={value => setDanceability(value)} min={0} max={100} />
      </div>
      <div>
        <p>loudness</p>
        <Slider onChange={value => setLoudness(value)} min={-60} max={0} />
      </div>
      <div>
        <p>energy</p>
        <Slider onChange={value => setEnergy(value)} min={0} max={100} />
      </div>
      <br />
      <br />
      {availableTracks.length > 0 &&
        availableTracks
          .filter(filterStressLevel => filterStressLevel.energy > tempo)
          .map(track => (
            <>
              <br />
              <Button onClick={() => spotifyService.playTracks([track.id])}>
                {(track && track.name) || "lol"}
              </Button>
            </>
          ))}
    </Container>
  );
};

export default App;
