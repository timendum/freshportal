import React from "react";
import { ttRss } from "../ttrss.js";

export default function LoginPage({ handleLogin }) {
  const [loginError, setloginError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  let defaultHost = localStorage.getItem("TTRssHost");
  if (defaultHost) {
    defaultHost = defaultHost.replace(/api\/$/, "");
  } else {
    defaultHost =
      document.location.protocol +
      "//" +
      document.location.hostname +
      ":" +
      document.location.port +
      "/";
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    let ttLocation = data.get("location");
    ttLocation = ttLocation.replace(/\/+$/, "");
    ttRss.base = ttLocation + "/api/";
    setloginError();
    ttRss
      .login(data.get("user"), data.get("password"))
      .then((result) => {
        console.debug("login", result);
        if (result) {
          handleLogin(true);
        } else {
          setloginError("Error during login, check console.");
          setLoading(false);
        }
      })
      .catch(console.log);
  };
  return (
    <div className="min-h-screen p-6 dark:bg-black">
      <div className="mx-auto w-1/2">
        <form onSubmit={handleSubmit}>
          <div className="rounded-lg bg-white block p-4 p-4 shadow-lg shadow-lg dark:bg-gray-600 dark:shadow-slate-700">
            <h2 className="mb-5 ml-1 text-lg dark:text-gray-200">Login</h2>
            <div className="mb-6">
              <input
                type="text"
                className="input-primary block w-full bg-clip-padding px-4 py-2 text-xl"
                placeholder="Username"
                name="user"
              />
            </div>
            <div className="mb-6">
              <input
                autoComplete="current-password"
                type="password"
                className="input-primary block w-full bg-clip-padding px-4 py-2 text-xl"
                placeholder="Password"
                name="password"
              />
            </div>
            <div className="mb-6">
              <input
                className="input-primary block w-full bg-clip-padding px-4 py-2 text-xl"
                placeholder="Username"
                name="location"
                label="TT-RSS Base URL"
                defaultValue={defaultHost}
              />
            </div>{" "}
            {loginError && (
              <div role="alert">
                <div className="rounded-t bg-red-500 px-4 py-2 font-bold text-white">
                  {loginError}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="btn-primary w-full bg-blue-800 px-7 py-3 text-sm font-medium leading-snug text-slate-200"
              disabled={loading}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
