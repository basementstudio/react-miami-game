# Game Schemas

This package contains shared validation schemas, types, and event handling utilities for the multiplayer game.

## Features

- **Zod Schemas**: Type-safe validation schemas for all game data structures
- **TypeScript Types**: Generated types from Zod schemas
- **Event System**: Type-safe event emitter for game events

## Usage

### Importing Schemas and Types

```typescript
import { 
  // Schemas
  Vector3Schema,
  PlayerDataSchema,
  
  // Types
  PlayerData,
  PresenceMessage,
  
  // Event System
  GameClientEventEmitter
} from 'game-schemas';
```

### Validation Example

```typescript
import { PlayerDataSchema } from 'game-schemas';

const rawData = {
  name: "Player1",
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 }
};

const result = PlayerDataSchema.safeParse(rawData);
if (result.success) {
  const playerData = result.data;
  // Use validated data
} else {
  console.error("Invalid player data:", result.error);
}
```

### Events Example

```typescript
import { GameClientEventEmitter } from 'game-schemas';

const events = new GameClientEventEmitter();

// Type-safe event subscription
events.on('playerJoined', ({ id, data }) => {
  console.log(`Player ${id} joined at position:`, data.position);
});

// Type-safe event emission
events.emit('playerJoined', {
  id: 'player-123',
  data: {
    name: 'Player1',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  }
});
``` 