/* micropolis.cpp
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

/** @file micropolis.cpp */

////////////////////////////////////////////////////////////////////////


#include "micropolis.h"


////////////////////////////////////////////////////////////////////////


/**
 * Simulator constructor.
 */
Micropolis::Micropolis() :
        populationDensityMap(0),
        trafficDensityMap(0),
        pollutionDensityMap(0),
        landValueMap(0),
        crimeRateMap(0),
        terrainDensityMap(0),
        tempMap1(0),
        tempMap2(0),
        tempMap3(0),
        powerGridMap(0),
        rateOfGrowthMap(0),
        fireStationMap(0),
        fireStationEffectMap(0),
        policeStationMap(0),
        policeStationEffectMap(0),
        comRateMap(0)
{
    init();
}


/** Simulator destructor. */
Micropolis::~Micropolis()
{
    destroy();
}


/** Initialize simulator variables to a sane default. */
void Micropolis::init()
{


    ////////////////////////////////////////////////////////////////////////
    // allocate.cpp


    // short roadTotal;
    roadTotal = 0;

    // short railTotal;
    railTotal = 0;

    // short firePop;
    firePop = 0;

    // short resPop;
    resPop = 0;

    // short comPop;
    comPop = 0;

    // short indPop;
    indPop = 0;

    // short totalPop;
    totalPop = 0;

    // short totalPopLast;
    totalPopLast = 0;

    // short resZonePop;
    resZonePop = 0;

    // short comZonePop;
    comZonePop = 0;

    // short indZonePop;
    indZonePop = 0;

    // short totalZonePop;
    totalZonePop = 0;

    // short hospitalPop;
    hospitalPop = 0;

    // short churchPop;
    churchPop = 0;

    // short faith;
    faith = 0;

    // short stadiumPop;
    stadiumPop = 0;

    // short policeStationPop;
    policeStationPop = 0;

    // short fireStationPop;
    fireStationPop = 0;

    // short coalPowerPop;
    coalPowerPop = 0;

    // short nuclearPowerPop;
    nuclearPowerPop = 0;

    // short seaportPop;
    seaportPop = 0;

    // short airportPop;
    airportPop = 0;

    // short needHospital;
    needHospital = 0;

    // short needChurch;
    needChurch = 0;

    // short crimeAverage;
    crimeAverage = 0;

    // short pollutionAverage;
    pollutionAverage = 0;

    // short landValueAverage;
    landValueAverage = 0;

    // Quad cityTime;
    cityTime = 0;

    // Quad cityMonth;
    cityMonth = 0;

    // Quad cityYear;
    cityYear = 0;

    // short startingYear;
    startingYear = 0;

    // short *map[WORLD_W];
    memset(map, 0, sizeof(short *) * WORLD_W);

    // short resHist10Max;
    resHist10Max = 0;

    // short resHist120Max;
    resHist120Max = 0;

    // short comHist10Max;
    comHist10Max = 0;

    // short comHist120Max;
    comHist120Max = 0;

    // short indHist10Max;
    indHist10Max = 0;

    // short indHist120Max;
    indHist120Max = 0;

    censusChanged = false;

    // Quad roadSpend;
    roadSpend = 0;

    // Quad policeSpend;
    policeSpend = 0;

    // Quad fireSpend;
    fireSpend = 0;

    // Quad roadFund;
    roadFund = 0;

    // Quad policeFund;
    policeFund = 0;

    // Quad fireFund;
    fireFund = 0;

    roadEffect   = 0;
    policeEffect = 0;
    fireEffect   = 0;

    // Quad taxFund;
    taxFund = 0;

    // short cityTax;
    cityTax = 0;

    // bool taxFlag;
    taxFlag = false;

    populationDensityMap.clear();
    trafficDensityMap.clear();
    pollutionDensityMap.clear();
    landValueMap.clear();
    crimeRateMap.clear();
    powerGridMap.clear();
    terrainDensityMap.clear();
    rateOfGrowthMap.clear();
    fireStationMap.clear();
    fireStationEffectMap.clear();
    policeStationMap.clear();
    policeStationEffectMap.clear();
    comRateMap.clear();

    // unsigned short *mapBase;
    mapBase = NULL;

    // short *resHist;
    resHist = NULL;

    // short *comHist;
    comHist = NULL;

    // short *indHist;
    indHist = NULL;

    // short *moneyHist;
    moneyHist = NULL;

    // short *pollutionHist;
    pollutionHist = NULL;

    // short *crimeHist;
    crimeHist = NULL;

    // short *miscHist;
    miscHist = NULL;


    ////////////////////////////////////////////////////////////////////////
    // animate.cpp


    ////////////////////////////////////////////////////////////////////////
    // budget.cpp


    // float roadPercent;
    roadPercent = (float)0.0;

    // float policePercent;
    policePercent = (float)0.0;

    // float firePercent;
    firePercent = (float)0.0;

    // Quad roadValue;
    roadValue = 0;

    // Quad policeValue;
    policeValue = 0;

    // Quad fireValue;
    fireValue = 0;

    // int mustDrawBudget;
    mustDrawBudget = 0;


    ////////////////////////////////////////////////////////////////////////
    // connect.cpp


    ////////////////////////////////////////////////////////////////////////
    // disasters.cpp


    // short floodCount;
    floodCount = 0;


    ////////////////////////////////////////////////////////////////////////
    // evaluate.cpp


    // short cityYes;
    cityYes = 0;

    // short problemVotes[PROBNUM]; /* these are the votes for each  */
    memset(problemVotes, 0, sizeof(short) * PROBNUM);

    // short problemOrder[CVP_PROBLEM_COMPLAINTS]; /* sorted index to above  */
    memset(problemOrder, 0, sizeof(short) * CVP_PROBLEM_COMPLAINTS);

    // Quad cityPop;
    cityPop = 0;

    // Quad cityPopDelta;
    cityPopDelta = 0;

    // Quad cityAssessedValue;
    cityAssessedValue = 0;

    cityClass = CC_VILLAGE;

    // short cityScore;
    cityScore = 0;

    // short cityScoreDelta;
    cityScoreDelta = 0;

    // short trafficAverage;
    trafficAverage = 0;


    ////////////////////////////////////////////////////////////////////////
    // fileio.cpp


    ////////////////////////////////////////////////////////////////////////
    // generate.cpp


    // int TreeLevel; /* level for tree creation */
    terrainTreeLevel = -1;

    // int LakeLevel; /* level for lake creation */
    terrainLakeLevel = -1;

    // int CurveLevel; /* level for river curviness */
    terrainCurveLevel = -1;

    // int CreateIsland; /* -1 => 10%, 0 => never, 1 => always */
    terrainCreateIsland = -1;


    ////////////////////////////////////////////////////////////////////////
    // graph.cpp


    graph10Max = 0;
    graph120Max = 0;


    ////////////////////////////////////////////////////////////////////////
    // initialize.cpp


    ////////////////////////////////////////////////////////////////////////
    // main.cpp

    // int simLoops;
    simLoops = 0;

    // int simPasses;
    simPasses = 0;

    // int simPass;
    simPass = 0;

    simPaused = false; // Simulation is running

    // int simPausedSpeed;
    simPausedSpeed = 3;

    // int heatSteps;
    heatSteps = 0;

    // int heatFlow;
    heatFlow = -7;

    // int heatRule;
    heatRule = 0;

    // int heatWrap;
    heatWrap = 3;

    // std::string cityFileName;
    cityFileName = "";

    // std::string cityName;
    cityName = "";

    // bool tilesAnimated;
    tilesAnimated = false;

    // bool doAnimaton;
    doAnimation = true;

    // bool doMessages;
    doMessages = true;

    // bool doNotices;
    doNotices = true;

    // short *cellSrc;
    cellSrc = NULL;

    // short *cellDst;
    cellDst = NULL;


    ////////////////////////////////////////////////////////////////////////
    // map.cpp


#if 0

    ////////////////////////////////////////////////////////////////////////
    // Disabled this small map drawing, filtering and overlaying code.
    // Going to re-implement it in the tile engine and Python.


    // int dynamicData[32];
    memset(dynamicData, 0, sizeof(int) * 32);

#endif


    ////////////////////////////////////////////////////////////////////////
    // message.cpp


    // Quad cityPopLast;
    cityPopLast = 0;

    // short categoryLast;
    categoryLast = 0;

    autoGoto = false;


    ////////////////////////////////////////////////////////////////////////
    // power.cpp


    powerStackPointer = 0;

    // Position powerStackXY[POWER_STACK_SIZE];
    for (int i = 0; i < POWER_STACK_SIZE; i++) {
        powerStackXY[i] = Position();
    }


    ////////////////////////////////////////////////////////////////////////
    // random.cpp


    // UQuad nextRandom;
    nextRandom = 1;


    ////////////////////////////////////////////////////////////////////////
    // resource.cpp


    // string HomeDir;
    homeDir = "";

    // string ResourceDir;
    resourceDir = "";

    // Resource *resources;
    resources = NULL;

    // StringTable *stringTables;
    stringTables = NULL;


    ////////////////////////////////////////////////////////////////////////
    // scan.cpp

    // short newMap;
    newMap = 0;

    // short newMapFlags[MAP_TYPE_COUNT];
    memset(newMapFlags, 0, sizeof(short) * MAP_TYPE_COUNT);

    // short cityCenterX;
    cityCenterX = 0;

    // short cityCenterY;
    cityCenterY = 0;

    // short pollutionMaxX;
    pollutionMaxX = 0;

    // short pollutionMaxY;
    pollutionMaxY = 0;

    // short crimeMaxX;
    crimeMaxX = 0;

    // short crimeMaxY;
    crimeMaxY = 0;

    // Quad donDither;
    donDither = 0;


    ////////////////////////////////////////////////////////////////////////
    // simulate.cpp


    valveFlag = false;

    // short crimeRamp;
    crimeRamp = 0;

    // short pollutionRamp;
    pollutionRamp = 0;

    resCap = false; // Do not block residential growth
    comCap = false; // Do not block commercial growth
    indCap = false; // Do not block industrial growth

    // short cashFlow;
    cashFlow = 0;

    // float externalMarket;
    externalMarket = (float)4.0;

    disasterEvent = SC_NONE;

    // short disasterWait;
    disasterWait = 0;

    scoreType = SC_NONE;

    // short scoreWait;
    scoreWait = 0;

    // short poweredZoneCount;
    poweredZoneCount = 0;

    // short unpoweredZoneCount;
    unpoweredZoneCount = 0;

    newPower = false;

    // short cityTaxAverage;
    cityTaxAverage = 0;

    // short simCycle;
    simCycle = 0;

    // short phaseCycle;
    phaseCycle = 0;

    // short speedCycle;
    speedCycle = 0;

    // bool doInitialEval
    doInitialEval = false;

    // int mapSerial;
    mapSerial = 1;

    // short resValve;
    resValve = 0;

    // short comValve;
    comValve = 0;

    // short indValve;
    indValve = 0;


    ////////////////////////////////////////////////////////////////////////
    // sprite.cpp


    //SimSprite *spriteList;
    spriteList = NULL;

    // SimSprite *freeSprites;
    freeSprites = NULL;

    // SimSprite *globalSprites[SPRITE_COUNT];
    memset(globalSprites, 0, sizeof(SimSprite *) * SPRITE_COUNT);

    // int absDist;
    absDist = 0;

    // short spriteCycle;
    spriteCycle = 0;


    ////////////////////////////////////////////////////////////////////////
    // stubs.cpp


    // Quad totalFunds;
    totalFunds = 0;

    autoBulldoze = true;

    autoBudget = true;

    gameLevel = LEVEL_EASY;

    // short initSimLoad;
    initSimLoad = 0;

    scenario = SC_NONE;

    // short simSpeed;
    simSpeed = 0;

    // short simSpeedMeta;
    simSpeedMeta = 0;

    enableSound = false;

    enableDisasters = true;

    evalChanged = false;

    // short blinkFlag;
    blinkFlag = 0;

    // CallbackFunction callbackHook;
    callbackHook = NULL;

    // void *callbackData;
    callbackData = NULL;

    // void *userData;
    userData = NULL;


    ////////////////////////////////////////////////////////////////////////
    //  tool.cpp


    ////////////////////////////////////////////////////////////////////////
    // traffic.cpp


    // short curMapStackPointer;
    curMapStackPointer = 0;

    // Position curMapStackXY[MAX_TRAFFIC_DISTANCE+1];
    for (int i = 0; i < MAX_TRAFFIC_DISTANCE + 1; i++) {
        curMapStackXY[i] = Position();
    }

    // short trafMaxX, trafMaxY;
    trafMaxX = 0;
    trafMaxY = 0;


    ////////////////////////////////////////////////////////////////////////
    // update.cpp


    mustUpdateFunds = false;

    mustUpdateOptions = false;

    // Quad cityTimeLast;
    cityTimeLast = 0;

    // Quad cityYearLast;
    cityYearLast = 0;

    // Quad cityMonthLast;
    cityMonthLast = 0;

    // Quad totalFundsLast;
    totalFundsLast = 0;

    // Quad resLast;
    resLast = 0;

    // Quad comLast;
    comLast = 0;

    // Quad indLast;
    indLast = 0;


    ////////////////////////////////////////////////////////////////////////
    // utilities.cpp


    ////////////////////////////////////////////////////////////////////////
    // zone.cpp


    ////////////////////////////////////////////////////////////////////////

    simInit();

}


