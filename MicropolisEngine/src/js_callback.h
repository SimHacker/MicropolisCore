// src/js_callback.h
#ifndef JS_CALLBACK_H
#define JS_CALLBACK_H

#include <emscripten/val.h>
#include "callback.h"

class JSCallback : public Callback {
public:
    explicit JSCallback(emscripten::val jsCallback)
        : Callback(), jsCallback(jsCallback) {}

    // Implement all pure virtual functions from Callback
    void autoGoto(Micropolis *micropolis, emscripten::val callbackVal, int x, int y, std::string message) override {
        jsCallback.call<void>("autoGoto", emscripten::val(micropolis), callbackVal, x, y, message);
    }

    void didGenerateMap(Micropolis *micropolis, emscripten::val callbackVal, int seed) override {
        jsCallback.call<void>("didGenerateMap", emscripten::val(micropolis), callbackVal, seed);
    }

    void didLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didLoadCity", emscripten::val(micropolis), callbackVal, filename);
    }

    void didLoadScenario(Micropolis *micropolis, emscripten::val callbackVals, std::string name, std::string fname) override {
        jsCallback.call<void>("didLoadScenario", emscripten::val(micropolis), callbackVals, name, fname);
    }

    void didLoseGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("didLoseGame", emscripten::val(micropolis), callbackVal);
    }

    void didSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didSaveCity", emscripten::val(micropolis), callbackVal, filename);
    }

    void didTool(Micropolis *micropolis, emscripten::val callbackVal, std::string name, int x, int y) override {
        jsCallback.call<void>("didTool", emscripten::val(micropolis), callbackVal, name, x, y);
    }

    void didWinGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("didWinGame", emscripten::val(micropolis), callbackVal);
    }

    void didntLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didntLoadCity", emscripten::val(micropolis), callbackVal, filename);
    }

    void didntSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didntSaveCity", emscripten::val(micropolis), callbackVal, filename);
    }

    void makeSound(Micropolis *micropolis, emscripten::val callbackVal, std::string channel, std::string sound, int x, int y) override {
        jsCallback.call<void>("makeSound", emscripten::val(micropolis), callbackVal, channel, sound, x, y);
    }

    void newGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("newGame", emscripten::val(micropolis), callbackVal);
    }

    void saveCityAs(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("saveCityAs", emscripten::val(micropolis), callbackVal, filename);
    }

    void sendMessage(Micropolis *micropolis, emscripten::val callbackVal, int messageIndex, int x, int y, bool picture, bool important) override {
        jsCallback.call<void>("sendMessage", emscripten::val(micropolis), callbackVal, messageIndex, x, y, picture, important);
    }

    void showBudgetAndWait(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("showBudgetAndWait", emscripten::val(micropolis), callbackVal);
    }

    void showZoneStatus(Micropolis *micropolis, emscripten::val callbackVal, int tileCategoryIndex, int populationDensityIndex, int landValueIndex, int crimeRateIndex, int pollutionIndex, int growthRateIndex, int x, int y) override {
        jsCallback.call<void>("showZoneStatus", emscripten::val(micropolis), callbackVal, tileCategoryIndex, populationDensityIndex, landValueIndex, crimeRateIndex, pollutionIndex, growthRateIndex, x, y);
    }

    void simulateRobots(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("simulateRobots", emscripten::val(micropolis), callbackVal);
    }

    void simulateChurch(Micropolis *micropolis, emscripten::val callbackVal, int posX, int posY, int churchNumber) override {
        jsCallback.call<void>("simulateChurch", emscripten::val(micropolis), callbackVal, posX, posY, churchNumber);
    }

    void startEarthquake(Micropolis *micropolis, emscripten::val callbackVal, int strength) override {
        jsCallback.call<void>("startEarthquake", emscripten::val(micropolis), callbackVal, strength);
    }

    void startGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("startGame", emscripten::val(micropolis), callbackVal);
    }

    void startScenario(Micropolis *micropolis, emscripten::val callbackVal, int scenario) override {
        jsCallback.call<void>("startScenario", emscripten::val(micropolis), callbackVal, scenario);
    }

    void updateBudget(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateBudget", emscripten::val(micropolis), callbackVal);
    }

    void updateCityName(Micropolis *micropolis, emscripten::val callbackVal, std::string cityName) override {
        jsCallback.call<void>("updateCityName", emscripten::val(micropolis), callbackVal, cityName);
    }

    void updateDate(Micropolis *micropolis, emscripten::val callbackVal, int cityYear, int cityMonth) override {
        jsCallback.call<void>("updateDate", emscripten::val(micropolis), callbackVal, cityYear, cityMonth);
    }

    void updateDemand(Micropolis *micropolis, emscripten::val callbackVal, float r, float c, float i) override {
        jsCallback.call<void>("updateDemand", emscripten::val(micropolis), callbackVal, r, c, i);
    }

    void updateEvaluation(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateEvaluation", emscripten::val(micropolis), callbackVal);
    }

    void updateFunds(Micropolis *micropolis, emscripten::val callbackVal, int totalFunds) override {
        jsCallback.call<void>("updateFunds", emscripten::val(micropolis), callbackVal, totalFunds);
    }

    void updateGameLevel(Micropolis *micropolis, emscripten::val callbackVal, int gameLevel) override {
        jsCallback.call<void>("updateGameLevel", emscripten::val(micropolis), callbackVal, gameLevel);
    }

    void updateHistory(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateHistory", emscripten::val(micropolis), callbackVal);
    }

    void updateMap(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateMap", emscripten::val(micropolis), callbackVal);
    }

    void updateOptions(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateOptions", emscripten::val(micropolis), callbackVal);
    }

    void updatePasses(Micropolis *micropolis, emscripten::val callbackVal, int passes) override {
        jsCallback.call<void>("updatePasses", emscripten::val(micropolis), callbackVal, passes);
    }

    void updatePaused(Micropolis *micropolis, emscripten::val callbackVal, bool simPaused) override {
        jsCallback.call<void>("updatePaused", emscripten::val(micropolis), callbackVal, simPaused);
    }

    void updateSpeed(Micropolis *micropolis, emscripten::val callbackVal, int speed) override {
        jsCallback.call<void>("updateSpeed", emscripten::val(micropolis), callbackVal, speed);
    }

    void updateTaxRate(Micropolis *micropolis, emscripten::val callbackVal, int cityTax) override {
        jsCallback.call<void>("updateTaxRate", emscripten::val(micropolis), callbackVal, cityTax);
    }

private:
    emscripten::val jsCallback;
};

#endif // JS_CALLBACK_H
