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

        location ~ ^/api/greader.php(/.+)?$ {
                add_header 'Access-Control-Allow-Origin' '*' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
                add_header 'Access-Control-Max-Age' '86400' always;
                add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;

                if ($request_method = 'OPTIONS' ) {
                        return 200;
                }
                fastcgi_split_path_info ^(.+\.php)(/.*)$;

		fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
		fastcgi_split_path_info ^(.+\.php)(/.*)$;
		# By default, the variable PATH_INFO is not set under PHP-FPM
		# But FreshRSS API greader.php need it. If you have a “Bad Request” error, double check this var!
		# NOTE: the separate $path_info variable is required. For more details, see:
		# https://trac.nginx.org/nginx/ticket/321
		set $path_info $fastcgi_path_info;
		fastcgi_param PATH_INFO $path_info;
		include fastcgi_params;
		fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
	}

From `fastcgi_split_path_info` and under is taken from the [official documentation](https://freshrss.github.io/FreshRSS/en/admins/10_ServerConfig.html) for Nginx.  
This configuration handle the special case for the Google Reader API, allowing the invoking of the API from outside the server (see `Access-Control-Allow-Origin`), return 200 for `OPTIONS` call and allow caching of the preflight results.

Details
-------------
This is a re-implementation of [the original ttportal](https://github.com/timendum/ttportal), but this time in React and for FreshRSS.


### Dependencies ###
* [React](https://reactjs.org/)
* [FontAwesome](https://fontawesome.com/) for the icons
* [Tailwind CSS](https://tailwindcss.com/) for styling utility classes

Screenshots
-----------

At 1920x1080, dark mode:

![1920x1080, dark mode](/../../blob/images/screenshot-1.png?raw=true)

At 1600x900, light mode:

![1600x900, light mode](/../../blob/images/screenshot-2.png?raw=true)

At 1280x720, dark mode:

![1280x720, dark mode](/../../blob/images/screenshot-3.png?raw=true)
