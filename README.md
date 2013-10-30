
Bowers nest
===========
A Bower registry in Node, Express & SQLite3 that tries to be an easy way of hosting private Bower registrys.
The target audience are users that develop proprietary javascript stored on servers that require ssh connections, but still want to use Bower as package manager.

#### Bowers nest handles packages that require ssh connections


Getting started
---------------

### Install dependencies

Install SQLite3

	sudo apt-get update
    sudo apt-get install sqlite3 git-core curl -y

Install node dependencies

    sudo npm install -g bower grunt-cli
    npm install

Install bower dependencies

    git config --global http.sslVerify false
    bower install

### Setup database and server

If you have a proxy you need to add it to these to files on line 2:

    nano +62 Gruntfile.js
    nano +2 templates/.bowerrc

Run tests and sync with official Bower repository

    grunt 
    
Configure server location
	
	grunt config:<ip-address>:port

	
Configure SSH on your server
	
	Read more here: https://help.ubuntu.com/10.04/serverguide/openssh-server.html

### And finally...

Run server

    node bowers-nest.js
    
Copy templates/.bowerrc to to your project and have fun!
Now these commands will use your private Bower registry

    bower search
    bower install <package-name>
    bower remove <package-name>

### How to register packages etc

Register package with name = unicorn. Run this command and follow on screen instructions

    grunt register:unicorn

To register package without automatically setting up git repository, run this command

	curl http://<ip-adress>:<port>/packages/ -v -F 'name=package1' -F 'url=http://repo1.git'

Unregister package with name = unicorn

    grunt unregister:unicorn
    
Run tests

	grunt test
	
Sync with official Bower registry packages

	grunt sync


### Example usage scenario

- Install, configure and start the server

- Add your package

    grunt register:<my-package>

- Follow onscreen instructions to add the new git remote and push your code into it

- Add templates/.bowerrc in your new development project

- Install your new package along with all dependencies

    bower install <my-package>


### Manual commands through curl:
List packages, add package1 and package2, list package1, search for 1, remove one and list all

    curl http://<ip-adress>:<port>/packages/
    curl http://<ip-adress>:<port>/packages/ -v -F 'name=package1' -F 'url=http://repo1.git'
    curl http://<ip-adress>:<port>/packages/ -v -F 'name=package2' -F 'url=http://repo2.git'
    curl http://<ip-adress>:<port>/packages/package1
    curl http://<ip-adress>:<port>/packages/search/1
    curl -v -X DELETE <ip-adress>:<port>/packages/package1
    curl http://<ip-adress>:<port>/packages/
