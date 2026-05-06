// src/js_callback.h
#ifndef JS_CALLBACK_H
#define JS_CALLBACK_H

#include <cstdint>
#include <emscripten/val.h>
#include "callback.h"

inline emscripten::val micropolisPointerValue(Micropolis *micropolis) {
    return emscripten::val(reinterpret_cast<uintptr_t>(micropolis));
}

class JSCallback : public Callback {
public:
    explicit JSCallback(emscripten::val jsCallback)
        : Callback(), jsCallback(jsCallback) {}

    // Implement all pure virtual functions from Callback
    void autoGoto(Micropolis *micropolis, emscripten::val callbackVal, int x, int y, std::string message) override {
        jsCallback.call<void>("autoGoto", micropolisPointerValue(micropolis), callbackVal, x, y, message);
    }

    void didGenerateMap(Micropolis *micropolis, emscripten::val callbackVal, int seed) override {
        jsCallback.call<void>("didGenerateMap", micropolisPointerValue(micropolis), callbackVal, seed);
    }

    void didLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didLoadCity", micropolisPointerValue(micropolis), callbackVal, filename);
    }

    void didLoadScenario(Micropolis *micropolis, emscripten::val callbackVals, std::string name, std::string fname) override {
        jsCallback.call<void>("didLoadScenario", micropolisPointerValue(micropolis), callbackVals, name, fname);
    }

    void didLoseGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("didLoseGame", micropolisPointerValue(micropolis), callbackVal);
    }

    void didSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didSaveCity", micropolisPointerValue(micropolis), callbackVal, filename);
    }

    void didTool(Micropolis *micropolis, emscripten::val callbackVal, std::string name, int x, int y) override {
        jsCallback.call<void>("didTool", micropolisPointerValue(micropolis), callbackVal, name, x, y);
    }

    void didWinGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("didWinGame", micropolisPointerValue(micropolis), callbackVal);
    }

    void didntLoadCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didntLoadCity", micropolisPointerValue(micropolis), callbackVal, filename);
    }

    void didntSaveCity(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("didntSaveCity", micropolisPointerValue(micropolis), callbackVal, filename);
    }

    void makeSound(Micropolis *micropolis, emscripten::val callbackVal, std::string channel, std::string sound, int x, int y) override {
        jsCallback.call<void>("makeSound", micropolisPointerValue(micropolis), callbackVal, channel, sound, x, y);
    }

    void newGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("newGame", micropolisPointerValue(micropolis), callbackVal);
    }

    void saveCityAs(Micropolis *micropolis, emscripten::val callbackVal, std::string filename) override {
        jsCallback.call<void>("saveCityAs", micropolisPointerValue(micropolis), callbackVal, filename);
    }

    void sendMessage(Micropolis *micropolis, emscripten::val callbackVal, int messageIndex, int x, int y, bool picture, bool important) override {
        jsCallback.call<void>("sendMessage", micropolisPointerValue(micropolis), callbackVal, messageIndex, x, y, picture, important);
    }

    void showBudgetAndWait(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("showBudgetAndWait", micropolisPointerValue(micropolis), callbackVal);
    }

    void showZoneStatus(Micropolis *micropolis, emscripten::val callbackVal, int tileCategoryIndex, int populationDensityIndex, int landValueIndex, int crimeRateIndex, int pollutionIndex, int growthRateIndex, int x, int y) override {
        jsCallback.call<void>("showZoneStatus", micropolisPointerValue(micropolis), callbackVal, tileCategoryIndex, populationDensityIndex, landValueIndex, crimeRateIndex, pollutionIndex, growthRateIndex, x, y);
    }

    void simulateRobots(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("simulateRobots", micropolisPointerValue(micropolis), callbackVal);
    }

    void simulateChurch(Micropolis *micropolis, emscripten::val callbackVal, int posX, int posY, int churchNumber) override {
        jsCallback.call<void>("simulateChurch", micropolisPointerValue(micropolis), callbackVal, posX, posY, churchNumber);
    }

    void startEarthquake(Micropolis *micropolis, emscripten::val callbackVal, int strength) override {
        jsCallback.call<void>("startEarthquake", micropolisPointerValue(micropolis), callbackVal, strength);
    }

    void startGame(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("startGame", micropolisPointerValue(micropolis), callbackVal);
    }

    void startScenario(Micropolis *micropolis, emscripten::val callbackVal, int scenario) override {
        jsCallback.call<void>("startScenario", micropolisPointerValue(micropolis), callbackVal, scenario);
    }

    void updateBudget(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateBudget", micropolisPointerValue(micropolis), callbackVal);
    }

    void updateCityName(Micropolis *micropolis, emscripten::val callbackVal, std::string cityName) override {
        jsCallback.call<void>("updateCityName", micropolisPointerValue(micropolis), callbackVal, cityName);
    }

    void updateDate(Micropolis *micropolis, emscripten::val callbackVal, int cityYear, int cityMonth) override {
        jsCallback.call<void>("updateDate", micropolisPointerValue(micropolis), callbackVal, cityYear, cityMonth);
    }

    void updateDemand(Micropolis *micropolis, emscripten::val callbackVal, float r, float c, float i) override {
        jsCallback.call<void>("updateDemand", micropolisPointerValue(micropolis), callbackVal, r, c, i);
    }

    void updateEvaluation(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateEvaluation", micropolisPointerValue(micropolis), callbackVal);
    }

    void updateFunds(Micropolis *micropolis, emscripten::val callbackVal, int totalFunds) override {
        jsCallback.call<void>("updateFunds", micropolisPointerValue(micropolis), callbackVal, totalFunds);
    }

    void updateGameLevel(Micropolis *micropolis, emscripten::val callbackVal, int gameLevel) override {
        jsCallback.call<void>("updateGameLevel", micropolisPointerValue(micropolis), callbackVal, gameLevel);
    }

    void updateHistory(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateHistory", micropolisPointerValue(micropolis), callbackVal);
    }

    void updateMap(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateMap", micropolisPointerValue(micropolis), callbackVal);
    }

    void updateOptions(Micropolis *micropolis, emscripten::val callbackVal) override {
        jsCallback.call<void>("updateOptions", micropolisPointerValue(micropolis), callbackVal);
    }

    void updatePasses(Micropolis *micropolis, emscripten::val callbackVal, int passes) override {
        jsCallback.call<void>("updatePasses", micropolisPointerValue(micropolis), callbackVal, passes);
    }

    void updatePaused(Micropolis *micropolis, emscripten::val callbackVal, bool simPaused) override {
        jsCallback.call<void>("updatePaused", micropolisPointerValue(micropolis), callbackVal, simPaused);
    }

    void updateSpeed(Micropolis *micropolis, emscripten::val callbackVal, int speed) override {
        jsCallback.call<void>("updateSpeed", micropolisPointerValue(micropolis), callbackVal, speed);
    }

    void updateTaxRate(Micropolis *micropolis, emscripten::val callbackVal, int cityTax) override {
        jsCallback.call<void>("updateTaxRate", micropolisPointerValue(micropolis), callbackVal, cityTax);
    }

private:
    emscripten::val jsCallback;
};

#endif // JS_CALLBACK_H
