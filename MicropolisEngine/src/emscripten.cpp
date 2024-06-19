/* emscripten.cpp
 *
 * Micropolis, Unix Version.  This game was released for the Unix platform
 * in or about 1990 and has been modified for inclusion in the One Laptop
 * Per Child program.  Copyright (C) 1989 - 2007 Electronic Arts Inc.  If
 * you need assistance with this program, you may contact:
 *   http://wiki.laptop.org/go/Micropolis  or email  micropolis@laptop.org.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.  You should have received a
 * copy of the GNU General Public License along with this program.  If
 * not, see <http://www.gnu.org/licenses/>.
 *
 *             ADDITIONAL TERMS per GNU GPL Section 7
 *
 * No trademark or publicity rights are granted.  This license does NOT
 * give you any right, title or interest in the trademark SimCity or any
 * other Electronic Arts trademark.  You may not distribute any
 * modification of this program using the trademark SimCity or claim any
 * affliation or association with Electronic Arts Inc. or its employees.
 *
 * Any propagation or conveyance of this program must include this
 * copyright notice and these terms.
 *
 * If you convey this program (or any modifications of it) and assume
 * contractual liability for the program to recipients of it, you agree
 * to indemnify Electronic Arts for any liability that those contractual
 * assumptions impose on Electronic Arts.
 *
 * You may not misrepresent the origins of this program; modified
 * versions of the program must be marked as such and not identified as
 * the original program.
 *
 * This disclaimer supplements the one included in the General Public
 * License.  TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, THIS
 * PROGRAM IS PROVIDED TO YOU "AS IS," WITH ALL FAULTS, WITHOUT WARRANTY
 * OF ANY KIND, AND YOUR USE IS AT YOUR SOLE RISK.  THE ENTIRE RISK OF
 * SATISFACTORY QUALITY AND PERFORMANCE RESIDES WITH YOU.  ELECTRONIC ARTS
 * DISCLAIMS ANY AND ALL EXPRESS, IMPLIED OR STATUTORY WARRANTIES,
 * INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, SATISFACTORY QUALITY,
 * FITNESS FOR A PARTICULAR PURPOSE, NONINFRINGEMENT OF THIRD PARTY
 * RIGHTS, AND WARRANTIES (IF ANY) ARISING FROM A COURSE OF DEALING,
 * USAGE, OR TRADE PRACTICE.  ELECTRONIC ARTS DOES NOT WARRANT AGAINST
 * INTERFERENCE WITH YOUR ENJOYMENT OF THE PROGRAM; THAT THE PROGRAM WILL
 * MEET YOUR REQUIREMENTS; THAT OPERATION OF THE PROGRAM WILL BE
 * UNINTERRUPTED OR ERROR-FREE, OR THAT THE PROGRAM WILL BE COMPATIBLE
 * WITH THIRD PARTY SOFTWARE OR THAT ANY ERRORS IN THE PROGRAM WILL BE
 * CORRECTED.  NO ORAL OR WRITTEN ADVICE PROVIDED BY ELECTRONIC ARTS OR
 * ANY AUTHORIZED REPRESENTATIVE SHALL CREATE A WARRANTY.  SOME
 * JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF OR LIMITATIONS ON IMPLIED
 * WARRANTIES OR THE LIMITATIONS ON THE APPLICABLE STATUTORY RIGHTS OF A
 * CONSUMER, SO SOME OR ALL OF THE ABOVE EXCLUSIONS AND LIMITATIONS MAY
 * NOT APPLY TO YOU.
 */

/** 
 * @file emscripten.cpp
 * @brief Emscripten bindings for Micropolis game engine.
 *
 * This file contains Emscripten bindings that allow the Micropolis
 * (open-source version of SimCity) game engine to be used in a web
 * environment. It utilizes Emscripten's Embind feature to expose C++
 * classes, functions, enums, and data structures to JavaScript,
 * enabling the Micropolis game engine to be controlled and interacted
 * with through a web interface. This includes key functionalities
 * such as simulation control, game state management, map
 * manipulation, and event handling. The binding includes only
 * essential elements for gameplay, omitting low-level rendering and
 * platform-specific code.
 */


////////////////////////////////////////////////////////////////////////


#include <emscripten/bind.h>
#include "micropolis.h"
#include "js_callback.h"


////////////////////////////////////////////////////////////////////////


using namespace emscripten;


////////////////////////////////////////////////////////////////////////
// This file uses emscripten's embind to bind C++ classes,
// C structures, functions, enums, and contents into JavaScript,
// so you can even subclass C++ classes in JavaScript,
// for implementing plugins and user interfaces.
//
// Wrapping the entire Micropolis class from the Micropolis (open-source
// version of SimCity) code into Emscripten for JavaScript access is a
// large and complex task, mainly due to the size and complexity of the
// class. The class encompasses almost every aspect of the simulation,
// including map generation, simulation logic, user interface
// interactions, and more.
//
// Strategy for Wrapping
// 
// 1. Core Simulation Logic: Focus on the core simulation aspects, such
//    as the methods to run the simulation, update game states, and handle
//    user inputs (like building tools and disaster simulations). This is
//    crucial for any gameplay functionality.
// 
// 2. Memory and Performance Considerations: JavaScript and WebAssembly
//    run in a browser context, which can have memory limitations and
//    performance constraints. Carefully manage memory allocation,
//    especially when dealing with the game's map and various buffers.
// 
// 3. Direct Memory Access: Provide JavaScript access to critical game
//    data structures like the map buffer for efficient reading and
//    writing. This can be done using Emscripten's heap access functions
//    (HEAP8, HEAP16, HEAP32, etc.).
// 
// 4. User Interface and Rendering: This part might not be necessary to
//    wrap, as modern web technologies (HTML, CSS, WebGL) can be used for
//    UI. However, providing some hooks for game state (like score, budget,
//    etc.) to JavaScript might be helpful.
// 
// 5. Callbacks and Interactivity: Ensure that key game events and
//    callbacks are exposed to JavaScript, allowing for interactive and
//    responsive gameplay.
// 
// 6. Optimizations: Where possible, optimize C++ code for WebAssembly,
//    focusing on critical paths in the simulation loop.
// 
// Decisions and Explanations
//
// - Excluded Elements:
//       
//     - Low-level rendering or platform-specific code, as this can be
//       handled more efficiently with web technologies.
//       
//     - Parts of the code that handle file I/O directly, as file access
//       in a web context is typically handled differently (e.g., using
//       browser APIs or server-side support).
//       
//     - Any networking or multiplayer code, as web-based
//       implementations would differ significantly from desktop-based
//       network code.
//
// - Included Elements:
//       
//     - Core game mechanics, such as map generation, zone simulation
//       (residential, commercial, industrial), disaster simulation, and
//       basic utilities.
//       
//     - Game state management, including budgeting, scoring, and city
//       evaluation.
//       
//     - Direct memory access to critical structures like the map
//       buffer, allowing efficient manipulation from JavaScript.
// 
//     - Essential callbacks and event handling mechanisms to ensure
//       interactivity.
//
// Conclusion
// 
// Given the complexity and size of the Micropolis class, wrapping the
// entire class directly is impractical. However, focusing on key areas
// essential for gameplay and providing efficient interfaces for
// critical data structures can create a functional and interactive city
// simulation in a web context. Further optimizations and adjustments
// would likely be needed based on testing and specific requirements of
// the web implementation.
// 
// Implementation Notes
//
// The enum_, class_, constructor, function, and property functions
// from the emscripten namespace are used to specify how C++
// constructs should be exposed to JavaScript. You can use these to
// control which parts of your code are accessible and how they should
// be used from JavaScript.
//
// I've made some assumptions here:
//
// The types MapValue and MapTile are simple types (like integers or
// floats). If they are complex types, they would need their own
// bindings.
//
// I'm assuming that the copy constructor and copy assignment
// operator for the Position class are correctly implemented. If
// they aren't, then the Position object may not behave as expected
// in JavaScript.
// 
// Micropolis Binding Design
//
// The Micropolis interface organizes the Micropolis class header into
// categories of functions that are relevant for interaction with the
// JavaScript user interface, scripts, or plugins. The aim is to expose
// functions that could help in monitoring and controlling game state
// effectively.
//
// - Exposed to JavaScript (Public Interface)
//     - Simulation Control and Settings
//         - void simTick()
//         - void setSpeed(short speed)
//         - void setGameLevel(GameLevel level)
//         - void setCityName(const std::string &name)
//         - void setYear(int year)
//         - void pause()
//         - void resume()
//         - void setEnableDisasters(bool value)
//         - void setAutoBudget(bool value)
//         - void setAutoBulldoze(bool value)
//         - void setAutoGoto(bool value)
//         - void setEnableSound(bool value)
//         - void setDoAnimation(bool value)
//         - void doNewGame()
//         - void doBudget()
//         - void doScoreCard()
//         - void updateFunds()
//     - Gameplay Mechanics
//         - void doTool(EditingTool tool, short tileX, short tileY)
//         - void generateMap(int seed)
//         - void clearMap()
//         - void makeDisaster(DisasterType type)
//         - void getDemands(float *resDemandResult, float *comDemandResult, float *indDemandResult)
//     - Random Number Generation
//         - int simRandom()
//         - int getRandom(short range)
//         - int getRandom16()
//         - int getRandom16Signed()
//         - short getERandom(short limit)
//         - void randomlySeedRandom()
//         - void seedRandom(int seed)
//     - Game State and Data Access
//         - int getTile(int x, int y)
//         - void setTile(int x, int y, int tile)
//         - void setFunds(Quad dollars)
//         - Quad getCityPopulation()
//         - void updateMaps()
//         - void updateGraphs()
//         - void updateEvaluation()
//         - void updateBudget()
//     - Events and Callbacks
//         - void sendMessage(short messageNumber, short x = NOWHERE, short y = NOWHERE)
//         - void makeSound(std::string channel, std::string sound, int x = -1, int y = -1)
// - Hidden from JavaScript (Private Interface)
//     - Internal Simulation Mechanics
//         - void simFrame()
//         - void simulate()
//         - void doSimInit()
//         - void setValves()
//         - void clearCensus()
//         - void collectTax()
//         - void mapScan(int x1, int x2)
//     - Utility Functions
//         - void initMapArrays()
//         - void destroyMapArrays()
//         - void initSimMemory()
//         - void initGraphs()
//     - Zone Handling
//         - void doZone(const Position &pos)
//         - void doResidential(const Position &pos, bool zonePower)
//         - void doCommercial(const Position &pos, bool zonePower)
//         - void doIndustrial(const Position &pos, bool zonePower)
//     - Disaster Simulation
//         - void doDisasters()
//         - void scenarioDisaster()
//         - void fireAnalysis()
//         - void makeFire()
//         - void makeFlood()
//
// Conclusion
// 
// These exposed functions provide a comprehensive interface for
// scripting, plugins, and user interactions through JavaScript. The
// exposed set of functions includes random number generation,
// simulation control mechanisms, UI-triggered actions like budget
// updates, along with essential gameplay mechanics. The private section
// continues to encapsulate internal simulation details and complex data
// management routines integral to the game's core mechanics.



