<h1 align="center">Degree Planning Assistant</h1>

<div align="center">
A 3-tier web application that allow SJSU students monitor and schedule their degree plans to meet graduation requirements. </br></br>

<a href="https://github.com/DPA-SJSU/Degree-Planning-Assistant/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-green.svg" alt="PRs Welcome" />
</a>
<img alt="GitHub language count" src="https://img.shields.io/github/languages/count/DPA-SJSU/Degree-Planning-Assistant">
<a href="https://www.javascript.com/">
    <img src="https://img.shields.io/github/languages/top/DPA-SJSU/Degree-Planning-Assistant" alt="Top Language" />
</a>
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors-anon/DPA-SJSU/Degree-Planning-Assistant">

![DPA gif demo](docs/dpa-demo.gif)

</div>

## 🌟 Features

- 🙍🏻‍♀️ Sign-up/Login with DPA
- 🔏 Protect your data with JWT authentication
- 🏦 Scan your SJSU Transcript and get all taken semesters in nice format
- 📑 Drag & Drop Courses to desired semesters
- 💳 Show impaction and difficulty of courses and semesters
- 💵 Show all remaining courses/areas needed to meet all graduation requirements

## ✅ Getting Started

### 📍 Requirement

What things you need to install the software and how to install them

- [Node.js](https://nodejs.org/en/)
- [Angular CLI](https://github.com/angular/angular-cli)
- [npm registry](https://www.npmjs.com/)
- [Github](https://gist.github.com/derhuerst/1b15ff4652a867391f03)
- [VSCode](https://code.visualstudio.com/) OR ...anything you like.
- [Postman](https://www.getpostman.com/): this will allow you test your API (GET, POST, PUT, DELETE, etc.) without using frontend
- **IMPORTANT - GCloud Key** - you need to ask us permission or send us an email at dpa.sjsu@gmail.com so we can send you the GCloud OCR key to get the transcript parser to work.

### ⚒️ Installation

```sh
# Clone this repository
$ git clone https://github.com/DPA-SJSU/Degree-Planning-Assistant.git

# Go into the repository
$ cd Degree-Planning-Assistant
```

### 💻 Client Start-up

```sh
# Install Angular CLi
$ npm install -g @angular/cli

# Install dependencies
$ cd client && npm i

# Start client on localhost:4200
$ npm start
```

### Database Setup

```sh
# Open a new terminal to install, start MongDB Local
$ npm run mongo:install
$ npm run mongo:start
$ npm run mongo:dev
```

### ⌨️ Server Start-up

```sh
# Install dependencies
$ cd server/ && npm i

# Add GCloud Key to get scanning function to work - PLEASE CHECK REQUIREMENTS
$ touch cloud-ocr-key.json

# Start server at localhost:8080/
$ npm run dev
```

### 📊 Project Storyboard: [DPA](https://github.com/DPA-SJSU/Degree-Planning-Assistant/projects/1)

## 📂 Technologies Used

### Frontend

- [Angular](https://github.com/facebook/react)
- [Jasmine](https://github.com/jasmine/jasmine)

### Backend

- [Node.js](https://github.com/django/django)
- [express.js](expressjs.com)
- [mongoose](https://mongoosejs.com/)
- [mocha.js](https://mochajs.org/)

## ⚙️ Testing

```sh
# Test server using Mocha.js unit test
cd server
$ npm run test
```

## Project Structure

```sh
DPA
 ├── client
   ├── e2e                  — Builds and serves the app then runs end-to-end tests
   ├── src
      ├── app               — Contains the source code of components
      ├── assets            — Static asset files (.png, .gif, etc.)
      ├── environment       — Environment configurations
      ├── main.ts           — Entry point of the application
      ├── index.html        — Main index file
   └── package.json         — Client Config
 └── server
   ├── controller           — Storing APIs of the server
   └── database
        ├── model           - init all DB models
        └── schema          - init schema for each model
   └── store
        ├── Scanning        - Consist the logic of Transcript OCR
        ├── passport.js     - user authentication with passport JWT
        ├── utils.js        - contains supporting functions
        └── config.js       — storing your configuration attribute
   ├── .eslintrc            — config ESLint Airbnb Coding Style
   ├── .babelrc             — migrate ES6 -> ES5
   ├── .prettierrc          — prettier config
   ├── package.json         — Server Config
   ├── app.yaml             — GCloud config for prod deployment
   └── app.js               — Everything a server needs to start
├── .gitignore
└── README.md
```

## ⭐️ Authors

👨🏻‍💻 **Calvin Nguyen** - [calvinqc](https://github.com/calvinqc)

👩🏻‍💻 **Elana Olson** - [ellamaolson](https://github.com/ellamaolson)

👨🏻‍💻 **Dale Seen** - [daleCS](https://github.com/DaleCS)

See also the list of [contributors](https://github.com/DPA-SJSU/Degree-Planning-Assistant/contributors) who participated in this project.

## License

Use of this source code is governed by an **MIT license**.