void Micropolis::destroy()
{

    destroyMapArrays();

    // TODO: Clean up all other stuff:

}


/**
 * Get version of Micropolis program.
 * @todo Use this function or eliminate it.
 * @return Textual version.
 */
std::string Micropolis::getMicropolisVersion()
{
    return std::string(MICROPOLIS_VERSION);
}

/**
 * Check whether \a dir points to a directory.
 * If not, report an error.
 * @param dir    Directory to search.
 * @param envVar Environment variable controlling searchpath of the directory.
 * @return Directory has been found.
 */
static bool testDirectory(const std::string& dir, const std::string &envVar)
{
    struct stat statbuf;

    if (stat(dir.c_str(), &statbuf) == 0 && S_ISDIR(statbuf.st_mode)) {

        return true;
    }

    fprintf(stderr, "Can't find the directory \"%s\"!\n", dir.c_str());
    fprintf(stderr,
            "The environment variable \"%s\" should name a directory.\n",
            envVar.c_str());

    return false;
}

/** Locate resource directory. */
void Micropolis::environmentInit()
{
    const char *s = getenv("SIMHOME");
    if (s == NULL) {
        s = ".";
    }
    homeDir = s;

    if (testDirectory(homeDir, "$SIMHOME")) {

        resourceDir = homeDir + "/res/";
        if (testDirectory(resourceDir, "$SIMHOME/res")) {

            return; // All ok
        }
    }

    // Failed on $SIMHOME, ".", or the 'res' directory.
    fprintf(stderr,
            "Please check the environment or reinstall Micropolis and try again! Sorry!\n");
    exit(1);
}


