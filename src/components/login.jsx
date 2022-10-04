import React from "react";
import { ttRss } from "../ttrss.js";

export default function LoginPage({ handleLogin }) {
  const [loginError, setloginError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
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
    <div className="mx-auto h-screen w-1/2">
      <form onSubmit={handleSubmit}>
        <div className="mt-3 block rounded-lg bg-white p-6 shadow-lg ">
          <h2 className="my-2 mr-4 text-xl">Login</h2>
          <div className="mb-6">
            <input
              type="text"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              placeholder="Username"
              name="user"
            />
          </div>
          <div className="mb-6">
            <input
              autoComplete="current-password"
              type="password"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              placeholder="Password"
              name="password"
            />
          </div>
          <div className="mb-6">
            <input
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              placeholder="Username"
              name="location"
              label="TT-RSS Base URL"
              defaultValue={
                document.location.protocol +
                "//" +
                document.location.hostname +
                ":" +
                document.location.port +
                "/"
              }
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
            className="inline-block w-full rounded bg-blue-600 px-7 py-3 text-sm font-medium uppercase leading-snug text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
            disabled={loading}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
