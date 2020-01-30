# Degree-Planning-Assistant
Degree Planning Assistant is a web app that helps students plan their college degree.  

# Requirement

- [Node.js](https://nodejs.org/en/) 
- [npm registry](https://www.npmjs.com/).
- [Github](https://gist.github.com/derhuerst/1b15ff4652a867391f03)
- Text Editor: [VSCode](https://code.visualstudio.com/) OR ...anything you like.
- [Postman](https://www.getpostman.com/): this will allow you test your API (GET, POST, PUT, DELETE, etc.)

# Getting started

Clone this repository

```bash
git clone git@github.com:ellamaolson/Degree-Planning-Assistant.git
```

Install the dependencies and devDependencies for both client & server:

```bash
npm run i
```

If you just want to install each project individually:

Server: `npm run i-server` 
Client: `npm run i-client`

## Project Structure

```bash
project
 ├── client
 └── server
   └── controller — Storing APIs of the app (GET, POST, PUT, DELETE)
      ├── constant.js - store all contants that Controller uses
      ├── index.js
      └── user.controller.js
   └── database 
      ├── constant.js 
      ├── drop.sql - drop all tables 
      ├── create.sql - initialize all tables and sample data
   └── store 
      ├── passport.js - user authentication with passport JWT
      ├── utils.js - contains supporting functions 
      └── config.js — storing your configuration attribute
   ├── .eslintrc — config ESLint Airbnb Coding Style
   ├── .babelrc — migrate ES6 -> ES5 to run on different browsers
   ├── package.json — config ESLint Airbnb Coding Style
   └── App.js — Everything a server needs to start
```

# Starting

You will need to open 2 separate terminals:

1. run `export PASSWORD=<your_password>`
2. First terminal (Server): `npm run server` -> open `localhost:8080`
3. Second terminal (Client): `npm run client` -> open `localhost:5200`

# How-to Guide
> Step-by-step how to create a Node app from scratch so you'll know how all the files are related, and learn what each file does.

## Server Guide

Please refer to this [link](https://medium.com/swlh/a-complete-guide-build-a-scalable-3-tier-architecture-with-mern-stack-es6-ca129d7df805) to learn about Building your Server API. 

## Client Guide

Please refer to this link.

# Authors

**Calvin Nguyen** - [calvinqc](https://github.com/calvinqc)

**Elana Olson** - [ellamaolson](https://github.com/ellamaolson)

**Dale Seen** - [daleCS](https://github.com/DaleCS)

## License

Use of this source code is governed by an MIT-style license.