/** Initialize for a simulation */
void Micropolis::simInit()
{
    setEnableSound(true); // Enable sound
    mustUpdateOptions = true; // Update options displayed at user
    scenario = SC_NONE;
    startingYear = 1900;
    simPasses = 1;
    simPass = 0;
    setAutoGoto(true); // Enable auto-goto
    setCityTax(7);
    cityTime = 50;
    setEnableDisasters(true); // Enable disasters
    setAutoBulldoze(true); // Enable auto bulldoze
    setAutoBudget(true); // Enable auto-budget
    blinkFlag = 1;
    simSpeed = 3;
    changeEval();
    simPaused = false; // Simulation is running
    simLoops = 0;
    initSimLoad = 2;

    initMapArrays();
    initGraphs();
    initFundingLevel();
    resetMapState();
    resetEditorState();
    clearMap();
    initWillStuff();
    setFunds(5000);
    setGameLevelFunds(LEVEL_EASY);
    setSpeed(0);
    setPasses(1);
}


/**
 * Update ????
 * @todo What is the purpose of this function? (also in relation with
 *       Micropolis::simTick()).
 */
void Micropolis::simUpdate()
{
    //printf("simUpdate\n");
    blinkFlag = ((tickCount() % 60) < 30) ? 1 : -1;

    if (simSpeed && !heatSteps) {
      tilesAnimated = false;
    }

    doUpdateHeads();
    graphDoer();
    updateBudget();
    scoreDoer();
}


