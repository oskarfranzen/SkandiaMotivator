import React, { useState, useEffect } from "react";
import "./App.css";
import { checkAuth, getSpotifyToken } from "./Spotify/spotifyPlayer";
import { getSpotifyService } from "./Spotify/spotifyService";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
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
};

interface ISelection {
  name: string;
  id: string;
}

const App: React.FunctionComponent<any> = () => {
  const spotifyService = getSpotifyService();

  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);

  const [selectedItem, setSelectedItem] = useState({} as ISelection);

  useEffect(() => {
    const load = async () =>
      spotifyService.getPlaylists().then(x => setState(x));
    load();
  }, [true]);

  useEffect(() => {
    spotifyService.getPlaylistTracks(selectedItem.id).then(x=> console.log(x))
  }, [selectedItem]);
  

  return (
    <div>
      <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
        <DropdownToggle caret>{selectedItem.name}</DropdownToggle>
        <DropdownMenu>
          {state &&
            state.map((item, index) => (
              <DropdownItem
                key={index}
                onClick={e =>
                  setSelectedItem({ name: item.name, id: item.id })
                }
              >
                {item.name}
              </DropdownItem>
            ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default App;
