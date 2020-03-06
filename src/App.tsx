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

  const [stressLevel, setStressLevel] = useState<number>(0);

  const spotifyService = getSpotifyService();

  const [isOpen, setIsOpen] = useState(false);
  const [availablePlayLists, setAvailablePlayLists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);
  const [selectedTracks, setSelectedTracks] = useState<ITrack[]>([]);

  const [selectedItem, setSelectedItem] = useState({} as ISelection);

  useEffect(() => {
    const load = async () =>
      spotifyService.getPlaylists().then(x => setAvailablePlayLists(x));
    load();
  }, [token]);

  useEffect(() => {
    if (selectedItem.id) {
      spotifyService
        .getPlaylistTracks(selectedItem.id)
        .then(tracks => setSelectedTracks(tracks));
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

  player = ((window as unknown) as any).player;

  return (
    <Container>
      <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
        <DropdownToggle caret>{selectedItem.name}</DropdownToggle>
        <DropdownMenu>
          {availablePlayLists &&
            availablePlayLists.map((item, index) => (
              <DropdownItem
                key={index}
                onClick={e => setSelectedItem({ name: item.name, id: item.id })}
              >
                {item.name}
              </DropdownItem>
            ))}
        </DropdownMenu>
      </Dropdown>
      {playbackState && playbackState.paused ? (
        <Button onClick={() => player.resume()}>play</Button>
      ) : (
        <Button onClick={() => player.pause()}>pause</Button>
      )}
      <div>
        <p>Stressnivå</p>
        <Slider onChange={value => setStressLevel(value)} min={0} max={100} />
      </div>
      <br />
      <br />
      {selectedTracks.length > 0 &&
        selectedTracks
          .filter(filterStressLevel => filterStressLevel.energy > stressLevel)
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
