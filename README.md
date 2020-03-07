# NodeJS-test-task

The Chat App

    This is a simple example of a chat application written in Nodejs. 
    It has a simple user interface where user first enters their username and they can then connect to the chat room. 
    Chat room is public so any person who joins can view all messages. 

Project structure
    - project is split into 3 folders:

    1. server
    This folder contains backend server related logic. 
    It contains 2 files: 
        - server.js 
        This file is used as server if we want the app to run on a single worker
        - serverWithCluster.js
        This file is used as server if we want the app to run on multiple workers 

    2. client
    This folder contains client related logic.
    Client contains static html/css and js files. 
    index.html file is left in the root of the client folder, for easy access, and all other files are located in the assets subfolder.
    Assets folder is further devided into subfolders for each section (HTML, CSS, JS). 

    3. config
    This folder contains files related to the configuration.
    It currently includes a chatApp.conf file which represents an example of the nginx config file.


Installing the app:

    use 'npm install' to install all the dependencies for the project
    To run project locally, just use node to start one of the server files (server.js for single worker, or serverWithCluster.js to run app with multiple workers), and open index.html.
    When hosted, idea is for nginx to serve the static files while server files handle the chat backend logic. 


Dependencies: 
    * express: ^4.17.1
    * redis: ^3.0.2
    * socket.io: ^2.3.0
    * socket.io-client: ^2.3.0
    * socket.io-redis: ^5.2.0

