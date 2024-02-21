/* callback.cpp
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
 * @file callback.cpp
 * @brief Implementation of the Callback interface for Micropolis game
 * engine.
 *
 * This file provides the implementation of the Callback class defined
 * in callback.h. It includes a series of methods that are called by
 * the Micropolis game engine to interact with the user interface.
 * These methods include functionalities like logging actions,
 * updating game states, and responding to user actions. The use of
 * EM_ASM macros indicates direct interaction with JavaScript, typical
 * in a web environment using Emscripten.
 */


////////////////////////////////////////////////////////////////////////


#include "micropolis.h"
#include <emscripten.h>


ConsoleCallback::~ConsoleCallback() {
    EM_ASM_({
        console.log('~ConsoleCallback destructor');
    });
}

void ConsoleCallback::autoGoto(Micropolis *micropolis, emscripten::val callbackVal, int x, int y, std::string message) {
    EM_ASM_({
        console.log('autoGoto:', 'x:', $0, 'y:', $1, 'message:', UTF8ToString($2));
    }, x, y, message.c_str());
}

void ConsoleCallback::didGenerateMap(Micropolis *micropolis, emscripten::val callbackVal, int seed) {
    EM_ASM_({
        console.log('didGenerateMap:', 'seed:', $0);
    }, seed);
}

void ConsoleCallback::didLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) {
    EM_ASM_({
        console.log('didLoadCity:', 'filename:', UTF8ToString($0));
    }, filename.c_str());
}

void ConsoleCallback::didLoadScenario(Micropolis *micropolis, emscripten::val callbackVal, std::string name, std::string fname) {
    EM_ASM_({
        console.log('didLoadScenario:', 'name:', UTF8ToString($0), 'fname:', UTF8ToString($1));
    }, name.c_str(), fname.c_str());
}

void ConsoleCallback::didLoseGame(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM_({
        console.log('didLoseGame');
    });
}

void ConsoleCallback::didSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) {
    EM_ASM_({
        console.log('didSaveCity:', 'filename:', UTF8ToString($0));
    }, filename.c_str());
}

void ConsoleCallback::didTool(Micropolis *micropolis, emscripten::val callbackVal, std::string name, int x, int y) {
    EM_ASM_({
        console.log('didTool:', 'name:', UTF8ToString($0), 'x:', $1, 'y:', $2);
    }, name.c_str(), x, y);
}

void ConsoleCallback::didWinGame(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM_({
        console.log('didWinGame');
    });
}

void ConsoleCallback::didntLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) {
    EM_ASM_({
        console.log('didntLoadCity:', 'filename:', UTF8ToString($0));
    }, filename.c_str());
}

void ConsoleCallback::didntSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) {
    EM_ASM_({
        console.log('didntSaveCity:', 'filename:', UTF8ToString($0));
    }, filename.c_str());
}

void ConsoleCallback::makeSound(Micropolis *micropolis, emscripten::val callbackVal, std::string channel, std::string sound, int x, int y) {
    EM_ASM_({
        console.log('makeSound:', 'channel:', UTF8ToString($0), 'sound:', UTF8ToString($1), 'x:', $2, 'y:', $3);
    }, channel.c_str(), sound.c_str(), x, y);
}

void ConsoleCallback::newGame(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM_({
        console.log('newGame');
    });
}

void ConsoleCallback::saveCityAs(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) {
    EM_ASM_({
        console.log('saveCityAs:', 'filename:', UTF8ToString($0));
    }, filename.c_str());
}

void ConsoleCallback::sendMessage(Micropolis *micropolis, emscripten::val callbackVal, int messageIndex, int x, int y, bool picture, bool important) {
    EM_ASM_({
        console.log('sendMessage:', 'messageIndex:', $0, 'x:', $1, 'y:', $2, 'picture:', $3, 'important:', $4);
    }, messageIndex, x, y, picture, important);
}

void ConsoleCallback::showBudgetAndWait(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM_({
        console.log('showBudgetAndWait');
    });
}

