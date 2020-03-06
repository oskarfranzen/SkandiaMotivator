const clientId = "39cf088cf8dc4554b076d39157de35b7";
const tokenLocalStorageKey = "spotifyToken";

interface IToken {
  expiration: string;
  authToken: string;
}

export const getSpotifyToken = (): IToken => {
  const storageToken = localStorage.getItem(tokenLocalStorageKey);
  return JSON.parse(storageToken || "{}") as IToken;
};
export const checkAuth = (): IToken => {
  const token = getSpotifyToken();
  if (token.authToken) {
    return token;
  }

  const authToken =
    window.location.hash &&
    window.location.hash
      .substring(1)
      .split("=")[1]
      .split("&")[0];
  if (authToken !== "") {
    localStorage.setItem(tokenLocalStorageKey, JSON.stringify({ authToken }));
    window.location.reload();
  } else {
    localStorage.clear();
    window.location.href =
      "https://accounts.spotify.com/authorize?" +
      encodeQueryData({
        client_id: clientId,
        response_type: "token",
        redirect_uri: "http://localhost:3000/",
        scope: "streaming"
      });
    return {} as IToken;
  }
  return token;
};

export const encodeQueryData = (data: any) => {
  const ret = [];
  if (!data) {
    return "";
  }

  for (const d in data) {
    if (data.hasOwnProperty(d)) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
  }
  return ret.join("&");
};
