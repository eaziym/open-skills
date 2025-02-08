# Open Skills 🌐

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A community-driven platform for peer-to-peer skill exchange with real-time collaboration features.
This is a fork of [Skill Swap](https://github.com/Wellitsabhi/Skillswap)

## Table of Contents

- [Open Skills](#open-skills)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Usage](#usage)
    - [Register](#register)
    - [Profile Setup](#profile-setup)
    - [Finding a Match](#finding-a-match)
    - [Skill Exchange](#skill-exchange)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Contributing](#contributing)
  - [Future Plans](#future-plans)
  - [Contributors](#contributors)
  - [License](#license)
  - [Contact](#contact)

## Features

- **User Registration**: Easy signup process to create an account.
- **Profile Setup**: Users can list their skills and interests.
- **Matchmaking**: Find users with complementary skills.
- **Skill Exchange**: Connect with others to teach and learn new skills.

### Current Enhancements

1. **Realtime Chat Foundation**
   - Socket.io integration for 1:1 messaging
   - Message persistence with MongoDB
2. **Enhanced Matching**
   - Weighted algorithm considering:
     - Skill complementarity
     - Location proximity
     - Availability matching
3. **Profile UI Overhaul**
   - Interactive skill graphs
   - Learning progress tracking

### Future Plan

### Immersive Learning

- **AI-Powered Features**
  - Real-time call transcription (Whisper.cpp)
  - Speech translation pipeline
  - Session summarization
- **Skill Validation System**
  - Peer-reviewed certifications
  - Project-based verification

### Community Growth

- Group learning sessions
- Skill challenge events
- Mentorship programs

## Tech Stack 🛠️

**Frontend**  
`React` `Tailwind CSS` `Socket.io Client`

**Backend**  
`Node.js` `Express` `Socket.io` `MongoDB`

**AI Components**  
`Whisper.cpp`

## Usage

### Register

1. Open the app and click on the 'Get started' button.
2. Fill in the required details and create your account.

### Profile Setup

1. After registration, log in to your account.
2. Navigate to the 'Profile' section.
3. Add your skills and interests to your profile.

### Finding a Match

1. Use the `swipe` functionality to find users with the skills you're interested in.
2. Browse profiles and send connection requests to potential matches.

### Skill Exchange

1. Once connected, you can find contact info in `matches` section, arrange a skill exchange session.
2. Give feedback to us after the session to help improve the community.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v20.0+)
- Express.js (v4.19.2+)
- React.js (v18.2.0+)
- MongoDB Atlas

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Wellitsabhi/Skillswap
   ```
2. Navigate to the project directory:
   ```bash
   cd Skillswap
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   Create two `.env` files (seperate for backend and frontend) and add the following variables-
   Backend env :

   ```plaintext
    DATABASE_USERNAME=your_mongodb_database_username
    DB_PASSWORD=your_mongodb_database_username
    SECRET_KEY=your_secret_key_for_jwt
    PORT=3000
    FRONTEND_URL=http://localhost
   ```

   Frontend env :

   ```plaintext
    VITE_BACKEND_URL=http://localhost:3000/
   ```

5. Start the application:
   ```bash
   npm run dev
   ```

The app should now be running on `http://localhost:5173`.

## Original Contributors of Skill Swap

- **Himanshu Lilhore** - [GitHub](https://github.com/Himanshu-Lilhore) | [Twitter](https://x.com/HimanshuLilhore)
- **Abhishek Singh** - [GitHub](https://github.com/Wellitsabhi) | [Twitter](https://x.com/wellitsabhi)
- **Khushi** - [GitHub](https://github.com/KodaKodama) | [Twitter](https://x.com/DevQueen146223)
