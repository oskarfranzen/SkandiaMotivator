import React, { useState, useEffect } from "react";
import "./App.css";
import { checkAuth, getSpotifyToken } from "./Spotify/spotifyPlayer";
import { getSpotifyService } from "./Spotify/spotifyService";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Button
} from "reactstrap";




window.onSpotifyWebPlaybackSDKReady = () => {
  const token = checkAuth().authToken;
  const player = new Spotify.Player({
    name: "Skandia Hackathon player",
    getOAuthToken: cb => {
      cb(token);
    }
  });
  player.connect();
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    localStorage.setItem("spotify_device_id", device_id)
});
  (window as unknown as any).player = player;
};

interface ISelection {
  name: string;
  id: string;
}

const App: React.FunctionComponent<any> = () => {
  const windowLocal = window as unknown as any;

  const[token, setToken] = useState(checkAuth().authToken)

  const spotifyService = getSpotifyService();

  const [isOpen, setIsOpen] = useState(false);
  const [availablePlayLists, setAvailablePlayLists] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<SpotifyApi.AudioFeaturesObject[]>([]);

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

  return (
    <div>
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

      {selectedTracks.length > 0 && selectedTracks.map(track => <Button onClick={() => spotifyService.playTracks([track.id])}>{track && track.uri || 'lol'}</Button>)}
    </div>
  );
};

export default App;
