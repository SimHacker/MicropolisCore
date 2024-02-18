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

/** @file emscripten.cpp */


////////////////////////////////////////////////////////////////////////


#include <emscripten/bind.h>
#include "micropolis.h"


////////////////////////////////////////////////////////////////////////
// This file uses emscripten's embind to bind C++ classes,
// C structures, functions, enums, and contents into JavaScript,
// so you can even subclass C++ classes in JavaScript,
// for implementing plugins and user interfaces.


using namespace emscripten;


////////////////////////////////////////////////////////////////////////
// position.h
//
// Remember to include this binding code in one of your .cpp files
// that will be compiled with Emscripten, and the -s WASM=1 -s
// MODULARIZE=1 -s EXPORT_NAME="'MyModule'" flags should be passed to
// emcc when building. Replace "MyModule" with the name you want to
// give to your compiled module.
// 
// The enum_, class_, constructor, function, and property functions
// from the emscripten namespace are used to specify how C++
// constructs should be exposed to JavaScript. You can use these to
// control which parts of your code are accessible and how they should
// be used from JavaScript.


EMSCRIPTEN_BINDINGS(position_module) {

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

}


////////////////////////////////////////////////////////////////////////
// tool.h
//
// I've made some assumptions here:
//
// The Micropolis class has been bound earlier in the script or in
// another script. If it has not been, it will need to be bound as
// well.
//
// The types MapValue and MapTile are simple types (like integers or
// floats). If they are complex types, they would need their own
// bindings.
//
// I've only bound public methods for ToolEffects. If there are
// other public methods or properties you want to expose, you would
// need to bind those as well.
//
// The FrontendMessage class is also bound somewhere else. If it
// isn't, you would need to bind that class too.
//
// I'm assuming that the copy constructor and copy assignment
// operator for the Position class are correctly implemented. If
// they aren't, then the Position object may not behave as expected
// in JavaScript.


EMSCRIPTEN_BINDINGS(tool_module) {
  
  enum_<Direction2>("Direction2")
    .value("DIR2_INVALID", DIR2_INVALID)
    .value("DIR2_NORTH", DIR2_NORTH)
    .value("DIR2_NORTH_EAST", DIR2_NORTH_EAST)
    .value("DIR2_EAST", DIR2_EAST)
    .value("DIR2_SOUTH_EAST", DIR2_SOUTH_EAST)
    .value("DIR2_SOUTH", DIR2_SOUTH)
    .value("DIR2_SOUTH_WEST", DIR2_SOUTH_WEST)
    .value("DIR2_WEST", DIR2_WEST)
    .value("DIR2_NORTH_WEST", DIR2_NORTH_WEST)
    .value("DIR2_BEGIN", DIR2_BEGIN)
    .value("DIR2_END", DIR2_END);

  class_<Position>("Position")
    .constructor<>()
    .constructor<int, int>()
    .property("posX", &Position::posX)
    .property("posY", &Position::posY);

  class_<ToolEffects>("ToolEffects")
    .constructor<Micropolis*>()
    .function("getMapValue", select_overload<MapValue(const Position&) const>(&ToolEffects::getMapValue))
    .function("getMapTile", select_overload<MapTile(const Position&) const>(&ToolEffects::getMapTile))
    .function("getCost", &ToolEffects::getCost)
    .function("addCost", &ToolEffects::addCost)
    .function("setMapValue", select_overload<void(const Position&, MapValue)>(&ToolEffects::setMapValue))
    .function("addFrontendMessage", &ToolEffects::addFrontendMessage);

}


////////////////////////////////////////////////////////////////////////