/**
 * ????
 * @todo Why is Micropolis::cellSrc not allocated together with all the other
 *       variables?
 * @todo What is the purpose of this function?
 * @todo KILL the define.
 */
void Micropolis::simHeat()
{
    int x, y;
    static int a = 0;
    short *src, *dst;
    int fl = heatFlow;

    const int SRCCOL = WORLD_H + 2;
    const int DSTCOL = WORLD_H;


    if (cellSrc == NULL) {
        cellSrc = (short *)newPtr((WORLD_W + 2) * (WORLD_H + 2) * sizeof (short));
        cellDst = (short *)&map[0][0];
    }

    src = cellSrc + SRCCOL + 1;
    dst = cellDst;

    /*
     * Copy wrapping edges:
     *
     *  0   ff  f0 f1 ... fe ff     f0
     *
     *  1   0f  00 01 ... 0e 0f     00
     *  2   1f  10 11 ... 1e 1f     10
     *      ..  .. ..     .. ..     ..
     *      ef  e0 e1 ... ee ef     e0
     *  h   ff  f0 f1 ... fe ff     f0
     *
     *  h+1 0f  00 01 ... 0e 0f     00
     *
     * wrap value:  effect:
     *  0   no effect
     *  1   copy future=>past, no wrap
     *  2   no copy, wrap edges
     *  3   copy future=>past, wrap edges
     *  4   copy future=>past, same edges
     */

    switch (heatWrap) {
        case 0:
            break;
        case 1:
            for (x = 0; x < WORLD_W; x++) {
                memcpy(src, dst, WORLD_H * sizeof (short));
                src += SRCCOL;
                dst += DSTCOL;
            }
            break;
        case 2:
            for (x = 0; x < WORLD_W; x++) {
                src[-1] = src[WORLD_H - 1];
                src[WORLD_H] = src[0];
                src += SRCCOL;
                dst += DSTCOL;
            }
            memcpy(
                cellSrc,
                cellSrc + (SRCCOL * WORLD_W),
                SRCCOL * sizeof (short));
            memcpy(
                cellSrc + SRCCOL * (WORLD_W + 1),
                cellSrc + SRCCOL,
                SRCCOL * sizeof (short));
            break;
        case 3:
            for (x = 0; x < WORLD_W; x++) {
                memcpy(src, dst, WORLD_H * sizeof (short));
                src[-1] = src[WORLD_H - 1];
                src[WORLD_H] = src[0];
                src += SRCCOL;
                dst += DSTCOL;
            }
            memcpy(
                cellSrc,
                cellSrc + (SRCCOL * WORLD_W),
                SRCCOL * sizeof (short));
            memcpy(
                cellSrc + SRCCOL * (WORLD_W + 1),
                cellSrc + SRCCOL,
                SRCCOL * sizeof (short));
            break;
        case 4:
            src[0] =
                dst[0];
            src[1 + WORLD_H] =
                dst[WORLD_H - 1];
            src[(1 + WORLD_W) * SRCCOL] =
                dst[(WORLD_W - 1) * DSTCOL];
            src[((2 + WORLD_W) * SRCCOL) - 1] =
                dst[(WORLD_W * WORLD_H) - 1];
            for (x = 0; x < WORLD_W; x++) {
                memcpy(src, dst, WORLD_H * sizeof (short));
                src[-1] = src[0];
                src[WORLD_H] =  src[WORLD_H - 1];
                src += SRCCOL;
                dst += DSTCOL;
            }
            memcpy(
                cellSrc + (SRCCOL * (WORLD_W + 1)),
                cellSrc + (SRCCOL * WORLD_W),
                SRCCOL * sizeof (short));
            memcpy(
                cellSrc,
                cellSrc + SRCCOL,
                SRCCOL * sizeof (short));
            break;
        default:
            NOT_REACHED();
            break;
    }


#define CLIPPER_LOOP_BODY(CODE) \
    src = cellSrc; dst = cellDst; \
    for (x = 0; x < WORLD_W;) { \
        short nw, n, ne, w, c, e, sw, s, se; \
        src = cellSrc + (x * SRCCOL); \
        dst = cellDst + (x * DSTCOL); \
        w = src[0]; c = src[SRCCOL]; e = src[2 * SRCCOL]; \
        sw = src[1]; s = src[SRCCOL + 1]; se = src[(2 * SRCCOL) + 1]; \
        for (y = 0; y < WORLD_H; y++) { \
            nw = w; w = sw; sw = src[2]; \
            n = c; c = s; s = src[SRCCOL + 2]; \
            ne = e; e = se; se = src[(2 * SRCCOL) + 2]; \
            { CODE } \
            src++; dst++; \
        } \
        x++; \
        src = cellSrc + ((x + 1) * SRCCOL) - 3; \
        dst = cellDst + ((x + 1) * DSTCOL) - 1; \
        nw = src[1]; n = src[SRCCOL + 1]; ne = src[(2 * SRCCOL) + 1]; \
        w = src[2]; c = src[SRCCOL + 2]; e = src[(2 * SRCCOL) + 2]; \
        for (y = WORLD_H - 1; y >= 0; y--) { \
            sw = w; w = nw; nw = src[0]; \
            s = c; c = n; n = src[SRCCOL]; \
            se = e; e = ne; ne = src[2 * SRCCOL]; \
            { CODE } \
            src--; dst--; \
        } \
        x++; \
    }


    switch (heatRule) {

      case 0:

#define HEAT \
    a += nw + n + ne + w + e + sw + s + se + fl; \
    dst[0] = ((a >> 3) & LOMASK) | ANIMBIT | BURNBIT | BULLBIT; \
    a &= 7;

        CLIPPER_LOOP_BODY(HEAT);
        break;

      case 1:

#define ECOMASK 0x3fc
#define ECO \
    { \
        c -= fl; n -= fl; s -= fl; e -= fl; w -= fl; \
        ne -= fl; nw -= fl; se -= fl; sw -= fl; \
        /* anneal */ \
        int sum = \
            (c&1) + (n&1) + (s&1) + (e&1) + (w&1) + \
            (ne&1) + (nw&1) + (se&1) + (sw&1), cell; \
        if (((sum > 5) || (sum == 4))) { \
            /* brian's brain */ \
            cell = \
                ((c <<1) & (0x3fc)) | \
                (((((c >>1)&3) == 0) && \
                  (((n&2) + (s&2) + (e&2) + (w&2) + \
                    (ne&2) + (nw&2) + (se&2) + (sw&2)) == (2 <<1))      \
                 ) ? 2 : 0) | \
                 1; \
        } else { \
            /* anti-life */ \
            sum = \
                ((n&2) + (s&2) + (e&2) + (w&2) + \
                 (ne&2) + (nw&2) + (se&2) + (sw&2)) >>1; \
            cell = \
                (((c ^ 2) <<1) & ECOMASK) | \
                ((c&2) \
                   ? ((sum != 5) ? 2 : 0) \
                   : (((sum != 5) && (sum != 6)) ? 2 : 0)); \
        } \
        dst[0] = \
            ((fl + cell) & LOMASK) | ANIMBIT | BURNBIT | BULLBIT; \
        c += fl; n += fl; s += fl; e += fl; w += fl; \
        ne += fl; nw += fl; se += fl; sw += fl; \
    }

        CLIPPER_LOOP_BODY(ECO);

        break;

        default:
            NOT_REACHED();
            break;
    }
}


