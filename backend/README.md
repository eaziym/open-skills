# Backend API Routes

## Home Router

- `GET /home` - Get count of all users

## User Router

### Authentication & Profile

- `POST /user/login` - User login
- `POST /user/register` - User registration
- `POST /user/logout` - User logout
- `GET /user/profile` - Get current user's profile
- `GET /user/profile/:id` - Get specific user's profile by ID
- `PUT /user/profile-update` - Update user info (username, fname, lname, email, bio)

### Skills & Interests

- `PUT /user/skills-update` - Update user's skills
- `PUT /user/interests-update` - Update user's interests

### Matches & Notifications

- `GET /user/matches` - Get list of user matches
- `GET /user/notifications` - Get user notifications
- `PATCH /user/notifications/markAllRead` - Mark all notifications as read

### Profile Picture

- `POST /user/upload-profile-pic` - Upload user profile picture

## Admin Router

### User Management

- `GET /admin/users` - Show all users
- `GET /admin/get/one` - Get a specific user
- `POST /admin/add/user` - Add a single user
- `POST /admin/generate/users` - Generate multiple fake users for testing

### Skills Management

- `GET /admin/skills` - Show all skills
- `POST /admin/add/skill` - Add a single skill
- `POST /admin/add/skills/bulk` - Bulk add skills

### Testing Routes (Development Only)

- `POST /admin/deleteAllUsers` - Delete all users
- `GET /admin/setRandomSkillsAndMatches` - Set random skills and matches

Note: All user routes (except login/register) require authentication via JWT token.
