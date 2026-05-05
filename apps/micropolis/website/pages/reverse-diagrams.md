---
title: Reverse Diagrams
header: "SimCity Reverse Diagrams"
description: 📊 **Chaim Gingold's** detailed diagrams visually **reverse-engineering** the core **simulation loops** and mechanics of **SimCity Classic**.
---

These diagrams, created by [**Chaim Gingold**](/pages/about/chaim-gingold) for his book "[**Building SimCity: How to Put the World in a Machine**](/pages/building-simcity)" (**MIT Press**, 2024), represent a vital step towards opening up what [**Alan Kay**](/pages/constructionist-education/alan-kay) described as **SimCity's** "black box." By meticulously visualizing the game's internal architecture based on deep analysis of the [**Micropolis source code**](/pages/micropolis-license), Chaim provided an unprecedented look into its inner workings. This aligns perfectly with [**Stone Librande's**](/pages/about/stone-librande) [**one-page design philosophy**](/pages/about/stone-librande#revolutionary-documentation-approach), making complex systems graspable.

These static diagrams serve as the foundation for our ongoing project to create dynamic, interactive versions using [**SvelteKit**](https://kit.svelte.dev/), [**WebGL**](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API), and [**Canvas**](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), aiming to make the simulation truly transparent and explorable, as discussed on the [**Chaim Gingold page**](/pages/about/chaim-gingold#building-simcity-how-to-put-the-world-in-a-machine).

> With Chaim's explicit permission and encouragement, we are taking these diagrams further as live, tweakable tools. Inspired by [**Brett Victor**](/pages/about/brett-victor), our aim is immediate feedback, visible state, and manipulable parameters—turning static illustrations into instruments for understanding.

## Diagrams Index

- [**Simulation Loop (Simulate)**](#simulation-loop)
- [**Map Data Flow**](#map-data-flow)
- [**Maps**](#maps)
- [**Map Scan**](#map-scan)
- [**Make Traffic**](#make-traffic)
- [**Animation Characters**](#animation-characters)

## Simulation Loop {#simulation-loop}

**Simulation Loop (Simulate)**

The main **simulation loop** is broken down into 16 steps. Each revolution advances the city time by 1. Every frame of the game, one of these 16 steps is performed.

![SimCity Simulation Loop Diagram](/images/diagrams/SimCityReverseDiagrams-Page-1-Simulate.png)

This diagram reveals the core heartbeat of **SimCity**. It shows how [**Will Wright**](/pages/about/will-wright) structured the simulation's progression not as a monolithic update, but as a series of discrete, sequenced steps. This clever orchestration allows complex interactions (like pollution affecting land value, or population density influencing crime) to unfold over time within the loop, contributing to the feeling of a living city.

Notice the different frequencies: some processes like **DoPowerScan()** or **PTLScan()** (Pollution & Land Value) run more often than, say, **FireAnalysis()** or **DoDisasters()**, as detailed in the frequency table (Slow/Medium/Fast). The loop also includes crucial updates like calculating **RCI Valves**, performing the **Census** (which happens at different intervals depending on speed), evaluating the city via **CityEvaluation**, and triggering map generation (**GenerateMap**) and messages (**SendMessages**). This careful timing balances computational load with the perceived speed of different urban processes. Making this loop interactive will allow users to step through the simulation, pause it, inspect data at each stage, and even potentially modify the sequence or parameters, directly addressing the "black box" critique by exposing the fundamental temporal structure of the simulation.

## Map Data Flow {#map-data-flow}

**Map Data Flow**

This diagram shows how data flows between different map layers and representations in the simulation.

![SimCity Map Data Flow Diagram](/images/diagrams/SimCityReverseDiagrams-Page-2-Map-Data-Flow.png)

This diagram is crucial for understanding how different simulated systems influence each other. It visualizes the dependencies and interactions that create **SimCity's** complex **emergent behavior**. For example, you can see how **PopDensity** directly influences **Crime**, and how both **LandValue** and **Pollution** feed into the **PTLScan** process. The various **smoothing functions** (like Smooth-3) show how effects are spatially distributed across the map over time, preventing abrupt changes and creating more organic patterns.

Other key interactions revealed include how **Terrain** data is smoothed to contribute to **LandValue**, how the distance from the **City Center** (CCX, CCy) impacts **Commercial Rate** (ComRate) and thus **Population Density**, and how **PowerMap** directly influences multiple systems. The different map resolutions (1:1, 1:2, 1:4, 1:8) used for various layers (indicated by the ratios) are also visually represented here, tying into the [**Maps**](#maps) diagram.

Making this data flow interactive is a key goal. Imagine clicking on the **Police St.** node and seeing its current data, then following the arrows to see exactly how it impacts the **Crime** map, or adjusting the influence of **PopDensity** on **Crime** and watching the simulation adapt. This level of transparency and manipulability directly addresses [**Alan Kay's**](/pages/constructionist-education/alan-kay) critique and aligns with [**Brett Victor's**](/pages/about/brett-victor) ideas about understanding systems through direct interaction.

## Maps {#maps}

**Maps**

**SimCity's** spatial data is modeled in multiple maps that can be conceptualized as overlaid upon one another. The main Map is 120x100 and encodes seven different data layers.

![SimCity Maps Diagram](/images/diagrams/SimCityReverseDiagrams-Page-3-Maps.png)

This diagram reveals the core data structure of the simulation: a collection of overlapping **multi-resolution maps**. The main **Map[ ]** array stores tile IDs and status bits (Zone, Building, Road, Power, etc.) at full resolution (1:1). However, other critical data like **Pollution**, **Land Value**, **Crime**, **Population Density**, and **Fire Radius** are stored in lower-resolution maps (1:2, 1:4, 1:8). This was a brilliant optimization by [**Will Wright**](/pages/about/will-wright), drastically reducing memory usage and computational load while still providing sufficient detail for believable simulation and visualization.

The **Primary Map Data** section shows the 16-bit structure of each main map tile: the low 10 bits (`ZONEBIT`) define the tile character (like roads, zones, buildings) and properties (burnable, bulldozable, animated), while the high 6 bits are status flags used by other systems (powered `PWRBIT`, conductive `CONDBIT`, etc.). The overlay maps like **Pollution**, **Crime**, **Fire Coverage**, and **Traffic/Population Density** operate at lower resolutions, storing averaged or derived data relevant to those specific systems.

Understanding these layered, multi-resolution maps is key to grasping how the simulation achieves its effects efficiently. Interactive versions could allow users to toggle individual map layers, visualize the bit flags within each main map tile, zoom between resolutions, and directly see the data values stored for different properties at different locations and scales, making the underlying representation tangible.

## Map Scan {#map-scan}

**Map Scan**

The main tile map is scanned incrementally over eight simulation frames. One 15x100 column is scanned at a time (1/8th of the map). Tile map based processes and objects tallies are updated.

![SimCity Map Scan Diagram](/images/diagrams/SimCityReverseDiagrams-Page-4-Map-Scan.png)

This diagram illustrates another crucial optimization: **incremental map processing**. Instead of updating the entire map every simulation step, **SimCity** scans the map column by column over 8 frames (or steps in the [**Simulation Loop**](#simulation-loop)). This distributes the computational load over time, making the simulation feasible on the hardware of the era. It processes zones/buildings based on the **ZONEBIT** information stored in the main **Map[]** layer ([Maps](#maps) diagram), triggering events like fires, floods, or traffic generation ([Make Traffic](#make-traffic)).

Notably, the **Map Scan** handles specific tile behaviors: **Power Plants** are tallied (`CoalPop`, `NuclearPop`), **Roads/Rails** contribute to totals (`RoadTotal`, `RailTotal`), **Seaports/Airports** check for power (`PortPop`, `AirPop`), **Fires/Floods** propagate (`FirePop`, `FloodPop`), rubble decays (`RadPop`), and various buildings like **Stadiums**, **Hospitals**, and **Churches** are counted (`StadiumPop`, `HospitalPop`, `ChurchPop`). The **CONDBIT** is updated for power conductivity. This scan is the engine driving localized changes and updates across the city grid.

This incremental approach contributes to the game's temporal feel – changes don't happen instantly everywhere, but propagate across the city over time. An interactive version could visualize the scan line moving across the map, highlighting the currently processed tiles and showing the updates being applied, further demystifying the simulation's internal clockwork.

## Make Traffic {#make-traffic}

**Make Traffic**

**Make Traffic** can be invoked when **Map Scan** evaluates Residential, Commercial, and Industrial Zones. It returns either success (1: destination found), failure (0: destination not found), or hard failure (-1: no perimeter road found).

![SimCity Make Traffic Diagram](/images/diagrams/SimCityReverseDiagrams-Page-5-Make-Traffic.png)

Perhaps one of the most elegant parts of **SimCity's** design, the **Make Traffic** algorithm simulates traffic flow without tracking individual vehicles. As detailed here, it uses a randomized, stack-based pathfinding search (`FindPath()`, `Drive()`) from an origin (like a residential tile) towards potential destinations (like commercial or industrial tiles). It doesn't need a complex A* algorithm; instead, it performs a limited number of steps (~30) searching for *any* suitable destination tile within range along the road/rail network.

The success or failure of these pathfinding attempts directly contributes (`SetTrafMem()`) to the **Traffic Density** map ([Maps](#maps) diagram), creating emergent traffic patterns based on the efficiency of the road network. This brilliantly connects micro-level pathfinding attempts to macro-level traffic visualization and land value calculation, teaching players about good road design through implicit feedback. The diagram shows how the origin (`FindRoad()`) and destination searches (`DriveDone()`) work, the stack-based path memory (`TryDrive()`), and how accumulated traffic density (`> 240`) triggers the **helicopter** animation (`CopterHeli()`), providing a visual cue for major traffic jams. An interactive version could allow tracing individual pathfinding attempts, visualizing the stack, and seeing how failures or successes update the traffic density map in real-time.

## Animation Characters {#animation-characters}

**Animation Characters**

**SimCity** uses various **animation characters** to bring the city to life, from power outages to bridge animations, airport radar, park fountains and telecommunications.

![SimCity Animation Characters Diagram](/images/diagrams/SimCityReverseDiagrams-Page-6-Animation-Characters.png)

While not part of the core simulation logic driving growth or decline, these **animation characters** are essential for the game's aesthetic appeal and feedback mechanisms. They provide visual cues about the city's state – the **LIGHTNINGBOLT** indicates lack of power, the **HBRDG** animations show bridge functionality, the spinning **RADAR** requires airport power. These elements directly leverage the status bits stored in the main **Map[]** layer ([Maps](#maps)) but are rendered independently, adding life and clarity without significant simulation overhead.

The specific characters shown (`LIGHTNINGBOLT`, `HBRDG0`...`3`, `RADAR0`...`7`, `FOUNTAIN`, `TELELAST`) correspond to tile IDs 827-851. Other animations mentioned elsewhere include the **CopterHeli** (traffic jams) and potentially the **monster** (which notably seeks out high pollution). These visual elements are crucial for communicating the simulation state quickly and intuitively.

Understanding these characters shows how **SimCity** prioritizes **implication over simulation**, as [**Will Wright**](/pages/about/will-wright#reverse-over-engineering) noted. A simple blinking sprite effectively communicates a complex power grid issue. Making these interactive could involve clicking on an animation to see the underlying data trigger (e.g., clicking the lightning bolt shows the powerless tile status) or even allowing users to trigger animations directly via scripting. 