void Micropolis::simLoop(bool doSim)
{
   if (heatSteps) {
       int j;

       for (j = 0; j < heatSteps; j++) {
           simHeat();
       }

       moveObjects();
       simRobots();

       newMap = 1;

   } else {
       if (doSim) {
           simFrame();
       }

       moveObjects();
       simRobots();
   }

   simLoops++;
}


/**
 * Move simulaton forward.
 * @todo What is the purpose of this function? (also in relation with
 *       Micropolis::simUpdate()).
 */
void Micropolis::simTick()
{
    if (simSpeed) {
        for (simPass = 0; simPass < simPasses; simPass++) {
            simLoop(true);
        }
    }
    simUpdate();
}


void Micropolis::simRobots()
{
    callback("simRobots", "");
}


/**
 * Deduct \a dollars from the player funds.
 * @param dollars Amount of money spent.
 */
void Micropolis::spend(int dollars)
{
    setFunds(totalFunds - dollars);
}


/**
 * Set player funds to \a dollars.
 *
 * Modify the player funds, and warn the front-end about the new amount of
 * money.
 * @param dollars New value for the player funds.
 */
void Micropolis::setFunds(int dollars)
{
    totalFunds = dollars;
    updateFunds();
}


/**
 * Get number of ticks.
 * @todo Figure out what a 'tick' is.
 * @bug Unix version looks wrong, \c time.tv_usec should be divided to get
 *      seconds or \c time.tc_sec should be multiplied.
 */
