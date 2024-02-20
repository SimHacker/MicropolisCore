/* callback.h
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
 * @file callback.h
 * @brief Interface for callbacks in the Micropolis game engine.
 *
 * This file defines the Callback class, which serves as an interface
 * for various callbacks used in the Micropolis game engine. These
 * callbacks cover a wide range of functionalities including UI updates,
 * game state changes, sound effects, simulation events, and more. The
 * methods in this class are virtual and intended to be implemented
 * by the game's frontend to interact with the user interface and
 * handle game events.
 */


#ifndef _H_CALLBACK
#define _H_CALLBACK


////////////////////////////////////////////////////////////////////////


class Micropolis;


class Callback {

public:

    virtual ~Callback() {}

    virtual void autoGoto(Micropolis *micropolis, emscripten::val callbackVal, int x, int y, std::string message) = 0;
    virtual void didGenerateMap(Micropolis *micropolis, emscripten::val callbackVal, int seed) = 0;
    virtual void didLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) = 0;
    virtual void didLoadScenario(Micropolis *micropolis, emscripten::val callbackVals, std::string name, std::string fname) = 0;
    virtual void didLoseGame(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void didSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) = 0;
    virtual void didTool(Micropolis *micropolis, emscripten::val callbackVal, std::string name, int x, int y) = 0;
    virtual void didWinGame(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void didntLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) = 0;
    virtual void didntSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) = 0;
    virtual void makeSound(Micropolis *micropolis, emscripten::val callbackVal, std::string channel, std::string sound, int x, int y) = 0;
    virtual void newGame(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void saveCityAs(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) = 0;
    virtual void sendMessage(Micropolis *micropolis, emscripten::val callbackVal, int messageIndex, int x, int y, bool picture, bool important) = 0;
    virtual void showBudgetAndWait(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void showZoneStatus(Micropolis *micropolis, emscripten::val callbackVal, int tileCategoryIndex, int populationDensityIndex, int landValueIndex, int crimeRateIndex, int pollutionIndex, int growthRateIndex, int x, int y) = 0;
    virtual void simulateRobots(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void simulateChurch(Micropolis *micropolis, emscripten::val callbackVal, int posX, int posY, int churchNumber) = 0;
    virtual void startEarthquake(Micropolis *micropolis, emscripten::val callbackVal, int strength) = 0;
    virtual void startGame(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void startScenario(Micropolis *micropolis, emscripten::val callbackVal, int scenario) = 0;
    virtual void updateBudget(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void updateCityName(Micropolis *micropolis, emscripten::val callbackVal, std::string cityName) = 0;
    virtual void updateDate(Micropolis *micropolis, emscripten::val callbackVal, int cityYear, int cityMonth) = 0;
    virtual void updateDemand(Micropolis *micropolis, emscripten::val callbackVal, float r, float c, float i) = 0;
    virtual void updateEvaluation(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void updateFunds(Micropolis *micropolis, emscripten::val callbackVal, int totalFunds) = 0;
    virtual void updateGameLevel(Micropolis *micropolis, emscripten::val callbackVal, int gameLevel) = 0;
    virtual void updateHistory(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void updateMap(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void updateOptions(Micropolis *micropolis, emscripten::val callbackVal) = 0;
    virtual void updatePasses(Micropolis *micropolis, emscripten::val callbackVal, int passes) = 0;
    virtual void updatePaused(Micropolis *micropolis, emscripten::val callbackVal, bool simPaused) = 0;
    virtual void updateSpeed(Micropolis *micropolis, emscripten::val callbackVal, int speed) = 0;
    virtual void updateTaxRate(Micropolis *micropolis, emscripten::val callbackVal, int cityTax) = 0;

};


////////////////////////////////////////////////////////////////////////


#endif
