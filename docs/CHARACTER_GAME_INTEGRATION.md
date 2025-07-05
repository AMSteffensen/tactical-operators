he# Character-Game Integration Demo Guide

This guide demonstrates the new character selection and deployment system in the Tactical Operator game.

## Features Overview

### 1. Enhanced Character System
- **Character Creation**: Create characters with different classes (Assault, Sniper, Medic, Engineer, Demolitions)
- **Squad Selection**: Choose up to 4 characters for missions
- **Character Deployment**: Deploy selected characters to the tactical battlefield

### 2. Game State Flow
- **Setup State**: Select characters and build your squad
- **Deployment State**: Position characters and prepare for mission
- **Active State**: Execute tactical gameplay with deployed squad

### 3. Interactive 3D Tactical View
- **Enhanced Character Models**: Class-specific models with equipment
- **Click-to-Move**: Select characters and move them around the battlefield
- **Real-time Feedback**: Game log and character status updates

## Testing Steps

### Prerequisites
1. Ensure development servers are running:
   ```bash
   cd /Users/andreassteffensen/dev/tactical-operator
   ./scripts/dev-start.sh
   ```

2. Verify database has development user and characters:
   ```bash
   cd api-server
   npm run db:seed-dev
   ```

### Testing Flow

#### Step 1: Character Creation (if needed)
1. Navigate to the Game page
2. If no characters exist, click "Create New Character"
3. Fill out character creation form with:
   - Name: Any tactical name
   - Class: Choose from 5 available classes
   - Stats: Allocate points across 6 attributes
4. Submit and verify character appears in list

#### Step 2: Squad Selection
1. On Game page in Setup state, view available characters
2. Click on characters to select them (up to 4)
3. Selected characters appear in "Selected" panel
4. Click character again to deselect
5. Verify "Deploy Squad" button enables when characters selected

#### Step 3: Squad Deployment
1. Click "Deploy Squad" with selected characters
2. Game transitions to Deployment state
3. View deployed characters in left panel with health/status
4. See characters appear in 3D tactical view
5. Click "Start Mission" to begin active gameplay

#### Step 4: Interactive Tactical Gameplay
1. In Active state, interact with deployed characters:
   - Left-click character to select (yellow outline)
   - Left-click ground to move selected character
   - Right-click to deselect
   - Mouse wheel to zoom in/out
2. Observe game log for movement tracking
3. Check mission status panel for squad statistics

### Expected Behaviors

#### Character Models
- **Assault**: Red color, standard rifle, medium size
- **Sniper**: Green color, long rifle with scope, smaller size
- **Medic**: Blue color, pistol, medical cross on back
- **Engineer**: Orange color, tools, slightly larger
- **Demolitions**: Purple color, heavy weapon, largest size

#### Visual Feedback
- Selected units have yellow outlines
- Hovered units have white outlines
- Character movement is smoothly animated
- Game log tracks all actions with timestamps

#### UI Elements
- Squad selection shows character count (X/4)
- Deployed characters show health bars and status
- Mission status displays squad statistics
- Game state clearly indicated in footer

## Troubleshooting

### Common Issues
1. **No characters visible**: Ensure characters exist in database and API is running
2. **Characters not deploying**: Check browser console for errors
3. **3D view not loading**: Verify WebGL support and Three.js loading
4. **Movement not working**: Ensure characters are selected before clicking ground

### Debug Information
- Check browser console for detailed logs
- Game log panel shows real-time action tracking
- Socket connection status visible in header
- Character data logged during deployment

## Integration Points

### Real-time Communication
- Character movements broadcast via Socket.IO
- Position updates synchronized across clients
- Game state changes communicated to other players

### Database Integration
- Characters persist to PostgreSQL database
- Health and status tracked during gameplay
- Squad configurations saved per user session

### 3D Rendering Integration
- Characters rendered with class-specific models
- Real-time position updates in 3D space
- Interactive selection and movement system

---

**Next Steps**: 
- Implement combat mechanics
- Add turn-based gameplay
- Enhance multiplayer synchronization
- Add authentication system integration