void ConsoleCallback::showZoneStatus(Micropolis *micropolis, emscripten::val callbackVal, int tileCategoryIndex, int populationDensityIndex, int landValueIndex, int crimeRateIndex, int pollutionIndex, int growthRateIndex, int x, int y) {
    EM_ASM_({
        console.log('showZoneStatus:', 'tileCategoryIndex:', $0, 'populationDensityIndex:', $1, 'landValueIndex:', $2, 'crimeRateIndex:', $3, 'pollutionIndex:', $4, 'growthRateIndex:', $5, 'x:', $6, 'y:', $7);
    }, tileCategoryIndex, populationDensityIndex, landValueIndex, crimeRateIndex, pollutionIndex, growthRateIndex, x, y);
}

void ConsoleCallback::simulateRobots(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM_({
        console.log('simulateRobots');
    });
}

void ConsoleCallback::simulateChurch(Micropolis *micropolis, emscripten::val callbackVal, int posX, int posY, int churchNumber) {
    EM_ASM_({
        console.log('simulateChurch:', 'posX:', $0, 'posY:', $1, 'churchNumber:', $2);
    }, posX, posY, churchNumber);
}

void ConsoleCallback::startEarthquake(Micropolis *micropolis, emscripten::val callbackVal, int strength) {
    EM_ASM_({
        console.log('startEarthquake:', 'strength:', $0);
    }, strength);
}

void ConsoleCallback::startGame(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM_({
        console.log('startGame');
    });
}

void ConsoleCallback::startScenario(Micropolis *micropolis, emscripten::val callbackVal, int scenario) {
    EM_ASM_({
        console.log('startScenario:', 'scenario:', $0);
    }, scenario);
}

void ConsoleCallback::updateBudget(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM_({
        console.log('updateBudget');
    });
}

void ConsoleCallback::updateCityName(Micropolis *micropolis, emscripten::val callbackVal, std::string cityName) {
    EM_ASM_({
        console.log('updateCityName:', 'cityName:', UTF8ToString($0));
    }, cityName.c_str());
}

void ConsoleCallback::updateDate(Micropolis *micropolis, emscripten::val callbackVal, int cityYear, int cityMonth) {
    EM_ASM_({
        console.log('updateDate:', 'cityYear:', $0, 'cityMonth:', $1);
    }, cityYear, cityMonth);
}

void ConsoleCallback::updateDemand(Micropolis *micropolis, emscripten::val callbackVal, float r, float c, float i) {
    EM_ASM_({
        console.log('updateDemand:', 'r:', $0, 'c:', $1, 'i:', $2);
    }, r, c, i);
}

void ConsoleCallback::updateEvaluation(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM({
        console.log('updateEvaluation');
    });
}

void ConsoleCallback::updateFunds(Micropolis *micropolis, emscripten::val callbackVal, int totalFunds) {
    EM_ASM_({
        console.log('updateFunds:', 'totalFunds:', $0);
    }, totalFunds);
}

void ConsoleCallback::updateGameLevel(Micropolis *micropolis, emscripten::val callbackVal, int gameLevel) {
    EM_ASM_({
        console.log('updateGameLevel:', 'gameLevel:', $0);
    }, gameLevel);
}

void ConsoleCallback::updateHistory(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM({
        console.log('updateHistory');
    });
}

void ConsoleCallback::updateMap(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM({
        console.log('updateMap');
    });
}

void ConsoleCallback::updateOptions(Micropolis *micropolis, emscripten::val callbackVal) {
    EM_ASM({
        console.log('updateOptions');
    });
}

void ConsoleCallback::updatePasses(Micropolis *micropolis, emscripten::val callbackVal, int passes) {
    EM_ASM_({
        console.log('updatePasses:', 'passes:', $0);
    }, passes);
}

void ConsoleCallback::updatePaused(Micropolis *micropolis, emscripten::val callbackVal, bool simPaused) {
    EM_ASM_({
        console.log('updatePaused:', 'simPaused:', $0);
    }, simPaused);
}

void ConsoleCallback::updateSpeed(Micropolis *micropolis, emscripten::val callbackVal, int speed) {
    EM_ASM_({
        console.log('updateSpeed:', 'speed:', $0);
    }, speed);
}

void ConsoleCallback::updateTaxRate(Micropolis *micropolis, emscripten::val callbackVal, int cityTax) {
    EM_ASM_({
        console.log('updateTaxRate:', 'cityTax:', $0);
    }, cityTax);
}

////////////////////////////////////////////////////////////////////////
