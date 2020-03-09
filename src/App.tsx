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
  Row,
  CardHeader,
  CardBody,
  Card
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

  const [bestTrack, setBestTrack] = useState<ITrack>();

  const spotifyService = getSpotifyService();
  const [availableTracks, setAvailableTracks] = useState<ITrack[]>([]);

  useEffect(() => {
    const load = async () =>
      spotifyService.getPlaylists().then(x => {
        spotifyService.getPlaylistsTracks(x.map(x => x.id)).then(tracks => {
          setAvailableTracks(tracks);
        });
      });

    load();
  }, [token]);

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
    const bestTrack = availableTracks.reduce(
      (current: { score: number; track: ITrack | null }, next) => {
        const score =
          Math.abs(next.danceability - danceability) +
          (Math.abs(next.tempo - tempo) / 2) + //Tempo should have lower weight
          Math.abs(next.energy - energy) +
          Math.abs(next.loudness - loudness);
        if (score < current.score) {
          return { score, track: next };
        }
        return current;
      },
      { score: 99999, track: null }
    );
    if (bestTrack.track) {
      setBestTrack(bestTrack.track);
    }
  }, [tempo, danceability, loudness, energy]);

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
      {bestTrack && (
        <Card>
          <CardHeader>{bestTrack.name}</CardHeader>
          <CardBody>{bestTrack.tempo}</CardBody>
        </Card>
      )}
    </Container>
  );
};

export default App;