Quad Micropolis::tickCount()
{
#ifdef _WIN32
    return (::GetTickCount() * 60) / 1000;
#else
    struct timeval time;
    gettimeofday(&time, 0);
    return (Quad)((time.tv_sec * 60) + (time.tv_usec * 60) / 1000000);
#endif
}


/**
 * Claim \a size bytes of memory.
 * @param size Number of bytes to claim.
 * @return Pointer to the claimed memory.
 */
Ptr Micropolis::newPtr(int size)
{
    return (Ptr)malloc(size);
}


/**
 * Release claimed memory.
 * @param data Pointer to previously claimed memory.
 */
void Micropolis::freePtr(void *data)
{
    free(data);
}


/** @bug Function is never called. */
void Micropolis::doPlayNewCity()
{
    callback("playNewCity", "");
}


/** @bug Function is never called. */
void Micropolis::doReallyStartGame()
{
    callback("reallyStartGame", "");
}


/** @bug Function is never called. */
void Micropolis::doStartLoad()
{
    callback("startLoad", "");
}


/**
 * Tell the front-end a scenario is started.
 * @param scenario The scenario being started.
 * @see Scenario.
 * @bug Function is never called.
 */
void Micropolis::doStartScenario(int scenario)
{
    callback( "startScenario", std::to_string(scenario));
}


/**
 * Initialize the game.
 * This is called from the scripting language.
 * @todo we seem to have several of these functions.
 */
void Micropolis::initGame()
{
    simPaused = false; // Simulation is running.
    simPausedSpeed = 0;
    simPass = 0;
    simPasses = 1;
    heatSteps = 0; // Disable cellular automata machine.
    setSpeed(0);
}


/**
 * Scripting language independent callback mechanism.
 *
 * This allows Micropolis to send callback messages with
 * a variable number of typed parameters back to the
 * scripting language, while maintining independence from
 * the particular scripting language (or user interface
 * runtime).
 *
 * The name is the name of a message to send.
 * The json is a string that specifies the parameters.
 *
 * @param name   Name of the callback.
 * @param json   json parameters of the callback.
 */
void Micropolis::callback(const std::string &name, const std::string &json)
{
    if (callbackHook == NULL) {
        return;
    }

    (*callbackHook)(this, callbackData, name, json);
}


/**
 * Tell the front-end to show an earthquake to the user (shaking the map for
 * some time).
 */
void Micropolis::doEarthquake(int strength)
{
    makeSound("city", "ExplosionLow"); // Make the sound all over.

    callback("startEarthquake", std::to_string(strength));
}


/** Tell the front-end that the maps are not valid any more */
void Micropolis::invalidateMaps()
{
    mapSerial++;
    callback("update", "map"); // new
}


/**
 * Instruct the front-end to make a sound.
 * @param channel Name of the sound channel, which can effect the
 *                sound (location, volume, spatialization, etc).
 *                Use "city" for city sounds effects, and "interface"
 *                for user interface sounds.
 * @param sound   Name of the sound.
 * @param x       Tile X position of sound, 0 to WORLD_W, or -1 for everywhere.
 * @param y       Tile Y position of sound, 0 to WORLD_H, or -1 for everywhere.
 */
