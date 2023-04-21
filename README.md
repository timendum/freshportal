FreshRSS Portal - React editlion
========

FreshRSS Portal is a Javascript portal, composed by feed widgets, similar to the old iGoogle or Netvibes.

Any help is appreciated, on everything, I'm not a front-end developer.

Installation
-------------

Just unzip the latest release (or build it by yourself) and put it somewere, the only backend needed is [FreshRSS](https://freshrss.github.io) itself.

1. Put the build files in a directory on the same webserver of FreshRSS
1. On the FreshRSS instance enable the API access.
1. The go to index.html.

End

### Note ###
You can install the FreshRSS Portal anywhere (ie: in another server), you have to configure the `Access-Control-Allow-Origin` header in ttrss the webserver. It works even in your hard disk, but the icon generator won't work, because of security policies on opening "local" files.


Details
-------------
This is a re-implmentation of [the original ttportal](https://github.com/timendum/ttportal), but this time in React and for FreshRSS.


### Dependencies ###
* [React](https://reactjs.org/)
* [he](https://github.com/mathiasbynens/he) for HTML unescaping (because some feeds are bad)
* [FontAwesome](https://fontawesome.com/) for the icons
* [Tailwind CSS](https://tailwindcss.com/) for styling utility classes
