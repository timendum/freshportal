FreshRSS Portal - React edition
========

FreshRSS Portal is a Javascript portal, composed by feed widgets, similar to the old iGoogle or Netvibes.

Any help is appreciated, on everything, I'm not a front-end developer.

Installation
-------------

Just unzip the latest release (or build it by yourself) and put it somewhere, the only back-end needed is [FreshRSS](https://freshrss.github.io) itself.

1. Put the build files in a directory on the same web-server of FreshRSS
1. On the FreshRSS instance enable the API access.
1. The go to index.html.

### Note ###

You can install the FreshRSS Portal anywhere (ie: in another server), you have to configure `Access-Control` headers and allow the OPTION method in the webserver. It works even in your hard disk, but the icon generator won't work, because of security policies on opening "local" files.

For example in Nginx you have to add somthing like:

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Max-Age' '86400' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;

And also:

                location ~ ^/api/greader\.php {
                        if ($request_method = 'OPTIONS' ) {
                                return 200;
                        }
                }


Details
-------------
This is a re-implementation of [the original ttportal](https://github.com/timendum/ttportal), but this time in React and for FreshRSS.


### Dependencies ###
* [React](https://reactjs.org/)
* [FontAwesome](https://fontawesome.com/) for the icons
* [Tailwind CSS](https://tailwindcss.com/) for styling utility classes
