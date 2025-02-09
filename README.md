# Open Skills 🌐

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Home Page](./frontend/src/assets/readme/home.png)

A community-driven platform for peer-to-peer skill exchange with real-time collaboration features.
This is an enhanced fork of [Skill Swap](https://github.com/Wellitsabhi/Skillswap) with added realtime chat and improved matching features.

## Why This Project?

After reviewing numerous open-source skill-sharing platforms, this project stood out for its unique and user-friendly approach to skill matching. Unlike most repositories that lack demos or clear setup instructions, Skill Swap implemented an intuitive "swipe" interface for skill matching - similar to popular dating apps but for skills. Users get profile cards displaying skills and interests, making the matching process engaging and straightforward. While the original project had a solid foundation, it needed enhancements in areas like bidirectional matching, real-time communication, and notification systems - and fixing a few minor bugs. I chose to build upon this codebase due to a more familiar tech stack and the potential to transform it into a fully-featured skill-sharing platform with real-time collaboration capabilities - and ultimately an Open Skills community.

### Why Prioritize Communication?

The original platform stopped at the matching stage, leaving users without a built-in way to connect after finding a potential skill-exchange partner. I believe real-time communication is crucial for a thriving skill-sharing community. While forum-based asynchronous communication is common in many platforms, real-time chat provides immediate engagement and better simulates in-person learning interactions. This is especially important for skill sharing, where quick questions, immediate feedback, and natural conversation flow can significantly enhance the learning experience. The roadmap includes features like audio/video calls with real-time translation to break down language barriers in global skill sharing, and AI-powered chat assistance to help facilitate more effective learning conversations.

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
  - [Contributors](#contributors)

## Original Features

- **User Registration**: Easy signup process to create an account.
- **Profile Setup**: Users can list their skills and interests.
- **Matchmaking**: Find users with complementary skills.
- **Skill Exchange**: Connect with others to teach and learn new skills.

## Current Enhancements

- Implemented bidirectional skill matching
- Added real-time chat functionality
- Improved notification system with read/unread status
- Added bulk skills/interests management
- Enhanced profile features with picture upload
- Added user generation tools for testing

## Usage (Original Skill Swap)

### Register

![Registration Page](./frontend/src/assets/readme/register.png)

1. Open the app and click on the 'Get started' button.
2. Fill in the required details and create your account.

### Profile Setup

![Profile Page](./frontend/src/assets/readme/profile.png)

1. After registration, log in to your account.
2. Navigate to the 'Profile' section.
3. Add your skills and interests to your profile.

### Finding a Match

![Swipe Interface](./frontend/src/assets/readme/swipe.png)

1. Use the `swipe` functionality to find users with the skills you're interested in.
2. Browse profiles and send connection requests to potential matches.

### Skill Exchange

![Matches Page](./frontend/src/assets/readme/matches.png)
![Matched Users](./frontend/src/assets/readme/matched.png)

1. Once connected, you can find contact info in `matches` section, arrange a skill exchange session.
2. Give feedback to us after the session to help improve the community.

## Initial Setup for Testing

1. Populate skills database (run this curl command):

   ```bash
   curl --location 'http://localhost:3000/admin/add/skills/bulk' \
   --header 'Content-Type: application/json' \
   --data '{
   "skills": [
   {"name": "Python Programming"},
   {"name": "JavaScript"},
   // ... (other skills)
   ]
   }'
   ```

2. Generate users (run this curl command, optional - you can manually register users):

   ```bash
   curl --location 'http://localhost:3000/admin/generate/users' \
   --header 'Content-Type: application/json' \
   --data '{
   "count": 10
   }'
   ```

### Testing the Chat Feature

![Chat Interface](./frontend/src/assets/readme/chat.gif)

3. Register two different accounts (doesn't have to be real emails)

4. Open two browser windows and log in with each account

5. Match the users through the swipe interface

6. Start chatting in real-time (if for some reason the app doesn't load, refresh the page - may need to fix the redux state issue)

## Future Features

### Communication

- File/media messaging support and group chats
- Audio/video calls with real-time translation (found some good open source repos for this)
- AI-powered inline chat assistance (like cursor)

### Profile Enhancements

- Portfolio hosting
- Time banking gamification (leaderboard for top learners/teachers)
- AI-powered skill parsing from resumes
- Peer rating and feedback system
- Location-based matching

## Tech Stack

- **Frontend**: React, Redux, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, MongoDB
- **Authentication**: JWT

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
   git clone https://github.com/eaziym/open-skills
   ```
2. Navigate to the project directory:
   ```bash
   cd open-skills
   ```
3. Install dependencies (cd into backend and frontend respectively):
   ```bash
   npm install
   ```
4. Set up environment variables:
   Create two `.env` files (seperate for backend and frontend) and add the following variables-
   Backend env :

   ```plaintext
    DATABASE_USERNAME=your_mongodb_database_username
    DB_PASSWORD=your_mongodb_database_username
    SECRET_KEY=your_secret_key_for_jwt_just_type_anything
    PORT=3000
    FRONTEND_URL=http://localhost
   ```

   You may need to check your mongodb connection string and replace the `open-skills` with your database name.
   const DB_URI = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DB_PASSWORD}@open-skills.iqwh0.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=open-skills`;

   Frontend env :

   ```plaintext
    VITE_BACKEND_URL=http://localhost:3000/
   ```

5. Start the application (cd into backend and frontend respectively):
   ```bash
   npm run dev
   ```

The app should now be running on `http://localhost:5173` for frontend and `http://localhost:3000` for backend.

## Original Contributors of Skill Swap

- **Himanshu Lilhore** - [GitHub](https://github.com/Himanshu-Lilhore) | [Twitter](https://x.com/HimanshuLilhore)
- **Abhishek Singh** - [GitHub](https://github.com/Wellitsabhi) | [Twitter](https://x.com/wellitsabhi)
- **Khushi** - [GitHub](https://github.com/KodaKodama) | [Twitter](https://x.com/DevQueen146223)
