import React from "react";
import { freshRss } from "../freshrss";
import { HandleStateChangeType } from "./interfaces";

interface LoginFormProps {
  handleLogin: HandleStateChangeType;
}

export default function LoginForm({ handleLogin }: LoginFormProps) {
  const [loginError, setloginError] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [defaultHost, setDefaultHost] = React.useState("");

  React.useEffect(() => {
    let newHost = localStorage.getItem("FRHost");
    if (newHost && newHost.startsWith("http")) {
      newHost = newHost.replace(/\/api.+$/, "/");
    } else {
      newHost = `${document.location.protocol}//${document.location.hostname}:${document.location.port}/`;
    }
    setDefaultHost(newHost);
  });
  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    let apiLocation = data.get("location");
    const user = data.get("user");
    const password = data.get("password");
    if (!user || !apiLocation || !password) {
      setloginError("Fill all fields");
      return;
    }
    apiLocation = (apiLocation as string).replace(/\/+$/, "");
    freshRss.base = `${apiLocation}/api/greader.php/`;
    setloginError(undefined);
    freshRss
      .login((user as string).trim(), (password as string).trim())
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
          <div className="block rounded-lg bg-white p-4 p-4 shadow-lg shadow-lg dark:bg-gray-600 dark:shadow-slate-700">
            <h2 className="mb-5 ml-1 text-lg dark:text-gray-200">Login</h2>
            <div className="mb-6">
              <input
                type="text"
                className="input-primary block w-full bg-clip-padding px-4 py-2 text-xl"
                placeholder="Username"
                name="user"
                autoComplete="username"
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                className="input-primary block w-full bg-clip-padding px-4 py-2 text-xl"
                placeholder="API Password"
                name="password"
                autoComplete="current-password"
              />
            </div>
            <div className="mb-6">
              <input
                className="input-primary block w-full bg-clip-padding px-4 py-2 text-xl"
                placeholder="FreshRSS URL"
                name="location"
                defaultValue={defaultHost}
              />
            </div>{" "}
            {!!loginError && (
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
