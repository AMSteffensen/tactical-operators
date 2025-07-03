# 🎮 Tactical Operator - Current Demo

## 🚀 Quick Demo Guide

This guide shows you how to test the current WebGL + Socket.IO implementation.

## ✅ What's Working Now

### 3D Tactical View
- Interactive Three.js scene with tactical units
- Top-down orthographic camera (perfect for tactical games)
- Mouse wheel zoom functionality
- Visual unit types: Players (green), Enemies (red), Allies (blue)
- Tactical cover and obstacles

### Real-time Multiplayer
- Socket.IO connection with live status indicator
- Room-based multiplayer support
- Real-time event logging (check browser console)
- Multiple client support

## 🎯 Demo Steps

### 1. Start the Game
```bash
# Terminal 1: Start database
cd /Users/andreassteffensen/dev/tactical-operator
npm run docker:db

# Terminal 2: Start API server  
cd api-server
npm run dev

# Terminal 3: Start web client
cd web-client
npm run dev
```

### 2. Open the Game
1. Navigate to `http://localhost:3000`
2. Click on "Game" in the navigation
3. You should see the tactical 3D view load

### 3. Test the 3D View
- **Zoom**: Use mouse wheel to zoom in/out
- **Units**: See colored cubes representing different unit types
- **Cover**: Brown/gray objects are tactical cover
- **Loading**: Watch the spinner during 3D engine initialization

### 4. Test Multiplayer
1. Open a second browser tab to `http://localhost:3000`
2. Navigate to Game page in both tabs
3. Check connection status indicator (should show "Connected")
4. Open browser console (F12) in both tabs
5. Look for Socket.IO connection logs and events

## 🔍 What to Look For

### 3D Scene Elements
- **Player Unit**: Green cube at position (-3, 0, -3)
- **Enemy Unit**: Red cube at position (3, 0, 3)  
- **Ally Unit**: Blue cube at position (-1, 0, 2)
- **Cover Objects**: Brown crate, gray wall, brown cover
- **Grid Map**: Dark tactical grid surface

### Connection Status
- **Green dot + "Connected"**: Socket.IO working properly
- **Orange dot + "Connecting"**: Connection in progress
- **Red dot + "Disconnected"**: Connection failed

### Console Output
Open browser console (F12) to see:
- `✅ TacticalView initialized successfully`
- Socket.IO connection events
- Real-time multiplayer event logs

## 🎮 Interactive Features (Coming Soon)

The foundation is now ready for these upcoming features:
- Click-to-select units
- Click-to-move unit positioning  
- Turn-based movement validation
- Character creation and persistence
- Inventory management
- Guild/team formation

## 🐛 Troubleshooting

### 3D View Not Loading
- Check browser console for WebGL errors
- Ensure Three.js loaded properly
- Try refreshing the page

### Connection Issues
- Verify API server is running on port 3001
- Check if database container is running
- Look for CORS or network errors in console

### Performance Issues
- WebGL may be slow on older hardware
- Try closing other browser tabs
- Check if hardware acceleration is enabled

## 🎯 Next Steps

1. **Test the Demo**: Follow steps above to verify everything works
2. **Character System**: Next major feature to implement
3. **Interactive Controls**: Add click-to-move and unit selection
4. **Game Logic**: Implement turn-based movement rules

The WebGL + Socket.IO foundation is complete and ready for building the full tactical game experience!