EMSCRIPTEN_BINDINGS(MicropolisEngine) {

  // position.h

  enum_<Direction2>("Direction2")
    .value("INVALID", Direction2::DIR2_INVALID)
    .value("NORTH", Direction2::DIR2_NORTH)
    .value("NORTH_EAST", Direction2::DIR2_NORTH_EAST)
    .value("EAST", Direction2::DIR2_EAST)
    .value("SOUTH_EAST", Direction2::DIR2_SOUTH_EAST)
    .value("SOUTH", Direction2::DIR2_SOUTH)
    .value("SOUTH_WEST", Direction2::DIR2_SOUTH_WEST)
    .value("WEST", Direction2::DIR2_WEST)
    .value("NORTH_WEST", Direction2::DIR2_NORTH_WEST)
    ;

  class_<Position>("Position")
    .constructor<>()
    .constructor<int, int>()
    .function("move", &Position::move)
    .function("testBounds", &Position::testBounds)
    .property("posX", &Position::posX)
    .property("posY", &Position::posY)
    ;

  function("increment45", &increment45);
  function("increment90", &increment90);
  function("rotate45", &rotate45);
  function("rotate90", &rotate90);
  function("rotate180", &rotate180);

  // tool.h

  class_<ToolEffects>("ToolEffects")
    //.constructor<Micropolis*>() // TODO: wrap
    .function("clear", &ToolEffects::clear)
    .function("modifyWorld", &ToolEffects::modifyWorld)
    .function("modifyIfEnoughFunding", &ToolEffects::modifyIfEnoughFunding)
    .function("getMapValue", select_overload<MapValue(const Position&) const>(&ToolEffects::getMapValue))
    .function("getMapTile", select_overload<MapTile(const Position&) const>(&ToolEffects::getMapTile))
    .function("getCost", &ToolEffects::getCost)
    .function("addCost", &ToolEffects::addCost)
    .function("setMapValue", select_overload<void(const Position&, MapValue)>(&ToolEffects::setMapValue))
    //.function("addFrontendMessage", &ToolEffects::addFrontendMessage) // TODO: wrap
    ;

  enum_<MapTileBits>("MapTileBits")
    .value("PWRBIT", PWRBIT)
    .value("CONDBIT", CONDBIT)
    .value("BURNBIT", BURNBIT)
    .value("BULLBIT", BULLBIT)
    .value("ANIMBIT", ANIMBIT)
    .value("ZONEBIT", ZONEBIT)
    .value("ALLBITS", ALLBITS)
    .value("LOMASK", LOMASK)
    .value("BLBNBIT", BLBNBIT)
    .value("BLBNCNBIT", BLBNCNBIT)
    .value("BNCNBIT", BNCNBIT)
    ;

  enum_<EditingTool>("EditingTool")
    .value("TOOL_RESIDENTIAL", TOOL_RESIDENTIAL)
    .value("TOOL_COMMERCIAL", TOOL_COMMERCIAL)
    .value("TOOL_INDUSTRIAL", TOOL_INDUSTRIAL)
    .value("TOOL_FIRESTATION", TOOL_FIRESTATION)
    .value("TOOL_POLICESTATION", TOOL_POLICESTATION)
    .value("TOOL_QUERY", TOOL_QUERY)
    .value("TOOL_WIRE", TOOL_WIRE)
    .value("TOOL_BULLDOZER", TOOL_BULLDOZER)
    .value("TOOL_RAILROAD", TOOL_RAILROAD)
    .value("TOOL_ROAD", TOOL_ROAD)
    .value("TOOL_STADIUM", TOOL_STADIUM)
    .value("TOOL_PARK", TOOL_PARK)
    .value("TOOL_SEAPORT", TOOL_SEAPORT)
    .value("TOOL_COALPOWER", TOOL_COALPOWER)
    .value("TOOL_NUCLEARPOWER", TOOL_NUCLEARPOWER)
    .value("TOOL_AIRPORT", TOOL_AIRPORT)
    .value("TOOL_NETWORK", TOOL_NETWORK)
    .value("TOOL_WATER", TOOL_WATER)
    .value("TOOL_LAND", TOOL_LAND)
    .value("TOOL_FOREST", TOOL_FOREST)
    .value("TOOL_COUNT", TOOL_COUNT)
    .value("TOOL_FIRST", TOOL_FIRST)
    .value("TOOL_LAST", TOOL_LAST);
    ;

  // map_type.h
  class_<Map<Byte, 1>>("MapByte1")
    .constructor<Byte>()
    .property("MAP_BLOCKSIZE", &Map<Byte, 1>::MAP_BLOCKSIZE)
    .property("MAP_W", &Map<Byte, 1>::MAP_W)
    .property("MAP_H", &Map<Byte, 1>::MAP_H)
    .function("fill", &Map<Byte, 1>::fill)
    .function("clear", &Map<Byte, 1>::clear)
    .function("set", &Map<Byte, 1>::set)
    .function("get", &Map<Byte, 1>::get)
    .function("onMap", &Map<Byte, 1>::onMap)
    .function("worldSet", &Map<Byte, 1>::worldSet)
    .function("worldGet", &Map<Byte, 1>::worldGet)
    .function("worldOnMap", &Map<Byte, 1>::worldOnMap)
    //.function("getBase", &Map<Byte, 1>::getBase, allow_raw_pointers()) // TODO: wrap
    .function("getTotalByteSize", &Map<Byte, 1>::getTotalByteSize)
    ;

  class_<Map<Byte, 2>>("MapByte2")
    .constructor<Byte>()
    .property("MAP_BLOCKSIZE", &Map<Byte, 2>::MAP_BLOCKSIZE)
    .property("MAP_W", &Map<Byte, 2>::MAP_W)
    .property("MAP_H", &Map<Byte, 2>::MAP_H)
    .function("fill", &Map<Byte, 2>::fill)
    .function("clear", &Map<Byte, 2>::clear)
    .function("set", &Map<Byte, 2>::set)
    .function("get", &Map<Byte, 2>::get)
    .function("onMap", &Map<Byte, 2>::onMap)
    .function("worldSet", &Map<Byte, 2>::worldSet)
    .function("worldGet", &Map<Byte, 2>::worldGet)
    .function("worldOnMap", &Map<Byte, 2>::worldOnMap)
    //.function("getBase", &Map<Byte, 2>::getBase, allow_raw_pointers()) // TODO: wrap
    .function("getTotalByteSize", &Map<Byte, 2>::getTotalByteSize)
    ;

  class_<Map<Byte, 4>>("MapByte4")
    .constructor<Byte>()
    .property("MAP_BLOCKSIZE", &Map<Byte, 4>::MAP_BLOCKSIZE)
    .property("MAP_W", &Map<Byte, 4>::MAP_W)
    .property("MAP_H", &Map<Byte, 4>::MAP_H)
    .function("fill", &Map<Byte, 4>::fill)
    .function("clear", &Map<Byte, 4>::clear)
    .function("set", &Map<Byte, 4>::set)
    .function("get", &Map<Byte, 4>::get)
    .function("onMap", &Map<Byte, 4>::onMap)
    .function("worldSet", &Map<Byte, 4>::worldSet)
    .function("worldGet", &Map<Byte, 4>::worldGet)
    .function("worldOnMap", &Map<Byte, 4>::worldOnMap)
    //.function("getBase", &Map<Byte, 4>::getBase, allow_raw_pointers()) // TODO: wrap
    .function("getTotalByteSize", &Map<Byte, 4>::getTotalByteSize)
    ;

  class_<Map<short, 8>>("MapShort8")
    .constructor<short>()
    .property("MAP_BLOCKSIZE", &Map<short, 8>::MAP_BLOCKSIZE)
    .property("MAP_W", &Map<short, 8>::MAP_W)
    .property("MAP_H", &Map<short, 8>::MAP_H)
    .function("fill", &Map<short, 8>::fill)
    .function("clear", &Map<short, 8>::clear)
    .function("set", &Map<short, 8>::set)
    .function("get", &Map<short, 8>::get)
    .function("onMap", &Map<short, 8>::onMap)
    .function("worldSet", &Map<short, 8>::worldSet)
    .function("worldGet", &Map<short, 8>::worldGet)
    .function("worldOnMap", &Map<short, 8>::worldOnMap)
    //.function("getBase", &Map<short, 8>::getBase, allow_raw_pointers()) // TODO: wrap
    .function("getTotalByteSize", &Map<short, 8>::getTotalByteSize)
    ;

/*

function createTypedArrayFromMap(mapInstance) {
    var pointer = mapInstance.getBase();
    var byteSize = mapInstance.getTotalByteSize();
    var mapSize = mapInstance.MAP_W * mapInstance.MAP_H;
    var arrayType;

    // Determine the correct Typed Array type based on DATA type
    if (byteSize === mapSize) {
        arrayType = Uint8Array;
    } else if (byteSize === mapSize * 2) {
        arrayType = Uint16Array;
    } else {
        console.error("Unsupported data type for Typed Array.");
        return null;
    }

    var typedArray = new arrayType(Module.HEAPU8.buffer, pointer, byteSize / arrayType.BYTES_PER_ELEMENT);
    return typedArray;
}

*/

  // text.h

  enum_<Stri202>("Stri202")
    .value("STR202_POPULATIONDENSITY_LOW", STR202_POPULATIONDENSITY_LOW) // 0: Low
    .value("STR202_POPULATIONDENSITY_MEDIUM", STR202_POPULATIONDENSITY_MEDIUM) // 1: Medium
    .value("STR202_POPULATIONDENSITY_HIGH", STR202_POPULATIONDENSITY_HIGH) // 2: High
    .value("STR202_POPULATIONDENSITY_VERYHIGH", STR202_POPULATIONDENSITY_VERYHIGH) // 3: Very High
    .value("STR202_LANDVALUE_SLUM", STR202_LANDVALUE_SLUM) // 4: Slum
    .value("STR202_LANDVALUE_LOWER_CLASS", STR202_LANDVALUE_LOWER_CLASS) // 5: Lower Class
    .value("STR202_LANDVALUE_MIDDLE_CLASS", STR202_LANDVALUE_MIDDLE_CLASS) // 6: Middle Class
    .value("STR202_LANDVALUE_HIGH_CLASS", STR202_LANDVALUE_HIGH_CLASS) // 7: High
    .value("STR202_CRIME_NONE", STR202_CRIME_NONE) // 8: Safe
    .value("STR202_CRIME_LIGHT", STR202_CRIME_LIGHT) // 9: Light
    .value("STR202_CRIME_MODERATE", STR202_CRIME_MODERATE) // 10: Moderate
    .value("STR202_CRIME_DANGEROUS", STR202_CRIME_DANGEROUS) // 11: Dangerous
    .value("STR202_POLLUTION_NONE", STR202_POLLUTION_NONE) // 12: None
    .value("STR202_POLLUTION_MODERATE", STR202_POLLUTION_MODERATE) // 13: Moderate
    .value("STR202_POLLUTION_HEAVY", STR202_POLLUTION_HEAVY) // 14: Heavy
    .value("STR202_POLLUTION_VERY_HEAVY", STR202_POLLUTION_VERY_HEAVY) // 15: Very Heavy
    .value("STR202_GROWRATE_DECLINING", STR202_GROWRATE_DECLINING) // 16: Declining
    .value("STR202_GROWRATE_STABLE", STR202_GROWRATE_STABLE) // 17: Stable
    .value("STR202_GROWRATE_SLOWGROWTH", STR202_GROWRATE_SLOWGROWTH) // 18: Slow Growth
    .value("STR202_GROWRATE_FASTGROWTH", STR202_GROWRATE_FASTGROWTH) // 19: Fast Growth
    ;

  enum_<MessageNumber>("MessageNumber")
    .value("MESSAGE_NEED_MORE_RESIDENTIAL", MESSAGE_NEED_MORE_RESIDENTIAL) // 1: More residential zones needed.
    .value("MESSAGE_NEED_MORE_COMMERCIAL", MESSAGE_NEED_MORE_COMMERCIAL) // 2: More commercial zones needed.
    .value("MESSAGE_NEED_MORE_INDUSTRIAL", MESSAGE_NEED_MORE_INDUSTRIAL) // 3: More industrial zones needed.
    .value("MESSAGE_NEED_MORE_ROADS", MESSAGE_NEED_MORE_ROADS) // 4: More roads required.
    .value("MESSAGE_NEED_MORE_RAILS", MESSAGE_NEED_MORE_RAILS) // 5: Inadequate rail system.
    .value("MESSAGE_NEED_ELECTRICITY", MESSAGE_NEED_ELECTRICITY) // 6: Build a Power Plant.
    .value("MESSAGE_NEED_STADIUM", MESSAGE_NEED_STADIUM) // 7: Residents demand a Stadium.
    .value("MESSAGE_NEED_SEAPORT", MESSAGE_NEED_SEAPORT) // 8: Industry requires a Sea Port.
    .value("MESSAGE_NEED_AIRPORT", MESSAGE_NEED_AIRPORT) // 9: Commerce requires an Airport.
    .value("MESSAGE_HIGH_POLLUTION", MESSAGE_HIGH_POLLUTION) // 10: Pollution very high.
    .value("MESSAGE_HIGH_CRIME", MESSAGE_HIGH_CRIME) // 11: Crime very high.
    .value("MESSAGE_TRAFFIC_JAMS", MESSAGE_TRAFFIC_JAMS) // 12: Frequent traffic jams reported.
    .value("MESSAGE_NEED_FIRE_STATION", MESSAGE_NEED_FIRE_STATION) // 13: Citizens demand a Fire Department.
    .value("MESSAGE_NEED_POLICE_STATION", MESSAGE_NEED_POLICE_STATION) // 14: Citizens demand a Police Department.
    .value("MESSAGE_BLACKOUTS_REPORTED", MESSAGE_BLACKOUTS_REPORTED) // 15: Blackouts reported. Check power map.
    .value("MESSAGE_TAX_TOO_HIGH", MESSAGE_TAX_TOO_HIGH) // 16: Citizens upset. The tax rate is too high.
    .value("MESSAGE_ROAD_NEEDS_FUNDING", MESSAGE_ROAD_NEEDS_FUNDING) // 17: Roads deteriorating, due to lack of funds.
    .value("MESSAGE_FIRE_STATION_NEEDS_FUNDING", MESSAGE_FIRE_STATION_NEEDS_FUNDING) // 18: Fire departments need funding.
    .value("MESSAGE_POLICE_NEEDS_FUNDING", MESSAGE_POLICE_NEEDS_FUNDING) // 19: Police departments need funding.
    .value("MESSAGE_FIRE_REPORTED", MESSAGE_FIRE_REPORTED) // 20: Fire reported!
    .value("MESSAGE_MONSTER_SIGHTED", MESSAGE_MONSTER_SIGHTED) // 21: A Monster has been sighted!!
    .value("MESSAGE_TORNADO_SIGHTED", MESSAGE_TORNADO_SIGHTED) // 22: Tornado reported!!
    .value("MESSAGE_EARTHQUAKE", MESSAGE_EARTHQUAKE) // 23: Major earthquake reported!!!
    .value("MESSAGE_PLANE_CRASHED", MESSAGE_PLANE_CRASHED) // 24: A plane has crashed!
    .value("MESSAGE_SHIP_CRASHED", MESSAGE_SHIP_CRASHED) // 25: Shipwreck reported!
    .value("MESSAGE_TRAIN_CRASHED", MESSAGE_TRAIN_CRASHED) // 26: A train crashed!
    .value("MESSAGE_HELICOPTER_CRASHED", MESSAGE_HELICOPTER_CRASHED) // 27: A helicopter crashed!
    .value("MESSAGE_HIGH_UNEMPLOYMENT", MESSAGE_HIGH_UNEMPLOYMENT) // 28: Unemployment rate is high.
    .value("MESSAGE_NO_MONEY", MESSAGE_NO_MONEY) // 29: YOUR CITY HAS GONE BROKE!
    .value("MESSAGE_FIREBOMBING", MESSAGE_FIREBOMBING) // 30: Firebombing reported!
    .value("MESSAGE_NEED_MORE_PARKS", MESSAGE_NEED_MORE_PARKS) // 31: Need more parks.
    .value("MESSAGE_EXPLOSION_REPORTED", MESSAGE_EXPLOSION_REPORTED) // 32: Explosion detected!
    .value("MESSAGE_NOT_ENOUGH_FUNDS", MESSAGE_NOT_ENOUGH_FUNDS) // 33: Insufficient funds to build that.
    .value("MESSAGE_BULLDOZE_AREA_FIRST", MESSAGE_BULLDOZE_AREA_FIRST) // 34: Area must be bulldozed first.
    .value("MESSAGE_REACHED_TOWN", MESSAGE_REACHED_TOWN) // 35: Population has reached 2,000.
    .value("MESSAGE_REACHED_CITY", MESSAGE_REACHED_CITY) // 36: Population has reached 10,000.
    .value("MESSAGE_REACHED_CAPITAL", MESSAGE_REACHED_CAPITAL) // 37: Population has reached 50,000.
    .value("MESSAGE_REACHED_METROPOLIS", MESSAGE_REACHED_METROPOLIS) // 38: Population has reached 100,000.
    .value("MESSAGE_REACHED_MEGALOPOLIS", MESSAGE_REACHED_MEGALOPOLIS) // 39: Population has reached 500,000.
    .value("MESSAGE_NOT_ENOUGH_POWER", MESSAGE_NOT_ENOUGH_POWER) // 40: Brownouts, build another Power Plant.
    .value("MESSAGE_HEAVY_TRAFFIC", MESSAGE_HEAVY_TRAFFIC) // 41: Heavy Traffic reported.
    .value("MESSAGE_FLOODING_REPORTED", MESSAGE_FLOODING_REPORTED) // 42: Flooding reported!!
    .value("MESSAGE_NUCLEAR_MELTDOWN", MESSAGE_NUCLEAR_MELTDOWN) // 43: A Nuclear Meltdown has occurred!!!
    .value("MESSAGE_RIOTS_REPORTED", MESSAGE_RIOTS_REPORTED) // 44: They're rioting in the streets!!
    .value("MESSAGE_STARTED_NEW_CITY", MESSAGE_STARTED_NEW_CITY) // 45: Started a New City.
    .value("MESSAGE_LOADED_SAVED_CITY", MESSAGE_LOADED_SAVED_CITY) // 46: Restored a Saved City.
    .value("MESSAGE_SCENARIO_WON", MESSAGE_SCENARIO_WON) // 47: You won the scenario.
    .value("MESSAGE_SCENARIO_LOST", MESSAGE_SCENARIO_LOST) // 48: You lose the scenario.
    .value("MESSAGE_ABOUT_MICROPOLIS", MESSAGE_ABOUT_MICROPOLIS) // 49: About Micropolis.
    .value("MESSAGE_SCENARIO_DULLSVILLE", MESSAGE_SCENARIO_DULLSVILLE) // 50: Dullsville scenario.
    .value("MESSAGE_SCENARIO_SAN_FRANCISCO", MESSAGE_SCENARIO_SAN_FRANCISCO) // 51: San Francisco scenario.
    .value("MESSAGE_SCENARIO_HAMBURG", MESSAGE_SCENARIO_HAMBURG) // 52: Hamburg scenario.
    .value("MESSAGE_SCENARIO_BERN", MESSAGE_SCENARIO_BERN) // 53: Bern scenario.
    .value("MESSAGE_SCENARIO_TOKYO", MESSAGE_SCENARIO_TOKYO) // 54: Tokyo scenario.
    .value("MESSAGE_SCENARIO_DETROIT", MESSAGE_SCENARIO_DETROIT) // 55: Detroit scenario.
    .value("MESSAGE_SCENARIO_BOSTON", MESSAGE_SCENARIO_BOSTON) // 56: Boston scenario.
    .value("MESSAGE_SCENARIO_RIO_DE_JANEIRO", MESSAGE_SCENARIO_RIO_DE_JANEIRO) // 57: Rio de Janeiro scenario.
    .value("MESSAGE_LAST", MESSAGE_LAST) // 57: Last valid message
    ;

  // frontendmessage.h TODO

  // The FrontendMessage class is defined as an abstract base class with pure_virtual() 
  // for the sendMessage method.
  // FrontendMessageDidTool and FrontendMessageMakeSound are bound as subclasses of FrontendMessage. 
  // The allow_subclass method is used to register them as valid subclasses.
  // Constructors and properties are exposed for FrontendMessageDidTool and 
  // FrontendMessageMakeSound to create instances and access their members in JavaScript.

/*
  class_<FrontendMessage>("FrontendMessage")
    .smart_ptr<std::shared_ptr<FrontendMessage>>("shared_ptr<FrontendMessage>")
    .allow_subclass<FrontendMessageDidTool>("FrontendMessageDidTool")
    .allow_subclass<FrontendMessageMakeSound>("FrontendMessageMakeSound")
    .function("sendMessage", &FrontendMessage::sendMessage, pure_virtual())
    ;

  class_<FrontendMessageDidTool, base<FrontendMessage>>("FrontendMessageDidTool")
    .constructor<const char*, int, int>()
    .property("tool", &FrontendMessageDidTool::tool)
    .property("x", &FrontendMessageDidTool::x)
    .property("y", &FrontendMessageDidTool::y)
    ;

  class_<FrontendMessageMakeSound, base<FrontendMessage>>("FrontendMessageMakeSound")
    .constructor<const char*, const char*, int, int>()
    .property("channel", &FrontendMessageMakeSound::channel)
    .property("sound", &FrontendMessageMakeSound::sound)
    .property("x", &FrontendMessageMakeSound::x)
    .property("y", &FrontendMessageMakeSound::y)
    ;
*/

  // micropolis.h

  constant("WORLD_W", WORLD_W);
  constant("WORLD_H", WORLD_H);
  constant("BITS_PER_TILE", BITS_PER_TILE);
  constant("BYTES_PER_TILE", BYTES_PER_TILE);
  constant("WORLD_W_2", WORLD_W_2);
  constant("WORLD_H_2", WORLD_H_2);
  constant("WORLD_W_4", WORLD_W_4);
  constant("WORLD_H_4", WORLD_H_4);
  constant("WORLD_W_8", WORLD_W_8);
  constant("WORLD_H_8", WORLD_H_8);
  constant("EDITOR_TILE_SIZE", EDITOR_TILE_SIZE);
  constant("PASSES_PER_CITYTIME", PASSES_PER_CITYTIME);
  constant("CITYTIMES_PER_MONTH", CITYTIMES_PER_MONTH);
  constant("CITYTIMES_PER_YEAR", CITYTIMES_PER_YEAR);
  constant("HISTORY_LENGTH", HISTORY_LENGTH);
  constant("MISC_HISTORY_LENGTH", MISC_HISTORY_LENGTH);
  constant("HISTORY_COUNT", HISTORY_COUNT);
  constant("POWER_STACK_SIZE", POWER_STACK_SIZE);
  constant("NOWHERE", NOWHERE);
  constant("ISLAND_RADIUS", ISLAND_RADIUS);
  constant("MAX_TRAFFIC_DISTANCE", MAX_TRAFFIC_DISTANCE);
  constant("MAX_ROAD_EFFECT", MAX_ROAD_EFFECT);
  constant("MAX_POLICE_STATION_EFFECT", MAX_POLICE_STATION_EFFECT);
  constant("MAX_FIRE_STATION_EFFECT", MAX_FIRE_STATION_EFFECT);
  constant("RES_VALVE_RANGE", RES_VALVE_RANGE);
  constant("COM_VALVE_RANGE", COM_VALVE_RANGE);
  constant("IND_VALVE_RANGE", IND_VALVE_RANGE);

  emscripten::enum_<HistoryType>("HistoryType")
    .value("HISTORY_TYPE_RES", HISTORY_TYPE_RES)
    .value("HISTORY_TYPE_COM", HISTORY_TYPE_COM)
    .value("HISTORY_TYPE_IND", HISTORY_TYPE_IND)
    .value("HISTORY_TYPE_MONEY", HISTORY_TYPE_MONEY)
    .value("HISTORY_TYPE_CRIME", HISTORY_TYPE_CRIME)
    .value("HISTORY_TYPE_POLLUTION", HISTORY_TYPE_POLLUTION)
    .value("HISTORY_TYPE_COUNT", HISTORY_TYPE_COUNT)
    ;

  // HistoryScale
  emscripten::enum_<HistoryScale>("HistoryScale")
    .value("HISTORY_SCALE_SHORT", HISTORY_SCALE_SHORT)
    .value("HISTORY_SCALE_LONG", HISTORY_SCALE_LONG)
    .value("HISTORY_SCALE_COUNT", HISTORY_SCALE_COUNT)
    ;

  // MapType
  emscripten::enum_<MapType>("MapType")
    .value("MAP_TYPE_ALL", MAP_TYPE_ALL)
    .value("MAP_TYPE_RES", MAP_TYPE_RES)
    .value("MAP_TYPE_COM", MAP_TYPE_COM)
    .value("MAP_TYPE_IND", MAP_TYPE_IND)
    .value("MAP_TYPE_POWER", MAP_TYPE_POWER)
    .value("MAP_TYPE_ROAD", MAP_TYPE_ROAD)
    .value("MAP_TYPE_POPULATION_DENSITY", MAP_TYPE_POPULATION_DENSITY)
    .value("MAP_TYPE_RATE_OF_GROWTH", MAP_TYPE_RATE_OF_GROWTH)
    .value("MAP_TYPE_TRAFFIC_DENSITY", MAP_TYPE_TRAFFIC_DENSITY)
    .value("MAP_TYPE_POLLUTION", MAP_TYPE_POLLUTION)
    .value("MAP_TYPE_CRIME", MAP_TYPE_CRIME)
    .value("MAP_TYPE_LAND_VALUE", MAP_TYPE_LAND_VALUE)
    .value("MAP_TYPE_FIRE_RADIUS", MAP_TYPE_FIRE_RADIUS)
    .value("MAP_TYPE_POLICE_RADIUS", MAP_TYPE_POLICE_RADIUS)
    .value("MAP_TYPE_DYNAMIC", MAP_TYPE_DYNAMIC)
    .value("MAP_TYPE_COUNT", MAP_TYPE_COUNT)
    ;

  // SpriteType
  emscripten::enum_<SpriteType>("SpriteType")
    .value("SPRITE_NOTUSED", SPRITE_NOTUSED)
    .value("SPRITE_TRAIN", SPRITE_TRAIN)
    .value("SPRITE_HELICOPTER", SPRITE_HELICOPTER)
    .value("SPRITE_AIRPLANE", SPRITE_AIRPLANE)
    .value("SPRITE_SHIP", SPRITE_SHIP)
    .value("SPRITE_MONSTER", SPRITE_MONSTER)
    .value("SPRITE_TORNADO", SPRITE_TORNADO)
    .value("SPRITE_EXPLOSION", SPRITE_EXPLOSION)
    .value("SPRITE_BUS", SPRITE_BUS)
    .value("SPRITE_COUNT", SPRITE_COUNT)
    ;

  // ConnectTileCommand
  emscripten::enum_<ConnectTileCommand>("ConnectTileCommand")
    .value("CONNECT_TILE_FIX", CONNECT_TILE_FIX)
    .value("CONNECT_TILE_BULLDOZE", CONNECT_TILE_BULLDOZE)
    .value("CONNECT_TILE_ROAD", CONNECT_TILE_ROAD)
    .value("CONNECT_TILE_RAILROAD", CONNECT_TILE_RAILROAD)
    .value("CONNECT_TILE_WIRE", CONNECT_TILE_WIRE)
    ;

  // ToolResult
  emscripten::enum_<ToolResult>("ToolResult")
    .value("TOOLRESULT_NO_MONEY", TOOLRESULT_NO_MONEY)
    .value("TOOLRESULT_NEED_BULLDOZE", TOOLRESULT_NEED_BULLDOZE)
    .value("TOOLRESULT_FAILED", TOOLRESULT_FAILED)
    .value("TOOLRESULT_OK", TOOLRESULT_OK)
    ;

  // Scenario
  emscripten::enum_<Scenario>("Scenario")
    .value("SC_NONE", SC_NONE)
    .value("SC_DULLSVILLE", SC_DULLSVILLE)
    .value("SC_SAN_FRANCISCO", SC_SAN_FRANCISCO)
    .value("SC_HAMBURG", SC_HAMBURG)
    .value("SC_BERN", SC_BERN)
    .value("SC_TOKYO", SC_TOKYO)
    .value("SC_DETROIT", SC_DETROIT)
    .value("SC_BOSTON", SC_BOSTON)
    .value("SC_RIO", SC_RIO)
    .value("SC_COUNT", SC_COUNT)
    ;

  // ZoneType
  emscripten::enum_<ZoneType>("ZoneType")
    .value("ZT_COMMERCIAL", ZT_COMMERCIAL)
    .value("ZT_INDUSTRIAL", ZT_INDUSTRIAL)
    .value("ZT_RESIDENTIAL", ZT_RESIDENTIAL)
    .value("ZT_NUM_DESTINATIONS", ZT_NUM_DESTINATIONS)
    ;

  // CityVotingProblems
  emscripten::enum_<CityVotingProblems>("CityVotingProblems")
    .value("CVP_CRIME", CVP_CRIME)
    .value("CVP_POLLUTION", CVP_POLLUTION)
    .value("CVP_HOUSING", CVP_HOUSING)
    .value("CVP_TAXES", CVP_TAXES)
    .value("CVP_TRAFFIC", CVP_TRAFFIC)
    .value("CVP_UNEMPLOYMENT", CVP_UNEMPLOYMENT)
    .value("CVP_FIRE", CVP_FIRE)
    .value("CVP_NUMPROBLEMS", CVP_NUMPROBLEMS)
    .value("CVP_PROBLEM_COMPLAINTS", CVP_PROBLEM_COMPLAINTS)
    .value("PROBNUM", PROBNUM)
    ;

  // CityClass
  emscripten::enum_<CityClass>("CityClass")
    .value("CC_VILLAGE", CC_VILLAGE)
    .value("CC_TOWN", CC_TOWN)
    .value("CC_CITY", CC_CITY)
    .value("CC_CAPITAL", CC_CAPITAL)
    .value("CC_METROPOLIS", CC_METROPOLIS)
    .value("CC_MEGALOPOLIS", CC_MEGALOPOLIS)
    .value("CC_NUM_CITIES", CC_NUM_CITIES)
    ;

  // GameLevel
  emscripten::enum_<GameLevel>("GameLevel")
    .value("LEVEL_EASY", LEVEL_EASY)
    .value("LEVEL_MEDIUM", LEVEL_MEDIUM)
    .value("LEVEL_HARD", LEVEL_HARD)
    .value("LEVEL_COUNT", LEVEL_COUNT)
    .value("LEVEL_FIRST", LEVEL_FIRST)
    .value("LEVEL_LAST", LEVEL_LAST)
    ;

  emscripten::enum_<Tiles>("Tiles")
    .value("DIRT", DIRT) // 0: Clear tile
    // tile 1 ?
    // Water:
    .value("RIVER", RIVER) // 2
    .value("REDGE", REDGE) // 3
    .value("CHANNEL", CHANNEL) // 4
    .value("FIRSTRIVEDGE", FIRSTRIVEDGE) // 5
    // tile 6 -- 19 ?
    .value("LASTRIVEDGE", LASTRIVEDGE) // 20
    .value("WATER_LOW", WATER_LOW) // 2 (RIVER): First water tile
    .value("WATER_HIGH", WATER_HIGH) // 20 (LASTRIVEDGE): Last water tile (inclusive)
    .value("TREEBASE", TREEBASE) // 21
    .value("WOODS_LOW", WOODS_LOW) // 21 (TREEBASE)
    .value("LASTTREE", LASTTREE) // 36
    .value("WOODS", WOODS) // 37
    .value("UNUSED_TRASH1", UNUSED_TRASH1) // 38
    .value("UNUSED_TRASH2", UNUSED_TRASH2) // 39
    .value("WOODS_HIGH", WOODS_HIGH) // 39 (UNUSED_TRASH2): Why is an 'UNUSED' tile used?
    .value("WOODS2", WOODS2) // 40
    .value("WOODS3", WOODS3) // 41
    .value("WOODS4", WOODS4) // 42
    .value("WOODS5", WOODS5) // 43
    // Rubble (4 tiles)
    .value("RUBBLE", RUBBLE) // 44
    .value("LASTRUBBLE", LASTRUBBLE) // 47
    .value("FLOOD", FLOOD) // 48
    // tile 49, 50 ?
    .value("LASTFLOOD", LASTFLOOD) // 51
    .value("RADTILE", RADTILE) // 52: Radio-active contaminated tile
    .value("UNUSED_TRASH3", UNUSED_TRASH3) // 53
    .value("UNUSED_TRASH4", UNUSED_TRASH4) // 54
    .value("UNUSED_TRASH5", UNUSED_TRASH5) // 55
    // Fire animation (8 tiles)
    .value("FIRE", FIRE) // 56
    .value("FIREBASE", FIREBASE) // 56 (FIRE)
    .value("LASTFIRE", LASTFIRE) // 63
    .value("HBRIDGE", HBRIDGE) // 64: Horizontal bridge
    .value("ROADBASE", ROADBASE) // 64 (HBRIDGE)
    .value("VBRIDGE", VBRIDGE) // 65: Vertical bridge
    .value("ROADS", ROADS) // 66
    .value("ROADS2", ROADS2) // 67
    .value("ROADS3", ROADS3) // 68
    .value("ROADS4", ROADS4) // 69
    .value("ROADS5", ROADS5) // 70
    .value("ROADS6", ROADS6) // 71
    .value("ROADS7", ROADS7) // 72
    .value("ROADS8", ROADS8) // 73
    .value("ROADS9", ROADS9) // 74
    .value("ROADS10", ROADS10) // 75
    .value("INTERSECTION", INTERSECTION) // 76
    .value("HROADPOWER", HROADPOWER) // 77
    .value("VROADPOWER", VROADPOWER) // 78
    .value("BRWH", BRWH) // 79
    .value("LTRFBASE", LTRFBASE) // 80: First tile with low traffic
    // tile 81 -- 94 ?
    .value("BRWV", BRWV) // 95
    // tile 96 -- 110 ?
    .value("BRWXXX1", BRWXXX1) // 111
    // tile 96 -- 110 ?
    .value("BRWXXX2", BRWXXX2) // 127
    // tile 96 -- 110 ?
    .value("BRWXXX3", BRWXXX3) // 143
    .value("HTRFBASE", HTRFBASE) // 144: First tile with high traffic
    // tile 145 -- 158 ?
    .value("BRWXXX4", BRWXXX4) // 159
    // tile 160 -- 174 ?
    .value("BRWXXX5", BRWXXX5) // 175
    // tile 176 -- 190 ?
    .value("BRWXXX6", BRWXXX6) // 191
    // tile 192 -- 205 ?
    .value("LASTROAD", LASTROAD) // 206
    .value("BRWXXX7", BRWXXX7) // 207
    // Power lines
    .value("HPOWER", HPOWER) // 208
    .value("VPOWER", VPOWER) // 209
    .value("LHPOWER", LHPOWER) // 210
    .value("LVPOWER", LVPOWER) // 211
    .value("LVPOWER2", LVPOWER2) // 212
    .value("LVPOWER3", LVPOWER3) // 213
    .value("LVPOWER4", LVPOWER4) // 214
    .value("LVPOWER5", LVPOWER5) // 215
    .value("LVPOWER6", LVPOWER6) // 216
    .value("LVPOWER7", LVPOWER7) // 217
    .value("LVPOWER8", LVPOWER8) // 218
    .value("LVPOWER9", LVPOWER9) // 219
    .value("LVPOWER10", LVPOWER10) // 220
    .value("RAILHPOWERV", RAILHPOWERV) // 221: Horizontal rail, vertical power
    .value("RAILVPOWERH", RAILVPOWERH) // 222: Vertical rail, horizontal power
    .value("POWERBASE", POWERBASE) // 208 (HPOWER)
    .value("LASTPOWER", LASTPOWER) // 222 (RAILVPOWERH)
    .value("UNUSED_TRASH6", UNUSED_TRASH6) // 223
    // Rail
    .value("HRAIL", HRAIL) // 224
    .value("VRAIL", VRAIL) // 225
    .value("LHRAIL", LHRAIL) // 226
    .value("LVRAIL", LVRAIL) // 227
    .value("LVRAIL2", LVRAIL2) // 228
    .value("LVRAIL3", LVRAIL3) // 229
    .value("LVRAIL4", LVRAIL4) // 230
    .value("LVRAIL5", LVRAIL5) // 231
    .value("LVRAIL6", LVRAIL6) // 232
    .value("LVRAIL7", LVRAIL7) // 233
    .value("LVRAIL8", LVRAIL8) // 234
    .value("LVRAIL9", LVRAIL9) // 235
    .value("LVRAIL10", LVRAIL10) // 236
    .value("HRAILROAD", HRAILROAD) // 237
    .value("VRAILROAD", VRAILROAD) // 238
    .value("RAILBASE", RAILBASE) // 224 (HRAIL)
    .value("LASTRAIL", LASTRAIL) // 238 (VRAILROAD)
    .value("ROADVPOWERH", ROADVPOWERH) // 239: bogus?
    // Residential zone tiles
    .value("RESBASE", RESBASE) // 240: Empty residential, tiles 240--248
    .value("FREEZ", FREEZ) // 244: center-tile of 3x3 empty residential
    .value("HOUSE", HOUSE) // 249: Single tile houses until 260
    .value("LHTHR", LHTHR) // 249 (HOUSE)
    .value("HHTHR", HHTHR) // 260
    .value("RZB", RZB) // 265: center tile first 3x3 tile residential
    .value("HOSPITALBASE", HOSPITALBASE) // 405: Center of hospital (tiles 405--413)
    .value("HOSPITAL", HOSPITAL) // 409: Center of hospital (tiles 405--413)
    .value("CHURCHBASE", CHURCHBASE) // 414: Center of church (tiles 414--422)
    .value("CHURCH0BASE", CHURCH0BASE) // 414 (CHURCHBASE): numbered alias
    .value("CHURCH", CHURCH) // 418: Center of church (tiles 414--422)
    .value("CHURCH0", CHURCH0) // 418 (CHURCH): numbered alias
    // Commercial zone tiles
    .value("COMBASE", COMBASE) // 423: Empty commercial, tiles 423--431
    // tile 424 -- 426 ?
    .value("COMCLR", COMCLR) // 427
    // tile 428 -- 435 ?
    .value("CZB", CZB) // 436
    // tile 437 -- 608 ?
    .value("COMLAST", COMLAST) // 609
    // tile 610, 611 ?
    // Industrial zone tiles.
    .value("INDBASE", INDBASE) // 612: Top-left tile of empty industrial zone.
    .value("INDCLR", INDCLR) // 616: Center tile of empty industrial zone.
    .value("LASTIND", LASTIND) // 620: Last tile of empty industrial zone.
    // Industrial zone population 0, value 0: 621 -- 629
    .value("IND1", IND1) // 621: Top-left tile of first non-empty industry zone.
    .value("IZB", IZB) // 625: Center tile of first non-empty industry zone.
    // Industrial zone population 1, value 0: 630 -- 638
    // Industrial zone population 2, value 0: 639 -- 647
    .value("IND2", IND2) // 641
    .value("IND3", IND3) // 644
    // Industrial zone population 3, value 0: 648 -- 656
    .value("IND4", IND4) // 649
    .value("IND5", IND5) // 650
    // Industrial zone population 0, value 1: 657 -- 665
    // Industrial zone population 1, value 1: 666 -- 674
    // Industrial zone population 2, value 1: 675 -- 683
    .value("IND6", IND6) // 676
    .value("IND7", IND7) // 677
    // Industrial zone population 3, value 1: 684 -- 692
    .value("IND8", IND8) // 686
    .value("IND9", IND9) // 689
    // Seaport
    .value("PORTBASE", PORTBASE) // 693: Top-left tile of the seaport.
    .value("PORT", PORT) // 698: Center tile of the seaport.
    .value("LASTPORT", LASTPORT) // 708: Last tile of the seaport.
    .value("AIRPORTBASE", AIRPORTBASE) // 709
    // tile 710 ?
    .value("RADAR", RADAR) // 711
    // tile 712 -- 715 ?
    .value("AIRPORT", AIRPORT) // 716
    // tile 717 -- 744 ?
    // Coal power plant (4x4).
    .value("COALBASE", COALBASE) // 745: First tile of coal power plant.
    .value("POWERPLANT", POWERPLANT) // 750: 'Center' tile of coal power plant.
    .value("LASTPOWERPLANT", LASTPOWERPLANT) // 760: Last tile of coal power plant.
    // Fire station (3x3).
    .value("FIRESTBASE", FIRESTBASE) // 761: First tile of fire station.
    .value("FIRESTATION", FIRESTATION) // 765: 'Center tile' of fire station.
    // 769 last tile fire station.
    .value("POLICESTBASE", POLICESTBASE) // 770
    // tile 771 -- 773 ?
    .value("POLICESTATION", POLICESTATION) // 774
    // tile 775 -- 778 ?
    // Stadium (4x4).
    .value("STADIUMBASE", STADIUMBASE) // 779: First tile stadium.
    .value("STADIUM", STADIUM) // 784: 'Center tile' stadium.
    // Last tile stadium 794.
    // tile 785 -- 799 ?
    .value("FULLSTADIUM", FULLSTADIUM) // 800
    // tile 801 -- 810 ?
    // Nuclear power plant (4x4).
    .value("NUCLEARBASE", NUCLEARBASE) // 811: First tile nuclear power plant.
    .value("NUCLEAR", NUCLEAR) // 816: 'Center' tile nuclear power plant.
    .value("LASTZONE", LASTZONE) // 826: Also last tile nuclear power plant.
    .value("LIGHTNINGBOLT", LIGHTNINGBOLT) // 827
    .value("HBRDG0", HBRDG0) // 828
    .value("HBRDG1", HBRDG1) // 829
    .value("HBRDG2", HBRDG2) // 830
    .value("HBRDG3", HBRDG3) // 831
    .value("HBRDG_END", HBRDG_END) // 832
    .value("RADAR0", RADAR0) // 832
    .value("RADAR1", RADAR1) // 833
    .value("RADAR2", RADAR2) // 834
    .value("RADAR3", RADAR3) // 835
    .value("RADAR4", RADAR4) // 836
    .value("RADAR5", RADAR5) // 837
    .value("RADAR6", RADAR6) // 838
    .value("RADAR7", RADAR7) // 839
    .value("FOUNTAIN", FOUNTAIN) // 840
    // tile 841 -- 843: fountain animation.
    .value("INDBASE2", INDBASE2) // 844
    .value("TELEBASE", TELEBASE) // 844 (INDBASE2)
    // tile 845 -- 850 ?
    .value("TELELAST", TELELAST) // 851
    .value("SMOKEBASE", SMOKEBASE) // 852
    // tile 853 -- 859 ?
    .value("TINYEXP", TINYEXP) // 860
    // tile 861 -- 863 ?
    .value("SOMETINYEXP", SOMETINYEXP) // 864
    // tile 865 -- 866 ?
    .value("LASTTINYEXP", LASTTINYEXP) // 867
    // tile 868 -- 882 ?
    .value("TINYEXPLAST", TINYEXPLAST) // 883
    // tile 884 -- 915 ?
    .value("COALSMOKE1", COALSMOKE1) // 916: Chimney animation at coal power plant (2, 0).
    // 919 last animation tile for chimney at coal power plant (2, 0).
    .value("COALSMOKE2", COALSMOKE2) // 920: Chimney animation at coal power plant (3, 0).
    // 923 last animation tile for chimney at coal power plant (3, 0).
    .value("COALSMOKE3", COALSMOKE3) // 924: Chimney animation at coal power plant (2, 1).
    // 927 last animation tile for chimney at coal power plant (2, 1).
    .value("COALSMOKE4", COALSMOKE4) // 928: Chimney animation at coal power plant (3, 1).
    // 931 last animation tile for chimney at coal power plant (3, 1).
    .value("FOOTBALLGAME1", FOOTBALLGAME1) // 932
    // tile 933 -- 939 ?
    .value("FOOTBALLGAME2", FOOTBALLGAME2) // 940
    // tile 941 -- 947 ?
    .value("VBRDG0", VBRDG0) // 948
    .value("VBRDG1", VBRDG1) // 949
    .value("VBRDG2", VBRDG2) // 950
    .value("VBRDG3", VBRDG3) // 951
    .value("NUKESWIRL1", NUKESWIRL1) // 952
    .value("NUKESWIRL2", NUKESWIRL2) // 953
    .value("NUKESWIRL3", NUKESWIRL3) // 954
    .value("NUKESWIRL4", NUKESWIRL4) // 955
    // Tiles 956-959 unused (originally)
    // TILE_COUNT = 960,
    // Extended zones: 956-1019
    .value("CHURCH1BASE", CHURCH1BASE) // 956
    .value("CHURCH1", CHURCH1) // 960
    .value("CHURCH1BASE", CHURCH1BASE) // 956
    .value("CHURCH1", CHURCH1) // 960
    .value("CHURCH2BASE", CHURCH2BASE) // 965
    .value("CHURCH2", CHURCH2) // 969
    .value("CHURCH3BASE", CHURCH3BASE) // 974
    .value("CHURCH3", CHURCH3) // 978
    .value("CHURCH4BASE", CHURCH4BASE) // 983
    .value("CHURCH4", CHURCH4) // 987
    .value("CHURCH5BASE", CHURCH5BASE) // 992
    .value("CHURCH5", CHURCH5) // 996
    .value("CHURCH6BASE", CHURCH6BASE) // 1001
    .value("CHURCH6", CHURCH6) // 1005
    .value("CHURCH7BASE", CHURCH7BASE) // 1010
    .value("CHURCH7", CHURCH7) // 1014
    .value("CHURCH7LAST", CHURCH7LAST) // 1018
    // Tiles 1020-1023 unused
    .value("TILE_COUNT", TILE_COUNT) // 1024
    .value("TILE_INVALID", TILE_INVALID) // -1, Invalid tile (not used in the world map).
    ;

  class_<SimSprite>("SimSprite")
    .property("name", &SimSprite::name)
    .property("type", &SimSprite::type)
    .property("frame", &SimSprite::frame)
    .property("x", &SimSprite::x)
    .property("y", &SimSprite::y)
    .property("width", &SimSprite::width)
    .property("height", &SimSprite::height)
    .property("xOffset", &SimSprite::xOffset)
    .property("yOffset", &SimSprite::yOffset)
    .property("xHot", &SimSprite::xHot)
    .property("yHot", &SimSprite::yHot)
    .property("origX", &SimSprite::origX)
    .property("origY", &SimSprite::origY)
    .property("destX", &SimSprite::destX)
    .property("destY", &SimSprite::destY)
    .property("count", &SimSprite::count)
    .property("soundCount", &SimSprite::soundCount)
    .property("dir", &SimSprite::dir)
    .property("newDir", &SimSprite::newDir)
    .property("step", &SimSprite::step)
    .property("flag", &SimSprite::flag)
    .property("control", &SimSprite::control)
    .property("turn", &SimSprite::turn)
    .property("accel", &SimSprite::accel)
    .property("speed", &SimSprite::speed)
    ;

  class_<Callback>("Callback")
      .function("autoGoto", &Callback::autoGoto, allow_raw_pointers())
      .function("didGenerateMap", &Callback::didGenerateMap, allow_raw_pointers())
      .function("didLoadCity", &Callback::didLoadCity, allow_raw_pointers())
      .function("didLoadScenario", &Callback::didLoadScenario, allow_raw_pointers())
      .function("didLoseGame", &Callback::didLoseGame, allow_raw_pointers())
      .function("didSaveCity", &Callback::didSaveCity, allow_raw_pointers())
      .function("didTool", &Callback::didTool, allow_raw_pointers())
      .function("didWinGame", &Callback::didWinGame, allow_raw_pointers())
      .function("didntLoadCity", &Callback::didntLoadCity, allow_raw_pointers())
      .function("didntSaveCity", &Callback::didntSaveCity, allow_raw_pointers())
      .function("makeSound", &Callback::makeSound, allow_raw_pointers())
      .function("newGame", &Callback::newGame, allow_raw_pointers())
      .function("saveCityAs", &Callback::saveCityAs, allow_raw_pointers())
      .function("sendMessage", &Callback::sendMessage, allow_raw_pointers())
      .function("showBudgetAndWait", &Callback::showBudgetAndWait, allow_raw_pointers())
      .function("showZoneStatus", &Callback::showZoneStatus, allow_raw_pointers())
      .function("simulateRobots", &Callback::simulateRobots, allow_raw_pointers())
      .function("simulateChurch", &Callback::simulateChurch, allow_raw_pointers())
      .function("startEarthquake", &Callback::startEarthquake, allow_raw_pointers())
      .function("startGame", &Callback::startGame, allow_raw_pointers())
      .function("startScenario", &Callback::startScenario, allow_raw_pointers())
      .function("updateBudget", &Callback::updateBudget, allow_raw_pointers())
      .function("updateCityName", &Callback::updateCityName, allow_raw_pointers())
      .function("updateDate", &Callback::updateDate, allow_raw_pointers())
      .function("updateDemand", &Callback::updateDemand, allow_raw_pointers())
      .function("updateEvaluation", &Callback::updateEvaluation, allow_raw_pointers())
      .function("updateFunds", &Callback::updateFunds, allow_raw_pointers())
      .function("updateGameLevel", &Callback::updateGameLevel, allow_raw_pointers())
      .function("updateHistory", &Callback::updateHistory, allow_raw_pointers())
      .function("updateMap", &Callback::updateMap, allow_raw_pointers())
      .function("updateOptions", &Callback::updateOptions, allow_raw_pointers())
      .function("updatePasses", &Callback::updatePasses, allow_raw_pointers())
      .function("updatePaused", &Callback::updatePaused, allow_raw_pointers())
      .function("updateSpeed", &Callback::updateSpeed, allow_raw_pointers())
      .function("updateTaxRate", &Callback::updateTaxRate, allow_raw_pointers())
      ;

  class_<JSCallback, base<Callback>>("JSCallback")
      .constructor<emscripten::val>();
      
  class_<Micropolis>("Micropolis")

    .constructor<>()

    // Simulation Control and Settings
    .function("setCallback", &Micropolis::setCallback, allow_raw_pointers())
    .function("init", &Micropolis::init)
    .function("loadCity", &Micropolis::loadCity)
    .function("simTick", &Micropolis::simTick)
    .function("simUpdate", &Micropolis::simUpdate)
    .function("generateSomeRandomCity", &Micropolis::generateSomeRandomCity)
    .function("getMapAddress", &Micropolis::getMapAddress)
    .function("getMapSize", &Micropolis::getMapSize)
    .function("getMopAddress", &Micropolis::getMopAddress)
    .function("getMopSize", &Micropolis::getMopSize)
    .function("animateTiles", &Micropolis::animateTiles)
    .function("setSpeed", &Micropolis::setSpeed)
    .function("setGameLevel", &Micropolis::setGameLevel)
    .function("setCityName", &Micropolis::setCityName)
    .function("setYear", &Micropolis::setYear)
    .function("pause", &Micropolis::pause)
    .function("resume", &Micropolis::resume)
    .function("setEnableDisasters", &Micropolis::setEnableDisasters)
    .function("setAutoBudget", &Micropolis::setAutoBudget)
    .function("setAutoBulldoze", &Micropolis::setAutoBulldoze)
    .function("setAutoGoto", &Micropolis::setAutoGoto)
    .function("setEnableSound", &Micropolis::setEnableSound)
    .function("setDoAnimation", &Micropolis::setDoAnimation)
    .function("doNewGame", &Micropolis::doNewGame)
    .function("doBudget", &Micropolis::doBudget)
    .function("doScoreCard", &Micropolis::doScoreCard)
    .function("updateFunds", &Micropolis::updateFunds)
    .function("setPasses", &Micropolis::setPasses)
    .function("setCityTax", &Micropolis::setCityTax)

    // Game State and Statistics
    .property("simSpeed", &Micropolis::simSpeed)
    .property("simSpeedMeta", &Micropolis::simSpeedMeta)
    .property("simPaused", &Micropolis::simPaused)
    .property("disasterEvent", &Micropolis::disasterEvent)
    .property("disasterWait", &Micropolis::disasterWait)
    .property("scenario", &Micropolis::scenario)
    .property("heatSteps", &Micropolis::heatSteps)
    .property("heatFlow", &Micropolis::heatFlow)
    .property("heatRule", &Micropolis::heatRule)
    .property("heatWrap", &Micropolis::heatWrap)
    .property("totalFunds", &Micropolis::totalFunds)
    .property("cityPop", &Micropolis::cityPop)
    .property("cityTime", &Micropolis::cityTime)
    .property("cityYear", &Micropolis::cityYear)
    .property("cityMonth", &Micropolis::cityMonth)
    .property("cityYes", &Micropolis::cityYes)
    .property("cityScore", &Micropolis::cityScore)
    .property("cityClass", &Micropolis::cityClass)
    .property("gameLevel", &Micropolis::gameLevel)
    .property("mapSerial", &Micropolis::mapSerial)
    .property("trafficAverage", &Micropolis::trafficAverage)
    .property("pollutionAverage", &Micropolis::pollutionAverage)
    .property("crimeAverage", &Micropolis::crimeAverage)
    .property("landValueAverage", &Micropolis::landValueAverage)
    .property("startingYear", &Micropolis::startingYear)
    .property("generatedCitySeed", &Micropolis::generatedCitySeed)
    .property("cityPopDelta", &Micropolis::cityPopDelta)
    .property("cityAssessedValue", &Micropolis::cityAssessedValue)
    .property("cityScoreDelta", &Micropolis::cityScoreDelta)
    .property("trafficAverage", &Micropolis::trafficAverage)
    .property("pollutionAverage", &Micropolis::pollutionAverage)
    .property("crimeAverage", &Micropolis::crimeAverage)
    .property("totalPop", &Micropolis::totalPop)
    .property("totalZonePop", &Micropolis::totalZonePop)
    .property("hospitalPop", &Micropolis::hospitalPop)
    .property("churchPop", &Micropolis::churchPop)
    .property("stadiumPop", &Micropolis::stadiumPop)
    .property("coalPowerPop", &Micropolis::coalPowerPop)
    .property("nuclearPowerPop", &Micropolis::nuclearPowerPop)

    // Resource Management
    .property("roadTotal", &Micropolis::roadTotal)
    .property("railTotal", &Micropolis::railTotal)
    .property("resPop", &Micropolis::resPop)
    .property("comPop", &Micropolis::comPop)
    .property("indPop", &Micropolis::indPop)
    .property("policeStationPop", &Micropolis::policeStationPop)
    .property("fireStationPop", &Micropolis::fireStationPop)
    .property("seaportPop", &Micropolis::seaportPop)
    .property("airportPop", &Micropolis::airportPop)
    .property("cashFlow", &Micropolis::cashFlow)
    .property("cityTax", &Micropolis::cityTax)
    .property("roadEffect", &Micropolis::roadEffect)
    .property("policeEffect", &Micropolis::policeEffect)
    .property("fireEffect", &Micropolis::fireEffect)

    // User Interface and Preferences
    .property("autoGoto", &Micropolis::autoGoto)
    .property("autoBudget", &Micropolis::autoBudget)
    .property("autoBulldoze", &Micropolis::autoBulldoze)
    .property("enableSound", &Micropolis::enableSound)
    .property("enableDisasters", &Micropolis::enableDisasters)
    .property("doAnimation", &Micropolis::doAnimation)
    .property("doMessages", &Micropolis::doMessages)
    .property("doNotices", &Micropolis::doNotices)

    // Gameplay Mechanics
    .property("cityFileName", &Micropolis::cityFileName)
    .property("cityName", &Micropolis::cityName)
    .function("doTool", &Micropolis::doTool)
    .function("generateMap", &Micropolis::generateMap)
    .function("clearMap", &Micropolis::clearMap)
    //.function("getDemands", &Micropolis::getDemands, allow_raw_pointers()) // TODO: wrap

    // Random Number Generation
    .function("simRandom", &Micropolis::simRandom)
    .function("getRandom", &Micropolis::getRandom)
    .function("getRandom16", &Micropolis::getRandom16)
    .function("getRandom16Signed", &Micropolis::getRandom16Signed)
    .function("getERandom", &Micropolis::getERandom)
    .function("randomlySeedRandom", &Micropolis::randomlySeedRandom)
    .function("seedRandom", &Micropolis::seedRandom)

    // Game State and Data Access
    .function("getTile", &Micropolis::getTile)
    .function("setTile", &Micropolis::setTile)
    .function("setFunds", &Micropolis::setFunds)
    .function("updateMaps", &Micropolis::updateMaps)
    .function("updateGraphs", &Micropolis::updateGraphs)
    .function("updateEvaluation", &Micropolis::updateEvaluation)
    .function("updateBudget", &Micropolis::updateBudget)

    // Disasters
    .function("makeMeltdown", &Micropolis::makeMeltdown)
    .function("makeFireBombs", &Micropolis::makeFireBombs)
    .function("makeEarthquake", &Micropolis::makeEarthquake)
    .function("makeFire", &Micropolis::makeFire)
    .function("makeFlood", &Micropolis::makeFlood)
    .function("setFire", &Micropolis::setFire)
    .function("fireBomb", &Micropolis::fireBomb)

    // City History Arrays
    //.function("getResidentialHistory", &Micropolis::getResidentialHistory, allow_raw_pointers()) // TODO: wrap
    //.function("getCommercialHistory", &Micropolis::getCommercialHistory, allow_raw_pointers()) // TODO: wrap
    //.function("getIndustrialHistory", &Micropolis::getIndustrialHistory, allow_raw_pointers()) // TODO: wrap

    // Events and Callbacks
    .function("sendMessage", &Micropolis::sendMessage)
    .function("makeSound", &Micropolis::makeSound)

    ;

}


////////////////////////////////////////////////////////////////////////
