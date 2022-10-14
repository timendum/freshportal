Tiny Tiny RSS Portal - React editlion
========

Tiny Tiny RSS Portal is a Javascript portal, composed by feed widgets, similar to the old iGoogle or Netvibes.

Any help is appreciated, on everything, I'm not a front-end developer.

Installation
-------------
Download all the files in a directory on the same webserver of Tiny Tiny RSS.

On the Tiny Tiny RSS enable the API access.

Create a "Portal" category and add new feeds.

The go to index.html.

End

### Note ###
You can install the Tiny Tiny RSS Portal anywhere, even in your hard disk, but you have to enable the `Access-Control-Allow-Origin` header in ttrss the webserver.


Details
-------------
This is a re-implmentation of [the original ttportal](https://github.com/timendum/ttportal), but this time in React.


### Dependencies ###
* [React](https://reactjs.org/)
* [he](https://github.com/mathiasbynens/he) for HTML unescaping (because some feeds are bad)
* [FontAwesome](https://fontawesome.com/) for the icons
* [Tailwind CSS](https://tailwindcss.com/) for styling utility classes
