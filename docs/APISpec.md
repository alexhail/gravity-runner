# API Specification

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.gravity-runner.com/api
```

## Authentication
All endpoints except leaderboard viewing require JWT authentication.

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Player Management

#### Register Player
```
POST /players/register
Content-Type: application/json

Request:
{
  "username": string,
  "email": string,
  "password": string
}

Response:
{
  "id": number,
  "username": string,
  "token": string
}
```

#### Login
```
POST /players/login
Content-Type: application/json

Request:
{
  "email": string,
  "password": string
}

Response:
{
  "token": string,
  "player": {
    "id": number,
    "username": string
  }
}
```

### Scores

#### Submit Score
```
POST /scores
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "score": number,
  "gameTime": number,
  "collectibles": number,
  "distance": number
}

Response:
{
  "id": number,
  "rank": number,
  "isHighScore": boolean
}
```

#### Get Global Leaderboard
```
GET /leaderboard
Query Parameters:
- timeframe: "all" | "daily" | "weekly" | "monthly"
- limit: number (default: 100)
- offset: number (default: 0)

Response:
{
  "leaderboard": [
    {
      "rank": number,
      "playerId": number,
      "playerName": string,
      "score": number,
      "timestamp": string
    }
  ],
  "total": number
}
```

#### Get Player Stats
```
GET /players/:id/stats
Authorization: Bearer <token>

Response:
{
  "highScore": number,
  "totalGames": number,
  "averageScore": number,
  "bestDistance": number,
  "totalPlayTime": number,
  "achievements": Achievement[]
}
```

### Game State

#### Save Game Progress
```
POST /progress
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "currentLevel": number,
  "unlockedThemes": string[],
  "settings": {
    "music": boolean,
    "sfx": boolean,
    "difficulty": string
  }
}

Response:
{
  "success": boolean,
  "timestamp": string
}
```

#### Load Game Progress
```
GET /progress
Authorization: Bearer <token>

Response:
{
  "currentLevel": number,
  "unlockedThemes": string[],
  "settings": {
    "music": boolean,
    "sfx": boolean,
    "difficulty": string
  },
  "lastSaved": string
}
```

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### Scores Table
```sql
CREATE TABLE scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT NOT NULL,
  score INT NOT NULL,
  game_time INT NOT NULL,
  collectibles INT NOT NULL,
  distance INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id)
);
```

### Progress Table
```sql
CREATE TABLE progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT NOT NULL,
  current_level INT NOT NULL,
  unlocked_themes JSON,
  settings JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id)
);
```

### Achievements Table
```sql
CREATE TABLE achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  criteria JSON NOT NULL
);
```

### Player_Achievements Table
```sql
CREATE TABLE player_achievements (
  player_id INT NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, achievement_id),
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": string,
    "message": string,
    "details": object (optional)
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired token
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `DUPLICATE_ENTRY`: Unique constraint violation
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- Leaderboard endpoints: 30 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <timestamp>
```

## Caching

### Cache Headers
```
Cache-Control: public, max-age=<seconds>
ETag: "<entity-tag>"
```

### Cached Endpoints
- GET /leaderboard (5 minutes)
- GET /players/:id/stats (1 minute)
- GET /achievements (1 hour)

## WebSocket Events

### Connection
```
ws://localhost:3000/ws
Authorization: Bearer <token>
```

### Real-time Events
```typescript
interface WebSocketEvent {
  type: string;
  payload: any;
}

// Event Types
type EventType =
  | 'score_update'
  | 'achievement_unlocked'
  | 'leaderboard_change'
  | 'player_connected'
  | 'player_disconnected';
```

### Example Events
```json
// New high score
{
  "type": "score_update",
  "payload": {
    "playerId": 123,
    "playerName": "Player1",
    "score": 10000,
    "rank": 1
  }
}

// Achievement unlocked
{
  "type": "achievement_unlocked",
  "payload": {
    "playerId": 123,
    "achievementId": 5,
    "achievementName": "Speed Demon"
  }
}
``` 