void Micropolis::makeSound(const std::string &channel,
                           const std::string &sound,
                           int x, int y)
{
    if (enableSound) {
        std::string json;
        json += "[\"";
        json += channel; // TODO: escape json string
        json += "\",\"";
        json += sound;
        json += "\",\"";
        json += std::to_string(x);
        json += ",";
        json += std::to_string(y);
        json += "]";

        callback("makeSound", json);
    }
}


/**
 * Get a tile from the map.
 * @param x X coordinate of the position to get, 0 to WORLD_W.
 * @param y Y coordinate of the position to get, 0 to WORLD_H.
 * @return Value of the map at the given position.
 * @note Off-map positions are considered to contain #DIRT.
 */
int Micropolis::getTile(int x, int y)
{
    if (!testBounds(x, y)) {
        return DIRT;
    }

    return map[x][y];
}


/**
 * Set a tile into the map.
 * @param x X coordinate of the position to get, 0 to WORLD_W.
 * @param y Y coordinate of the position to get, 0 to WORLD_H.
 * @param tile the tile value to set.
 * @note Off-map positions are ignored.
 */
void Micropolis::setTile(int x, int y, int tile)
{
    if (!testBounds(x, y)) {
        return;
    }

    map[x][y] = (unsigned short)tile;
}


/**
 * Get the address of the internal buffer containing the map. This is
 * used to enable the tile engine to access the tiles directly.
 * @return Pointer to the start of the world map buffer.
 */
void *Micropolis::getMapBuffer()
{
    return (void *)mapBase;
}


/**
 * Get a value from the power grid map.
 * @param x X coordinate of the position to get, 0 to WORLD_W.
 * @param y Y coordinate of the position to get, 0 to WORLD_H.
 * @return Value of the power grid map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use powerGridMap.worldGet() instead).
 */
int Micropolis::getPowerGrid(int x, int y)
{
    return powerGridMap.worldGet(x, y);
}


/**
 * Set a value in the power grid map.
 * @param x X coordinate of the position to get, 0 to WORLD_W.
 * @param y Y coordinate of the position to get, 0 to WORLD_H.
 * @param power the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use powerGridMap.worldSet() instead).
 */
void Micropolis::setPowerGrid(int x, int y, int power)
{
  powerGridMap.worldSet(x, y, power);
}


/**
 * Get the address of the internal buffer containing the power grid
 * map.  This is used to enable the tile engine to access the power
 * grid map directly.
 * @return Pointer to the start of the power grid map buffer.
 */
void *Micropolis::getPowerGridMapBuffer()
{
    return (void *)powerGridMap.getBase();
}


/**
 * Get a value from the population density map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @return Value of the population density map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use populationDensityMap.worldGet() instead).
 */
int Micropolis::getPopulationDensity(int x, int y)
{
    return populationDensityMap.get(x, y);
}


/**
 * Set a value in the population density map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @param density the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use populationDensityMap.worldSet() instead).
 */
void Micropolis::setPopulationDensity(int x, int y, int density)
{
    populationDensityMap.set(x, y, density);
}


/**
 * Get the address of the internal buffer containing the population
 * density map. This is used to enable the tile engine to access the
 * population density map directly.
 * @return Pointer to the start of the population density map buffer.
 */
void *Micropolis::getPopulationDensityMapBuffer()
{
    return (void *)populationDensityMap.getBase();
}


/**
 * Get a value from the rate of growth map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_8.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_8.
 * @return Value of the rate of growth map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use rateOfGrowthMap.worldGet() instead).
 */
int Micropolis::getRateOfGrowth(int x, int y)
{
    return rateOfGrowthMap.get(x, y);
}


/**
 * Set a value in the rate of growth map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_8.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_8.
 * @param rate the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use rateOfGrowthMap.worldSet() instead).
 */
void Micropolis::setRateOfGrowth(int x, int y, int rate)
{
    rateOfGrowthMap.set(x, y, rate);
}


/**
 * Get the address of the internal buffer containing the rate of
 * growth map.  This is used to enable the tile engine to access the
 * rate of growth map directly.
 * @return Pointer to the start of the rate of growth map buffer.
 */
void *Micropolis::getRateOfGrowthMapBuffer()
{
    return (void *)rateOfGrowthMap.getBase();
}


/**
 * Get a value from the traffic density map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @return Value of the traffic density at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use trafficDensityMap.worldGet() instead).
 */
int Micropolis::getTrafficDensity(int x, int y)
{
    return trafficDensityMap.get(x, y);
}


/**
 * Set a value in the traffic density map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @param density the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use trafficDensityMap.worldSet() instead).
 */
void Micropolis::setTrafficDensity(int x, int y, int density)
{
    trafficDensityMap.set(x, y, density);
}


