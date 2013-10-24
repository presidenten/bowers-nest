-----------------------------------------------------------
Bowers nest
===========
A Bower registry in Node, Express & SQLite3 that tries to be an easy way of hosting private Bower registrys.


Getting started
---------------

-----------------------------------------------------------

Install SQLite3

	sudo apt-get update
    sudo apt-get install sqlite3 git-core -y

Install node dependencies

    sudo npm install -g bower grunt-cli
    npm install

Install bower dependencies

    bower install

Run tests and sync with official Bower repository

    grunt 
    
Configure server location
	
	gedit Gruntfile.js
	gedit templates/.bowerrc
	
Configure SSH on your server
	
	Read more here: https://help.ubuntu.com/10.04/serverguide/openssh-server.html

Run server

    node bowers-nest.js
    
Copy .bowerrc to to your project and have fun!



#### Grunt tasks, how to register packages etc

Register package with name = unicorn 

    grunt register:'unicorn'

To register package with name and URL, please use curl like so

	curl http://localhost:9000/packages/ -v -F 'name=package1' -F 'url=http://repo1.git'

Unregister package with name=unicorn

    grunt unregister:'unicorn'
    
Run tests

	grunt test
	
Sync with official Bower registry packages

	grunt sync
	

    

#### Manual tests:
List packages, add package1 and package2, list package1, search for 1, remove one and list all

    curl http://localhost:9000/packages/
    curl http://localhost:9000/packages/ -v -F 'name=package1' -F 'url=http://repo1.git'
    curl http://localhost:9000/packages/ -v -F 'name=package2' -F 'url=http://repo2.git'
    curl http://localhost:9000/packages/package1
    curl http://localhost:9000/packages/search/1
    curl -v -X DELETE localhost:9000/packages/package1
    curl http://localhost:9000/packages/
