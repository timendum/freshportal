Tiny Tiny RSS Portal - React editlion
========

Tiny Tiny RSS Portal is a Javascript portal, composed by feed widgets, similar to the old iGoogle or Netvibes.

Any help is appreciated, on everything, I'm not a front-end developer.

Installation
-------------

Just unzip the latest release (or build it by yourself) and put it somewere, the only backend needed is [Tiny Tiny RSS](https://tt-rss.org/) itself.

1. Put the build files in a directory on the same webserver of Tiny Tiny RSS.
1. On the Tiny Tiny RSS istance enable the API access.
1. Create a "Portal" category and add feeds to this category.
1. The go to index.html.

End

### Note ###
You can install the Tiny Tiny RSS Portal anywhere, but you have to configure the `Access-Control-Allow-Origin` header in ttrss the webserver. It works even in your hard disk, but the icon generator won't work, because of security policies on opening "local" files.


Details
-------------
This is a re-implmentation of [the original ttportal](https://github.com/timendum/ttportal), but this time in React.


### Dependencies ###
* [React](https://reactjs.org/)
* [he](https://github.com/mathiasbynens/he) for HTML unescaping (because some feeds are bad)
* [FontAwesome](https://fontawesome.com/) for the icons
* [Tailwind CSS](https://tailwindcss.com/) for styling utility classes
