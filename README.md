<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
***
***
***
*** To avoid retyping too much info. Do a search and replace for the following:
*** noahball, leopard, noahball_, noah@noahball.com, Leopard, A simple contact tracing system for school buses at COVID-19 Alert Level 2 and 3.
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
  [![License][license-shield]][license-url]
  [![Last Commit][last-commit-shield]][last-commit-url]
  [![Contributors][contributors-shield]][contributors-url]
  [![Forks][forks-shield]][forks-url]
  [![Stargazers][stars-shield]][stars-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/noahball/leopard">
    <img src="https://www.pngmart.com/files/3/Leopard-PNG-File.png" alt="Logo" height="80">
  </a>

  <h3 align="center">Leopard</h3>

  <p align="center">
    A simple contact tracing system for school buses at COVID-19 Alert Level 2 and 3.
    <br />
    <a href="https://github.com/noahball/leopard"><strong>Browse code »</strong></a>
    <br />
    <br />
    <a href="https://leopard.noahball.com">View Demo</a>
    ·
    <a href="https://github.com/noahball/leopard/issues">Report Bug</a>
    ·
    <a href="https://github.com/noahball/leopard/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<div align="center">
  <img src="https://i.imgur.com/o7rTUfF.jpg" alt="Screenshot" height="300">
</div>

<br>

Leopard is a contact tracing system designed to be used by bus students at secondary schools in New Zealand during COVID-19 Alert Level 2 and 3. Many schools take a roll of who is on each bus, so that it's easy to trace students who were on a bus with someone infected with COVID-19. Leopard is designed to automate the roll-taking process, by allowing students to simply scan a QR code on their mobile device and log their journey. This prevents long queues of students manually checking in at bus bays, where social distancing is near impossible and long queues build quickly.


### Built With

* [Node.js (Runtime)](https://nodejs.org/)
* [Express (Web Server)](https://expressjs.com/)
* [Firebase (Database/Authentication)](https://firebase.google.com/)
* [reCAPTCHA v3 (Bot Prevention)](https://www.google.com/recaptcha/about/)
* [Axios (HTTP Requests](https://axios-http.com/)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Leopard is not designed to be run with just a few commands and a config file. **You will need knowledge of Node.js, basic web technologies and Firebase to create your own instance.** Feel free to reach out to me if you need help.

1. Firebase RTDB and Authentication
- You will need to create a Firebase Account, RTDB Database and setup Firebase Authentication, then replace the default database URLs in Leopard's source code.

2. reCAPTCHA v3 Keys
- You will need to create a new reCAPTCHA v3 project, then replace the default client/secret keys in Leopard's source code.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/noahball/leopard.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run Leopard
   ```sh
   npm start
   ```


<!-- USAGE EXAMPLES -->
## Usage

### Student-side
<img src="https://i.imgur.com/o7rTUfF.jpg" alt="Screenshot" height="300">
The student-side of Leopard is designed to be accessed by scanning a QR code that directs the user to the relevant check-in screen (eg. http://leopard.local/check-in/school/bus). Each bus will need its own QR code - however new QR codes do not need to be created for each bus ride. The process for creating QR codes is not currently automated - you can just create them by Googling 'QR code generator".

Each student can then enter their name and tutor/form class to check-in. Check-in API endpoints are protected by Google reCAPTCHA v3, preventing students from spamming check-ins, or creating spambots in extreme cases.

## Admin-side
<img src="https://i.imgur.com/01AsB1s.jpg" alt="Screenshot" height="300">
<img src="https://i.imgur.com/90fvKKk.jpg" alt="Screenshot" height="300">
The admin side of Leopard (eg. http://leopard.local/admin) is user friendly and designed to be used by school administrators/office staff. Leopard is designed to be a "set-and-forget" solution, and the admin page only needs to be accessed if a bus student contracts COVID-19. You can register as many admin users as you like by using the sign-up page (eg. http://leopard.local/signup), it is recommended that /views/signup.ejs is deleted when it is not required for security purposes.

Admin users can lookup bus users by date, bus and journey. These results can only be retrieved (even at the API level) by users who have properly authenticated themselves. There is currently no support for looking up multiple dates, journeys or buses in one search. There is no native support for changing user passwords, or deleting users - however this can still be done in the Firebase Admin Console (you must also delete /users/school/uid in the RTDB to fully remove a user)

_For more examples, please refer to the [Documentation](https://example.com)_

## Leopard API
Leopard's API has not been built for use outside of Leopard's own client (responses are usually returned in full HTML instead of JSON). However, you could extract data from the HTML response if needed.

Current endpoints (API V1):
- POST ```/api/v1/check-in``` Arguments:
    - Bus number (bus - 1)
    - Date of check-in (date - 01/01/1970)
    - Whether check-in is AM/PM (journey - AM)
    - Name of student (name - Johnny Smith)
    - Student's tutor class (class - TUT1)
    - reCAPTCHA response token (recaptchaResponse - abcdef123456)
    - 
- POST ```/api/v1/lookup``` Arguments:
    - Bus number (bus - 1)
    - Date of check-in (date - 01/01/1970)
    - Whether check-in is AM/PM (journey - AM)
    - Firebase Auth ID Token (idToken - abcdef123456)



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/noahball/leopard/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the GNU General Public License v2. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Noah Ball - [@noahball_](https://twitter.com/noahball_) - noah@noahball.com

Project Link: [https://github.com/noahball/leopard](https://github.com/noahball/leopard)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [OpenJS Foundation](https://openjsf.org/)





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/noahball/leopard?style=for-the-badge
[contributors-url]: https://github.com/noahball/leopard/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/noahball/leopard?style=for-the-badge
[forks-url]: https://github.com/noahball/leopard/network/members
[stars-shield]: https://img.shields.io/github/stars/noahball/leopard?style=for-the-badge
[stars-url]: https://github.com/noahball/leopard/stargazers
[license-shield]: https://img.shields.io/github/license/noahball/leopard?style=for-the-badge
[license-url]: https://github.com/noahball/leopard/blob/master/LICENSE.txt
[last-commit-shield]: https://img.shields.io/github/last-commit/noahball/leopard?style=for-the-badge
[last-commit-url]: https://github.com/noahball/leopard/commits
