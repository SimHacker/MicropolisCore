# Micropolis OpenLaszlo Client

This is the client-side implementation of Micropolis (the open-source version of SimCity) using the OpenLaszlo framework. The application was originally written to compile to Flash, providing a rich interactive city simulation experience in web browsers.

## Overview

Micropolis is a city building simulation originally created by Will Wright in 1989 as SimCity, and later released as open-source under the GPL license. This OpenLaszlo client provides a web-based interface to the Micropolis simulation engine, allowing users to build and manage virtual cities.

The client connects to a server-side simulation engine that handles the city dynamics, while the client manages the user interface, display, and interaction.

## Architecture

OpenLaszlo uses a prototype-based object system with a constraint-based reactivity model. This declarative approach differs significantly from traditional MVC architectures:

### Constraint-Based Reactivity

The application uses declarative XML definitions with constraints for automatic updates when dependencies change. For example:

```xml
<text text="${gApp.dateLabel}" />
```

This creates a constraint that automatically updates the text when `gApp.dateLabel` changes, without requiring manual event handling or observers.

### Prototype-Based Object System

Components extend from prototypes, creating inheritance chains that provide reusable functionality. For example, tools, map views, and UI components inherit behaviors while customizing specific properties and methods.

### Core Components

1. **Remote Server Connection** (`remoteserver.lzx`)
   - Handles communication with the server-side simulation engine
   - Uses AMF (Action Message Format) gateway to exchange city data and commands

2. **Application State** (`appview.lzx`, `main.lzx`)
   - Central application state management
   - Coordinates reactivity across components
   - Manages screen navigation between connect, start, and play screens

3. **Screens**
   - `connectscreen.lzx` - Handles server connection
   - `startscreen.lzx` - City selection, scenarios, new city generation
   - `playscreen.lzx` - Main gameplay interface

4. **Map Visualization**
   - `tileview.lzx` - Base tile rendering
   - `edittileview.lzx` - Interactive editor with tool support
   - `mapview.lzx` - Map rendering with overlays
   - `navigationmapview.lzx` - Mini-map for navigation
   - `previewmapview.lzx` - City preview on selection screen

5. **UI Components**
   - `toolpalette.lzx` - City building tools
   - `budgetview.lzx` - Budget management interface
   - `evaluationview.lzx` - City statistics and rating
   - `historyview.lzx` - Graphical history of city metrics
   - `overlaysview.lzx` - Map overlay controls
   - `disastersview.lzx` - Disaster trigger buttons
   - `controlpanel.lzx` - Game controls (speed, pause, etc.)
   - `noticeview.lzx` - Notification display
   - `wallview.lzx` - Chat/message interface

6. **Animation System**
   - `anitiles.lzx` - Animation sequences for tiles
   - `sprite.lzx` - Sprite management
   - `robot.lzx`, `robot_PacBot.lzx`, `robot_Xenu.lzx` - Autonomous agents

7. **Interaction Components**
   - `piemenu.lzx` - Context menus
   - `questiondialog.lzx` - Dialog boxes
   - Various cursor classes for tools and interaction

### Data Files

1. **XML Datasets**
   - `datasets.lzx` - Dataset definitions
   - `cities.xml` - Built-in cities
   - `disasters.xml` - Disaster types
   - `notices.xml` - Notification messages
   - `overlays.xml` - Map overlay types
   - `scenarios.xml` - Scenario definitions

2. **Resource Definitions**
   - `resources.lzx` - Resource imports
   - `resources_images.lzx` - UI graphics
   - `resources_sounds.lzx` - Sound effects
   - `resources_tiles.lzx` - Tile graphics

3. **Localization**
   - `strings.lzx` - String management
   - `strings_en-US.xml` - English strings

## Client-Server Communication

As described in `NOTES.txt`, the client-server architecture uses the following approach:

- Client views report their visible tile regions to the server
- Server tracks which tiles are in each client's buffer
- Animation is handled client-side to reduce network traffic
- Server maps animation group tiles to their base tile

Communication is handled through:
- AMF Gateway for Flash implementation
- Session management
- Connection timeouts and poll delays

## Game Features

### City Building Tools
- Zoning (Residential, Commercial, Industrial)
- Transportation (Roads, Rail, Seaport, Airport)
- Utilities (Power plants, Power lines)
- Services (Police, Fire, Stadiums, Parks)
- Terrain tools (Bulldozer)

### Simulation Features
- Traffic simulation
- Power grid simulation
- Population growth
- Budget management
- Tax rates
- Crime and pollution
- Land value
- Disasters (fire, flood, monster, etc.)

### UI Features
- Multiple map overlays (traffic, pollution, etc.)
- City statistics and evaluation
- History graphs
- Demand indicators (RCI)
- Speed controls
- Notifications
- Mini-map navigation

### Game Modes
- Random map generation
- Scenario play (8 built-in scenarios)
- Library of saved cities
- City sharing

## Future Plans (from TODO.txt)

1. **Social Integration**
   - User identity
   - City sharing
   - Friend participation
   - Chat functionality

2. **Enhanced UI**
   - Sliding panels
   - Integrated toolbar
   - Improved notice system
   - Reconfigurable interface

3. **Gameplay Enhancements**
   - City history tree
   - Branching scenarios
   - Multiplayer interactions
   - Virtual advisors

## Implementation Details

### Animation System

The animation system in `anitiles.lzx` defines all the tile animations for the game, such as:
- Traffic animations
- Fire animations
- Power plant animations
- Factory smoke
- Residential/commercial/industrial building animations

### Tile Rendering

The tile rendering system optimizes by:
- Tracking viewport changes
- Lazily loading tiles
- Client-side animation
- Efficient buffer management

### Tool System

The tool system in `toolpalette.lzx` provides:
- Visual tool selection
- Cursor feedback
- Cost calculations
- Validation during placement

### Autonomous Agents

The robot classes (`robot.lzx`, `robot_PacBot.lzx`, `robot_Xenu.lzx`) implement:
- Autonomous movement
- Path finding
- User interaction
- Context menus for control

## Notes on Development

This codebase was developed for OpenLaszlo, an XML-based development platform that compiled to Flash or DHTML. As Flash is now deprecated, this code primarily serves as a reference for the Micropolis client architecture and UI design.

For modern implementations, this architecture could be adapted to frameworks like SvelteKit which shares similar reactive constraint-based principles, using WebGL or Canvas for the rendering layer.

## License

Micropolis is licensed under GPLv3, as indicated in the file headers. 