/**
 * Get the address of the internal buffer containing the traffic
 * density map. This is used to enable the tile engine to access the
 * traffic density map directly.
 * @return Pointer to the start of the traffic density map buffer.
 */
void *Micropolis::getTrafficDensityMapBuffer()
{
    return (void *)trafficDensityMap.getBase();
}


/**
 * Get a value from the pollution density map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @return Value of the rate of pollution density map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use pollutionDensityMap.worldGet() instead).
 */
int Micropolis::getPollutionDensity(int x, int y)
{
    return pollutionDensityMap.get(x, y);
}


/**
 * Set a value in the pollition density map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @param density the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use pollutionDensityMap.worldSet() instead).
 */
void Micropolis::setPollutionDensity(int x, int y, int density)
{
    pollutionDensityMap.set(x, y, density);
}


/**
 * Get the address of the internal buffer containing the pollution
 * density map. This is used to enable the tile engine to access the
 * pollution density map directly.
 * @return Pointer to the start of the pollution density map buffer.
 */
void *Micropolis::getPollutionDensityMapBuffer()
{
    return (void *)pollutionDensityMap.getBase();
}


/**
 * Get a value from the crime rate map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @return Value of the population density map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use crimeRateMap.worldGet() instead).
 */
int Micropolis::getCrimeRate(int x, int y)
{
    return crimeRateMap.get(x, y);
}


/**
 * Set a value in the crime rate map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @param rate the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use crimeRateMap.worldSet() instead).
 */
void Micropolis::setCrimeRate(int x, int y, int rate)
{
    crimeRateMap.set(x, y, rate);
}


/**
 * Get the address of the internal buffer containing the crime rate
 * map. This is used to enable the tile engine to access the crime
 * rate map directly.
 * @return Pointer to the start of the crime rate map buffer.
 */
void *Micropolis::getCrimeRateMapBuffer()
{
    return (void *)crimeRateMap.getBase();
}


/**
 * Get a value from the land value map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @return Value of the land value map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use landValueMap.worldGet() instead).
 */
int Micropolis::getLandValue(int x, int y)
{
    return landValueMap.get(x, y);
}


/**
 * Set a value in the land value map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_2.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_2.
 * @param value the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use landValueMap.worldSet() instead).
 */
void Micropolis::setLandValue(int x, int y, int value)
{
    landValueMap.set(x, y, value);
}


/**
 * Get the address of the internal buffer containing the land value
 * map. This is used to enable the tile engine to access the land
 * value map directly.
 * @return Pointer to the start of the land value map buffer.
 */
void *Micropolis::getLandValueMapBuffer()
{
    return (void *)landValueMap.getBase();
}


/**
 * Get a value from the fire coverage map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_8.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_8.
 * @return Value of the fir coverage map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use fireStationEffectMap.worldGet() instead).
 */
int Micropolis::getFireCoverage(int x, int y)
{
    return fireStationEffectMap.get(x, y);
}


/**
 * Set a value in the fire coverage map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_8.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_8.
 * @param coverage the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use fireStationEffectMap.worldSet() instead).
 */
void Micropolis::setFireCoverage(int x, int y, int coverage)
{
    fireStationEffectMap.set(x, y, coverage);
}


/**
 * Get the address of the internal buffer containing the fire coverage
 * map. This is used to enable the tile engine to access the fire
 * coverage map directly.
 * @return Pointer to the start of the fire coverage map buffer.
 */
void *Micropolis::getFireCoverageMapBuffer()
{
    return (void *)fireStationEffectMap.getBase();
}

/**
 * Get a value from the police coverage map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_8.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_8.
 * @return Value of the fir coverage map at the given position.
 * @note Off-map positions are considered to contain 0.
 * @todo Use world coordinates instead (use policeStationEffectMap.worldGet() instead).
 */
int Micropolis::getPoliceCoverage(int x, int y)
{
    return policeStationEffectMap.get(x, y);
}


/**
 * Set a value in the police coverage map.
 * @param x X coordinate of the position to get, 0 to WORLD_W_8.
 * @param y Y coordinate of the position to get, 0 to WORLD_H_8.
 * @param coverage the value to set.
 * @note Off-map positions are ignored.
 * @todo Use world coordinates instead (use policeStationEffectMap.worldSet() instead).
 */
void Micropolis::setPoliceCoverage(int x, int y, int coverage)
{
    policeStationEffectMap.set(x, y, coverage);
}


/**
 * Get the address of the internal buffer containing the police coverage
 * map. This is used to enable the tile engine to access the police
 * coverage map directly.
 * @return Pointer to the start of the police coverage map buffer.
 */
void *Micropolis::getPoliceCoverageMapBuffer()
{
    return (void *)policeStationEffectMap.getBase();
}


////////////////////////////////////////////////////////////////////////
