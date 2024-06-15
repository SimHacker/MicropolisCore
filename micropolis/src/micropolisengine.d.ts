export interface Direction2Value<T extends number> {
  value: T;
}
export type Direction2 = Direction2Value<0>|Direction2Value<1>|Direction2Value<2>|Direction2Value<3>|Direction2Value<4>|Direction2Value<5>|Direction2Value<6>|Direction2Value<7>|Direction2Value<8>;

export interface Position {
  posX: number;
  posY: number;
  move(_0: Direction2): boolean;
  testBounds(): boolean;
  delete(): void;
}

export interface ToolEffects {
  clear(): void;
  modifyWorld(): void;
  modifyIfEnoughFunding(): boolean;
  getMapValue(_0: Position): number;
  getMapTile(_0: Position): number;
  setMapValue(_0: Position, _1: number): void;
  getCost(): number;
  addCost(_0: number): void;
  delete(): void;
}

export interface MapTileBitsValue<T extends number> {
  value: T;
}
export type MapTileBits = MapTileBitsValue<32768>|MapTileBitsValue<16384>|MapTileBitsValue<8192>|MapTileBitsValue<4096>|MapTileBitsValue<2048>|MapTileBitsValue<1024>|MapTileBitsValue<64512>|MapTileBitsValue<1023>|MapTileBitsValue<12288>|MapTileBitsValue<28672>|MapTileBitsValue<24576>;

export interface EditingToolValue<T extends number> {
  value: T;
}
export type EditingTool = EditingToolValue<0>|EditingToolValue<1>|EditingToolValue<2>|EditingToolValue<3>|EditingToolValue<4>|EditingToolValue<5>|EditingToolValue<6>|EditingToolValue<7>|EditingToolValue<8>|EditingToolValue<9>|EditingToolValue<10>|EditingToolValue<11>|EditingToolValue<12>|EditingToolValue<13>|EditingToolValue<14>|EditingToolValue<15>|EditingToolValue<16>|EditingToolValue<17>|EditingToolValue<18>|EditingToolValue<19>|EditingToolValue<20>|EditingToolValue<0>|EditingToolValue<19>;

export interface MapByte1 {
  readonly MAP_BLOCKSIZE: number;
  readonly MAP_W: number;
  readonly MAP_H: number;
  clear(): void;
  fill(_0: number): void;
  set(_0: number, _1: number, _2: number): void;
  get(_0: number, _1: number): number;
  onMap(_0: number, _1: number): boolean;
  worldSet(_0: number, _1: number, _2: number): void;
  worldGet(_0: number, _1: number): number;
  worldOnMap(_0: number, _1: number): boolean;
  getTotalByteSize(): number;
  delete(): void;
}

export interface MapByte2 {
  readonly MAP_BLOCKSIZE: number;
  readonly MAP_W: number;
  readonly MAP_H: number;
  clear(): void;
  fill(_0: number): void;
  set(_0: number, _1: number, _2: number): void;
  get(_0: number, _1: number): number;
  onMap(_0: number, _1: number): boolean;
  worldSet(_0: number, _1: number, _2: number): void;
  worldGet(_0: number, _1: number): number;
  worldOnMap(_0: number, _1: number): boolean;
  getTotalByteSize(): number;
  delete(): void;
}

export interface MapByte4 {
  readonly MAP_BLOCKSIZE: number;
  readonly MAP_W: number;
  readonly MAP_H: number;
  clear(): void;
  fill(_0: number): void;
  set(_0: number, _1: number, _2: number): void;
  get(_0: number, _1: number): number;
  onMap(_0: number, _1: number): boolean;
  worldSet(_0: number, _1: number, _2: number): void;
  worldGet(_0: number, _1: number): number;
  worldOnMap(_0: number, _1: number): boolean;
  getTotalByteSize(): number;
  delete(): void;
}

export interface MapShort8 {
  readonly MAP_BLOCKSIZE: number;
  readonly MAP_W: number;
  readonly MAP_H: number;
  clear(): void;
  fill(_0: number): void;
  set(_0: number, _1: number, _2: number): void;
  get(_0: number, _1: number): number;
  onMap(_0: number, _1: number): boolean;
  worldSet(_0: number, _1: number, _2: number): void;
  worldGet(_0: number, _1: number): number;
  worldOnMap(_0: number, _1: number): boolean;
  getTotalByteSize(): number;
  delete(): void;
}

export interface Stri202Value<T extends number> {
  value: T;
}
export type Stri202 = Stri202Value<0>|Stri202Value<1>|Stri202Value<2>|Stri202Value<3>|Stri202Value<4>|Stri202Value<5>|Stri202Value<6>|Stri202Value<7>|Stri202Value<8>|Stri202Value<9>|Stri202Value<10>|Stri202Value<11>|Stri202Value<12>|Stri202Value<13>|Stri202Value<14>|Stri202Value<15>|Stri202Value<16>|Stri202Value<17>|Stri202Value<18>|Stri202Value<19>;

export interface MessageNumberValue<T extends number> {
  value: T;
}
export type MessageNumber = MessageNumberValue<1>|MessageNumberValue<2>|MessageNumberValue<3>|MessageNumberValue<4>|MessageNumberValue<5>|MessageNumberValue<6>|MessageNumberValue<7>|MessageNumberValue<8>|MessageNumberValue<9>|MessageNumberValue<10>|MessageNumberValue<11>|MessageNumberValue<12>|MessageNumberValue<13>|MessageNumberValue<14>|MessageNumberValue<15>|MessageNumberValue<16>|MessageNumberValue<17>|MessageNumberValue<18>|MessageNumberValue<19>|MessageNumberValue<20>|MessageNumberValue<21>|MessageNumberValue<22>|MessageNumberValue<23>|MessageNumberValue<24>|MessageNumberValue<25>|MessageNumberValue<26>|MessageNumberValue<27>|MessageNumberValue<28>|MessageNumberValue<29>|MessageNumberValue<30>|MessageNumberValue<31>|MessageNumberValue<32>|MessageNumberValue<33>|MessageNumberValue<34>|MessageNumberValue<35>|MessageNumberValue<36>|MessageNumberValue<37>|MessageNumberValue<38>|MessageNumberValue<39>|MessageNumberValue<40>|MessageNumberValue<41>|MessageNumberValue<42>|MessageNumberValue<43>|MessageNumberValue<44>|MessageNumberValue<45>|MessageNumberValue<46>|MessageNumberValue<47>|MessageNumberValue<48>|MessageNumberValue<49>|MessageNumberValue<50>|MessageNumberValue<51>|MessageNumberValue<52>|MessageNumberValue<53>|MessageNumberValue<54>|MessageNumberValue<55>|MessageNumberValue<56>|MessageNumberValue<57>|MessageNumberValue<57>;

export interface HistoryTypeValue<T extends number> {
  value: T;
}
export type HistoryType = HistoryTypeValue<0>|HistoryTypeValue<1>|HistoryTypeValue<2>|HistoryTypeValue<3>|HistoryTypeValue<4>|HistoryTypeValue<5>|HistoryTypeValue<6>;

export interface HistoryScaleValue<T extends number> {
  value: T;
}
export type HistoryScale = HistoryScaleValue<0>|HistoryScaleValue<1>|HistoryScaleValue<2>;

export interface MapTypeValue<T extends number> {
  value: T;
}
export type MapType = MapTypeValue<0>|MapTypeValue<1>|MapTypeValue<2>|MapTypeValue<3>|MapTypeValue<4>|MapTypeValue<5>|MapTypeValue<6>|MapTypeValue<7>|MapTypeValue<8>|MapTypeValue<9>|MapTypeValue<10>|MapTypeValue<11>|MapTypeValue<12>|MapTypeValue<13>|MapTypeValue<14>|MapTypeValue<15>;

export interface SpriteTypeValue<T extends number> {
  value: T;
}
export type SpriteType = SpriteTypeValue<0>|SpriteTypeValue<1>|SpriteTypeValue<2>|SpriteTypeValue<3>|SpriteTypeValue<4>|SpriteTypeValue<5>|SpriteTypeValue<6>|SpriteTypeValue<7>|SpriteTypeValue<8>|SpriteTypeValue<9>;

export interface ConnectTileCommandValue<T extends number> {
  value: T;
}
export type ConnectTileCommand = ConnectTileCommandValue<0>|ConnectTileCommandValue<1>|ConnectTileCommandValue<2>|ConnectTileCommandValue<3>|ConnectTileCommandValue<4>;

export interface ToolResultValue<T extends number> {
  value: T;
}
export type ToolResult = ToolResultValue<-2>|ToolResultValue<-1>|ToolResultValue<0>|ToolResultValue<1>;

export interface ScenarioValue<T extends number> {
  value: T;
}
export type Scenario = ScenarioValue<0>|ScenarioValue<1>|ScenarioValue<2>|ScenarioValue<3>|ScenarioValue<4>|ScenarioValue<5>|ScenarioValue<6>|ScenarioValue<7>|ScenarioValue<8>|ScenarioValue<9>;

export interface ZoneTypeValue<T extends number> {
  value: T;
}
export type ZoneType = ZoneTypeValue<0>|ZoneTypeValue<1>|ZoneTypeValue<2>|ZoneTypeValue<3>;

export interface CityVotingProblemsValue<T extends number> {
  value: T;
}
export type CityVotingProblems = CityVotingProblemsValue<0>|CityVotingProblemsValue<1>|CityVotingProblemsValue<2>|CityVotingProblemsValue<3>|CityVotingProblemsValue<4>|CityVotingProblemsValue<5>|CityVotingProblemsValue<6>|CityVotingProblemsValue<7>|CityVotingProblemsValue<4>|CityVotingProblemsValue<10>;

export interface CityClassValue<T extends number> {
  value: T;
}
export type CityClass = CityClassValue<0>|CityClassValue<1>|CityClassValue<2>|CityClassValue<3>|CityClassValue<4>|CityClassValue<5>|CityClassValue<6>;

export interface GameLevelValue<T extends number> {
  value: T;
}
export type GameLevel = GameLevelValue<0>|GameLevelValue<1>|GameLevelValue<2>|GameLevelValue<3>|GameLevelValue<0>|GameLevelValue<2>;

export interface TilesValue<T extends number> {
  value: T;
}
export type Tiles = TilesValue<0>|TilesValue<2>|TilesValue<3>|TilesValue<4>|TilesValue<5>|TilesValue<20>|TilesValue<2>|TilesValue<20>|TilesValue<21>|TilesValue<21>|TilesValue<36>|TilesValue<37>|TilesValue<38>|TilesValue<39>|TilesValue<39>|TilesValue<40>|TilesValue<41>|TilesValue<42>|TilesValue<43>|TilesValue<44>|TilesValue<47>|TilesValue<48>|TilesValue<51>|TilesValue<52>|TilesValue<53>|TilesValue<54>|TilesValue<55>|TilesValue<56>|TilesValue<56>|TilesValue<63>|TilesValue<64>|TilesValue<64>|TilesValue<65>|TilesValue<66>|TilesValue<67>|TilesValue<68>|TilesValue<69>|TilesValue<70>|TilesValue<71>|TilesValue<72>|TilesValue<73>|TilesValue<74>|TilesValue<75>|TilesValue<76>|TilesValue<77>|TilesValue<78>|TilesValue<79>|TilesValue<80>|TilesValue<95>|TilesValue<111>|TilesValue<127>|TilesValue<143>|TilesValue<144>|TilesValue<159>|TilesValue<175>|TilesValue<191>|TilesValue<206>|TilesValue<207>|TilesValue<208>|TilesValue<209>|TilesValue<210>|TilesValue<211>|TilesValue<212>|TilesValue<213>|TilesValue<214>|TilesValue<215>|TilesValue<216>|TilesValue<217>|TilesValue<218>|TilesValue<219>|TilesValue<220>|TilesValue<221>|TilesValue<222>|TilesValue<208>|TilesValue<222>|TilesValue<223>|TilesValue<224>|TilesValue<225>|TilesValue<226>|TilesValue<227>|TilesValue<228>|TilesValue<229>|TilesValue<230>|TilesValue<231>|TilesValue<232>|TilesValue<233>|TilesValue<234>|TilesValue<235>|TilesValue<236>|TilesValue<237>|TilesValue<238>|TilesValue<224>|TilesValue<238>|TilesValue<239>|TilesValue<240>|TilesValue<244>|TilesValue<249>|TilesValue<249>|TilesValue<260>|TilesValue<265>|TilesValue<405>|TilesValue<409>|TilesValue<414>|TilesValue<414>|TilesValue<418>|TilesValue<418>|TilesValue<423>|TilesValue<427>|TilesValue<436>|TilesValue<609>|TilesValue<612>|TilesValue<616>|TilesValue<620>|TilesValue<621>|TilesValue<625>|TilesValue<641>|TilesValue<644>|TilesValue<649>|TilesValue<650>|TilesValue<676>|TilesValue<677>|TilesValue<686>|TilesValue<689>|TilesValue<693>|TilesValue<698>|TilesValue<708>|TilesValue<709>|TilesValue<711>|TilesValue<716>|TilesValue<745>|TilesValue<750>|TilesValue<760>|TilesValue<761>|TilesValue<765>|TilesValue<770>|TilesValue<774>|TilesValue<779>|TilesValue<784>|TilesValue<800>|TilesValue<811>|TilesValue<816>|TilesValue<826>|TilesValue<827>|TilesValue<828>|TilesValue<829>|TilesValue<830>|TilesValue<831>|TilesValue<832>|TilesValue<832>|TilesValue<833>|TilesValue<834>|TilesValue<835>|TilesValue<836>|TilesValue<837>|TilesValue<838>|TilesValue<839>|TilesValue<840>|TilesValue<844>|TilesValue<844>|TilesValue<851>|TilesValue<852>|TilesValue<860>|TilesValue<864>|TilesValue<867>|TilesValue<883>|TilesValue<916>|TilesValue<920>|TilesValue<924>|TilesValue<928>|TilesValue<932>|TilesValue<940>|TilesValue<948>|TilesValue<949>|TilesValue<950>|TilesValue<951>|TilesValue<952>|TilesValue<953>|TilesValue<954>|TilesValue<955>|TilesValue<956>|TilesValue<960>|TilesValue<956>|TilesValue<960>|TilesValue<965>|TilesValue<969>|TilesValue<974>|TilesValue<978>|TilesValue<983>|TilesValue<987>|TilesValue<992>|TilesValue<996>|TilesValue<1001>|TilesValue<1005>|TilesValue<1010>|TilesValue<1014>|TilesValue<1018>|TilesValue<1024>|TilesValue<-1>;

export interface SimSprite {
  type: number;
  frame: number;
  x: number;
  y: number;
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  xHot: number;
  yHot: number;
  origX: number;
  origY: number;
  destX: number;
  destY: number;
  count: number;
  soundCount: number;
  dir: number;
  newDir: number;
  step: number;
  flag: number;
  control: number;
  turn: number;
  accel: number;
  speed: number;
  name: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
  delete(): void;
}

export interface Callback {
  autoGoto(_0: Micropolis, _1: any, _2: number, _3: number, _4: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  didGenerateMap(_0: Micropolis, _1: any, _2: number): void;
  didLoadCity(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  didLoadScenario(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _3: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  didLoseGame(_0: Micropolis, _1: any): void;
  didSaveCity(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  didTool(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _3: number, _4: number): void;
  didWinGame(_0: Micropolis, _1: any): void;
  didntLoadCity(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  didntSaveCity(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  makeSound(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _3: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _4: number, _5: number): void;
  newGame(_0: Micropolis, _1: any): void;
  saveCityAs(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  sendMessage(_0: Micropolis, _1: any, _2: number, _3: number, _4: number, _5: boolean, _6: boolean): void;
  showBudgetAndWait(_0: Micropolis, _1: any): void;
  showZoneStatus(_0: Micropolis, _1: any, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number): void;
  simulateRobots(_0: Micropolis, _1: any): void;
  simulateChurch(_0: Micropolis, _1: any, _2: number, _3: number, _4: number): void;
  startEarthquake(_0: Micropolis, _1: any, _2: number): void;
  startGame(_0: Micropolis, _1: any): void;
  startScenario(_0: Micropolis, _1: any, _2: number): void;
  updateBudget(_0: Micropolis, _1: any): void;
  updateCityName(_0: Micropolis, _1: any, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  updateDate(_0: Micropolis, _1: any, _2: number, _3: number): void;
  updateDemand(_0: Micropolis, _1: any, _2: number, _3: number, _4: number): void;
  updateEvaluation(_0: Micropolis, _1: any): void;
  updateFunds(_0: Micropolis, _1: any, _2: number): void;
  updateGameLevel(_0: Micropolis, _1: any, _2: number): void;
  updateHistory(_0: Micropolis, _1: any): void;
  updateMap(_0: Micropolis, _1: any): void;
  updateOptions(_0: Micropolis, _1: any): void;
  updatePasses(_0: Micropolis, _1: any, _2: number): void;
  updatePaused(_0: Micropolis, _1: any, _2: boolean): void;
  updateSpeed(_0: Micropolis, _1: any, _2: number): void;
  updateTaxRate(_0: Micropolis, _1: any, _2: number): void;
  delete(): void;
}

export interface JSCallback extends Callback {
  delete(): void;
}

export interface Micropolis {
  disasterEvent: Scenario;
  scenario: Scenario;
  cityClass: CityClass;
  gameLevel: GameLevel;
  simPaused: boolean;
  autoGoto: boolean;
  autoBudget: boolean;
  autoBulldoze: boolean;
  enableSound: boolean;
  enableDisasters: boolean;
  doAnimation: boolean;
  doMessages: boolean;
  doNotices: boolean;
  simSpeed: number;
  simSpeedMeta: number;
  disasterWait: number;
  cityYes: number;
  cityScore: number;
  trafficAverage: number;
  pollutionAverage: number;
  crimeAverage: number;
  landValueAverage: number;
  startingYear: number;
  cityScoreDelta: number;
  trafficAverage: number;
  pollutionAverage: number;
  crimeAverage: number;
  totalPop: number;
  totalZonePop: number;
  hospitalPop: number;
  churchPop: number;
  stadiumPop: number;
  coalPowerPop: number;
  nuclearPowerPop: number;
  roadTotal: number;
  railTotal: number;
  resPop: number;
  comPop: number;
  indPop: number;
  policeStationPop: number;
  fireStationPop: number;
  seaportPop: number;
  airportPop: number;
  cashFlow: number;
  cityTax: number;
  heatSteps: number;
  heatFlow: number;
  heatRule: number;
  heatWrap: number;
  mapSerial: number;
  generatedCitySeed: number;
  totalFunds: number;
  cityPop: number;
  cityTime: number;
  cityYear: number;
  cityMonth: number;
  cityPopDelta: number;
  cityAssessedValue: number;
  roadEffect: number;
  policeEffect: number;
  fireEffect: number;
  cityFileName: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
  cityName: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
  init(): void;
  simTick(): void;
  simUpdate(): void;
  generateSomeRandomCity(): void;
  animateTiles(): void;
  setGameLevel(_0: GameLevel): void;
  pause(): void;
  resume(): void;
  doNewGame(): void;
  doBudget(): void;
  doScoreCard(): void;
  updateFunds(): void;
  clearMap(): void;
  randomlySeedRandom(): void;
  updateMaps(): void;
  updateGraphs(): void;
  updateEvaluation(): void;
  updateBudget(): void;
  makeMeltdown(): void;
  makeFireBombs(): void;
  makeEarthquake(): void;
  makeFire(): void;
  makeFlood(): void;
  setFire(): void;
  fireBomb(): void;
  setEnableDisasters(_0: boolean): void;
  setAutoBudget(_0: boolean): void;
  setAutoBulldoze(_0: boolean): void;
  setAutoGoto(_0: boolean): void;
  setEnableSound(_0: boolean): void;
  setDoAnimation(_0: boolean): void;
  setSpeed(_0: number): void;
  setCityTax(_0: number): void;
  doTool(_0: EditingTool, _1: number, _2: number): ToolResult;
  getRandom(_0: number): number;
  getERandom(_0: number): number;
  sendMessage(_0: number, _1: number, _2: number, _3: boolean, _4: boolean): void;
  setYear(_0: number): void;
  setPasses(_0: number): void;
  generateMap(_0: number): void;
  simRandom(): number;
  getRandom16(): number;
  getRandom16Signed(): number;
  seedRandom(_0: number): void;
  getTile(_0: number, _1: number): number;
  setTile(_0: number, _1: number, _2: number): void;
  setFunds(_0: number): void;
  getMapAddress(): number;
  getMapSize(): number;
  loadCity(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): boolean;
  setCityName(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  makeSound(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _2: number, _3: number): void;
  setCallback(_0: Callback, _1: any): void;
  delete(): void;
}

export interface MainModule {
  Direction2: {INVALID: Direction2Value<0>, NORTH: Direction2Value<1>, NORTH_EAST: Direction2Value<2>, EAST: Direction2Value<3>, SOUTH_EAST: Direction2Value<4>, SOUTH: Direction2Value<5>, SOUTH_WEST: Direction2Value<6>, WEST: Direction2Value<7>, NORTH_WEST: Direction2Value<8>};
  Position: {new(): Position; new(_0: number, _1: number): Position};
  increment90(_0: Direction2): Direction2;
  rotate90(_0: Direction2): Direction2;
  rotate180(_0: Direction2): Direction2;
  ToolEffects: {};
  MapTileBits: {PWRBIT: MapTileBitsValue<32768>, CONDBIT: MapTileBitsValue<16384>, BURNBIT: MapTileBitsValue<8192>, BULLBIT: MapTileBitsValue<4096>, ANIMBIT: MapTileBitsValue<2048>, ZONEBIT: MapTileBitsValue<1024>, ALLBITS: MapTileBitsValue<64512>, LOMASK: MapTileBitsValue<1023>, BLBNBIT: MapTileBitsValue<12288>, BLBNCNBIT: MapTileBitsValue<28672>, BNCNBIT: MapTileBitsValue<24576>};
  EditingTool: {TOOL_RESIDENTIAL: EditingToolValue<0>, TOOL_COMMERCIAL: EditingToolValue<1>, TOOL_INDUSTRIAL: EditingToolValue<2>, TOOL_FIRESTATION: EditingToolValue<3>, TOOL_POLICESTATION: EditingToolValue<4>, TOOL_QUERY: EditingToolValue<5>, TOOL_WIRE: EditingToolValue<6>, TOOL_BULLDOZER: EditingToolValue<7>, TOOL_RAILROAD: EditingToolValue<8>, TOOL_ROAD: EditingToolValue<9>, TOOL_STADIUM: EditingToolValue<10>, TOOL_PARK: EditingToolValue<11>, TOOL_SEAPORT: EditingToolValue<12>, TOOL_COALPOWER: EditingToolValue<13>, TOOL_NUCLEARPOWER: EditingToolValue<14>, TOOL_AIRPORT: EditingToolValue<15>, TOOL_NETWORK: EditingToolValue<16>, TOOL_WATER: EditingToolValue<17>, TOOL_LAND: EditingToolValue<18>, TOOL_FOREST: EditingToolValue<19>, TOOL_COUNT: EditingToolValue<20>, TOOL_FIRST: EditingToolValue<0>, TOOL_LAST: EditingToolValue<19>};
  MapByte1: {new(_0: number): MapByte1};
  MapByte2: {new(_0: number): MapByte2};
  MapByte4: {new(_0: number): MapByte4};
  MapShort8: {new(_0: number): MapShort8};
  Stri202: {STR202_POPULATIONDENSITY_LOW: Stri202Value<0>, STR202_POPULATIONDENSITY_MEDIUM: Stri202Value<1>, STR202_POPULATIONDENSITY_HIGH: Stri202Value<2>, STR202_POPULATIONDENSITY_VERYHIGH: Stri202Value<3>, STR202_LANDVALUE_SLUM: Stri202Value<4>, STR202_LANDVALUE_LOWER_CLASS: Stri202Value<5>, STR202_LANDVALUE_MIDDLE_CLASS: Stri202Value<6>, STR202_LANDVALUE_HIGH_CLASS: Stri202Value<7>, STR202_CRIME_NONE: Stri202Value<8>, STR202_CRIME_LIGHT: Stri202Value<9>, STR202_CRIME_MODERATE: Stri202Value<10>, STR202_CRIME_DANGEROUS: Stri202Value<11>, STR202_POLLUTION_NONE: Stri202Value<12>, STR202_POLLUTION_MODERATE: Stri202Value<13>, STR202_POLLUTION_HEAVY: Stri202Value<14>, STR202_POLLUTION_VERY_HEAVY: Stri202Value<15>, STR202_GROWRATE_DECLINING: Stri202Value<16>, STR202_GROWRATE_STABLE: Stri202Value<17>, STR202_GROWRATE_SLOWGROWTH: Stri202Value<18>, STR202_GROWRATE_FASTGROWTH: Stri202Value<19>};
  MessageNumber: {MESSAGE_NEED_MORE_RESIDENTIAL: MessageNumberValue<1>, MESSAGE_NEED_MORE_COMMERCIAL: MessageNumberValue<2>, MESSAGE_NEED_MORE_INDUSTRIAL: MessageNumberValue<3>, MESSAGE_NEED_MORE_ROADS: MessageNumberValue<4>, MESSAGE_NEED_MORE_RAILS: MessageNumberValue<5>, MESSAGE_NEED_ELECTRICITY: MessageNumberValue<6>, MESSAGE_NEED_STADIUM: MessageNumberValue<7>, MESSAGE_NEED_SEAPORT: MessageNumberValue<8>, MESSAGE_NEED_AIRPORT: MessageNumberValue<9>, MESSAGE_HIGH_POLLUTION: MessageNumberValue<10>, MESSAGE_HIGH_CRIME: MessageNumberValue<11>, MESSAGE_TRAFFIC_JAMS: MessageNumberValue<12>, MESSAGE_NEED_FIRE_STATION: MessageNumberValue<13>, MESSAGE_NEED_POLICE_STATION: MessageNumberValue<14>, MESSAGE_BLACKOUTS_REPORTED: MessageNumberValue<15>, MESSAGE_TAX_TOO_HIGH: MessageNumberValue<16>, MESSAGE_ROAD_NEEDS_FUNDING: MessageNumberValue<17>, MESSAGE_FIRE_STATION_NEEDS_FUNDING: MessageNumberValue<18>, MESSAGE_POLICE_NEEDS_FUNDING: MessageNumberValue<19>, MESSAGE_FIRE_REPORTED: MessageNumberValue<20>, MESSAGE_MONSTER_SIGHTED: MessageNumberValue<21>, MESSAGE_TORNADO_SIGHTED: MessageNumberValue<22>, MESSAGE_EARTHQUAKE: MessageNumberValue<23>, MESSAGE_PLANE_CRASHED: MessageNumberValue<24>, MESSAGE_SHIP_CRASHED: MessageNumberValue<25>, MESSAGE_TRAIN_CRASHED: MessageNumberValue<26>, MESSAGE_HELICOPTER_CRASHED: MessageNumberValue<27>, MESSAGE_HIGH_UNEMPLOYMENT: MessageNumberValue<28>, MESSAGE_NO_MONEY: MessageNumberValue<29>, MESSAGE_FIREBOMBING: MessageNumberValue<30>, MESSAGE_NEED_MORE_PARKS: MessageNumberValue<31>, MESSAGE_EXPLOSION_REPORTED: MessageNumberValue<32>, MESSAGE_NOT_ENOUGH_FUNDS: MessageNumberValue<33>, MESSAGE_BULLDOZE_AREA_FIRST: MessageNumberValue<34>, MESSAGE_REACHED_TOWN: MessageNumberValue<35>, MESSAGE_REACHED_CITY: MessageNumberValue<36>, MESSAGE_REACHED_CAPITAL: MessageNumberValue<37>, MESSAGE_REACHED_METROPOLIS: MessageNumberValue<38>, MESSAGE_REACHED_MEGALOPOLIS: MessageNumberValue<39>, MESSAGE_NOT_ENOUGH_POWER: MessageNumberValue<40>, MESSAGE_HEAVY_TRAFFIC: MessageNumberValue<41>, MESSAGE_FLOODING_REPORTED: MessageNumberValue<42>, MESSAGE_NUCLEAR_MELTDOWN: MessageNumberValue<43>, MESSAGE_RIOTS_REPORTED: MessageNumberValue<44>, MESSAGE_STARTED_NEW_CITY: MessageNumberValue<45>, MESSAGE_LOADED_SAVED_CITY: MessageNumberValue<46>, MESSAGE_SCENARIO_WON: MessageNumberValue<47>, MESSAGE_SCENARIO_LOST: MessageNumberValue<48>, MESSAGE_ABOUT_MICROPOLIS: MessageNumberValue<49>, MESSAGE_SCENARIO_DULLSVILLE: MessageNumberValue<50>, MESSAGE_SCENARIO_SAN_FRANCISCO: MessageNumberValue<51>, MESSAGE_SCENARIO_HAMBURG: MessageNumberValue<52>, MESSAGE_SCENARIO_BERN: MessageNumberValue<53>, MESSAGE_SCENARIO_TOKYO: MessageNumberValue<54>, MESSAGE_SCENARIO_DETROIT: MessageNumberValue<55>, MESSAGE_SCENARIO_BOSTON: MessageNumberValue<56>, MESSAGE_SCENARIO_RIO_DE_JANEIRO: MessageNumberValue<57>, MESSAGE_LAST: MessageNumberValue<57>};
  HistoryType: {HISTORY_TYPE_RES: HistoryTypeValue<0>, HISTORY_TYPE_COM: HistoryTypeValue<1>, HISTORY_TYPE_IND: HistoryTypeValue<2>, HISTORY_TYPE_MONEY: HistoryTypeValue<3>, HISTORY_TYPE_CRIME: HistoryTypeValue<4>, HISTORY_TYPE_POLLUTION: HistoryTypeValue<5>, HISTORY_TYPE_COUNT: HistoryTypeValue<6>};
  HistoryScale: {HISTORY_SCALE_SHORT: HistoryScaleValue<0>, HISTORY_SCALE_LONG: HistoryScaleValue<1>, HISTORY_SCALE_COUNT: HistoryScaleValue<2>};
  MapType: {MAP_TYPE_ALL: MapTypeValue<0>, MAP_TYPE_RES: MapTypeValue<1>, MAP_TYPE_COM: MapTypeValue<2>, MAP_TYPE_IND: MapTypeValue<3>, MAP_TYPE_POWER: MapTypeValue<4>, MAP_TYPE_ROAD: MapTypeValue<5>, MAP_TYPE_POPULATION_DENSITY: MapTypeValue<6>, MAP_TYPE_RATE_OF_GROWTH: MapTypeValue<7>, MAP_TYPE_TRAFFIC_DENSITY: MapTypeValue<8>, MAP_TYPE_POLLUTION: MapTypeValue<9>, MAP_TYPE_CRIME: MapTypeValue<10>, MAP_TYPE_LAND_VALUE: MapTypeValue<11>, MAP_TYPE_FIRE_RADIUS: MapTypeValue<12>, MAP_TYPE_POLICE_RADIUS: MapTypeValue<13>, MAP_TYPE_DYNAMIC: MapTypeValue<14>, MAP_TYPE_COUNT: MapTypeValue<15>};
  SpriteType: {SPRITE_NOTUSED: SpriteTypeValue<0>, SPRITE_TRAIN: SpriteTypeValue<1>, SPRITE_HELICOPTER: SpriteTypeValue<2>, SPRITE_AIRPLANE: SpriteTypeValue<3>, SPRITE_SHIP: SpriteTypeValue<4>, SPRITE_MONSTER: SpriteTypeValue<5>, SPRITE_TORNADO: SpriteTypeValue<6>, SPRITE_EXPLOSION: SpriteTypeValue<7>, SPRITE_BUS: SpriteTypeValue<8>, SPRITE_COUNT: SpriteTypeValue<9>};
  ConnectTileCommand: {CONNECT_TILE_FIX: ConnectTileCommandValue<0>, CONNECT_TILE_BULLDOZE: ConnectTileCommandValue<1>, CONNECT_TILE_ROAD: ConnectTileCommandValue<2>, CONNECT_TILE_RAILROAD: ConnectTileCommandValue<3>, CONNECT_TILE_WIRE: ConnectTileCommandValue<4>};
  ToolResult: {TOOLRESULT_NO_MONEY: ToolResultValue<-2>, TOOLRESULT_NEED_BULLDOZE: ToolResultValue<-1>, TOOLRESULT_FAILED: ToolResultValue<0>, TOOLRESULT_OK: ToolResultValue<1>};
  Scenario: {SC_NONE: ScenarioValue<0>, SC_DULLSVILLE: ScenarioValue<1>, SC_SAN_FRANCISCO: ScenarioValue<2>, SC_HAMBURG: ScenarioValue<3>, SC_BERN: ScenarioValue<4>, SC_TOKYO: ScenarioValue<5>, SC_DETROIT: ScenarioValue<6>, SC_BOSTON: ScenarioValue<7>, SC_RIO: ScenarioValue<8>, SC_COUNT: ScenarioValue<9>};
  ZoneType: {ZT_COMMERCIAL: ZoneTypeValue<0>, ZT_INDUSTRIAL: ZoneTypeValue<1>, ZT_RESIDENTIAL: ZoneTypeValue<2>, ZT_NUM_DESTINATIONS: ZoneTypeValue<3>};
  CityVotingProblems: {CVP_CRIME: CityVotingProblemsValue<0>, CVP_POLLUTION: CityVotingProblemsValue<1>, CVP_HOUSING: CityVotingProblemsValue<2>, CVP_TAXES: CityVotingProblemsValue<3>, CVP_TRAFFIC: CityVotingProblemsValue<4>, CVP_UNEMPLOYMENT: CityVotingProblemsValue<5>, CVP_FIRE: CityVotingProblemsValue<6>, CVP_NUMPROBLEMS: CityVotingProblemsValue<7>, CVP_PROBLEM_COMPLAINTS: CityVotingProblemsValue<4>, PROBNUM: CityVotingProblemsValue<10>};
  CityClass: {CC_VILLAGE: CityClassValue<0>, CC_TOWN: CityClassValue<1>, CC_CITY: CityClassValue<2>, CC_CAPITAL: CityClassValue<3>, CC_METROPOLIS: CityClassValue<4>, CC_MEGALOPOLIS: CityClassValue<5>, CC_NUM_CITIES: CityClassValue<6>};
  GameLevel: {LEVEL_EASY: GameLevelValue<0>, LEVEL_MEDIUM: GameLevelValue<1>, LEVEL_HARD: GameLevelValue<2>, LEVEL_COUNT: GameLevelValue<3>, LEVEL_FIRST: GameLevelValue<0>, LEVEL_LAST: GameLevelValue<2>};
  Tiles: {DIRT: TilesValue<0>, RIVER: TilesValue<2>, REDGE: TilesValue<3>, CHANNEL: TilesValue<4>, FIRSTRIVEDGE: TilesValue<5>, LASTRIVEDGE: TilesValue<20>, WATER_LOW: TilesValue<2>, WATER_HIGH: TilesValue<20>, TREEBASE: TilesValue<21>, WOODS_LOW: TilesValue<21>, LASTTREE: TilesValue<36>, WOODS: TilesValue<37>, UNUSED_TRASH1: TilesValue<38>, UNUSED_TRASH2: TilesValue<39>, WOODS_HIGH: TilesValue<39>, WOODS2: TilesValue<40>, WOODS3: TilesValue<41>, WOODS4: TilesValue<42>, WOODS5: TilesValue<43>, RUBBLE: TilesValue<44>, LASTRUBBLE: TilesValue<47>, FLOOD: TilesValue<48>, LASTFLOOD: TilesValue<51>, RADTILE: TilesValue<52>, UNUSED_TRASH3: TilesValue<53>, UNUSED_TRASH4: TilesValue<54>, UNUSED_TRASH5: TilesValue<55>, FIRE: TilesValue<56>, FIREBASE: TilesValue<56>, LASTFIRE: TilesValue<63>, HBRIDGE: TilesValue<64>, ROADBASE: TilesValue<64>, VBRIDGE: TilesValue<65>, ROADS: TilesValue<66>, ROADS2: TilesValue<67>, ROADS3: TilesValue<68>, ROADS4: TilesValue<69>, ROADS5: TilesValue<70>, ROADS6: TilesValue<71>, ROADS7: TilesValue<72>, ROADS8: TilesValue<73>, ROADS9: TilesValue<74>, ROADS10: TilesValue<75>, INTERSECTION: TilesValue<76>, HROADPOWER: TilesValue<77>, VROADPOWER: TilesValue<78>, BRWH: TilesValue<79>, LTRFBASE: TilesValue<80>, BRWV: TilesValue<95>, BRWXXX1: TilesValue<111>, BRWXXX2: TilesValue<127>, BRWXXX3: TilesValue<143>, HTRFBASE: TilesValue<144>, BRWXXX4: TilesValue<159>, BRWXXX5: TilesValue<175>, BRWXXX6: TilesValue<191>, LASTROAD: TilesValue<206>, BRWXXX7: TilesValue<207>, HPOWER: TilesValue<208>, VPOWER: TilesValue<209>, LHPOWER: TilesValue<210>, LVPOWER: TilesValue<211>, LVPOWER2: TilesValue<212>, LVPOWER3: TilesValue<213>, LVPOWER4: TilesValue<214>, LVPOWER5: TilesValue<215>, LVPOWER6: TilesValue<216>, LVPOWER7: TilesValue<217>, LVPOWER8: TilesValue<218>, LVPOWER9: TilesValue<219>, LVPOWER10: TilesValue<220>, RAILHPOWERV: TilesValue<221>, RAILVPOWERH: TilesValue<222>, POWERBASE: TilesValue<208>, LASTPOWER: TilesValue<222>, UNUSED_TRASH6: TilesValue<223>, HRAIL: TilesValue<224>, VRAIL: TilesValue<225>, LHRAIL: TilesValue<226>, LVRAIL: TilesValue<227>, LVRAIL2: TilesValue<228>, LVRAIL3: TilesValue<229>, LVRAIL4: TilesValue<230>, LVRAIL5: TilesValue<231>, LVRAIL6: TilesValue<232>, LVRAIL7: TilesValue<233>, LVRAIL8: TilesValue<234>, LVRAIL9: TilesValue<235>, LVRAIL10: TilesValue<236>, HRAILROAD: TilesValue<237>, VRAILROAD: TilesValue<238>, RAILBASE: TilesValue<224>, LASTRAIL: TilesValue<238>, ROADVPOWERH: TilesValue<239>, RESBASE: TilesValue<240>, FREEZ: TilesValue<244>, HOUSE: TilesValue<249>, LHTHR: TilesValue<249>, HHTHR: TilesValue<260>, RZB: TilesValue<265>, HOSPITALBASE: TilesValue<405>, HOSPITAL: TilesValue<409>, CHURCHBASE: TilesValue<414>, CHURCH0BASE: TilesValue<414>, CHURCH: TilesValue<418>, CHURCH0: TilesValue<418>, COMBASE: TilesValue<423>, COMCLR: TilesValue<427>, CZB: TilesValue<436>, COMLAST: TilesValue<609>, INDBASE: TilesValue<612>, INDCLR: TilesValue<616>, LASTIND: TilesValue<620>, IND1: TilesValue<621>, IZB: TilesValue<625>, IND2: TilesValue<641>, IND3: TilesValue<644>, IND4: TilesValue<649>, IND5: TilesValue<650>, IND6: TilesValue<676>, IND7: TilesValue<677>, IND8: TilesValue<686>, IND9: TilesValue<689>, PORTBASE: TilesValue<693>, PORT: TilesValue<698>, LASTPORT: TilesValue<708>, AIRPORTBASE: TilesValue<709>, RADAR: TilesValue<711>, AIRPORT: TilesValue<716>, COALBASE: TilesValue<745>, POWERPLANT: TilesValue<750>, LASTPOWERPLANT: TilesValue<760>, FIRESTBASE: TilesValue<761>, FIRESTATION: TilesValue<765>, POLICESTBASE: TilesValue<770>, POLICESTATION: TilesValue<774>, STADIUMBASE: TilesValue<779>, STADIUM: TilesValue<784>, FULLSTADIUM: TilesValue<800>, NUCLEARBASE: TilesValue<811>, NUCLEAR: TilesValue<816>, LASTZONE: TilesValue<826>, LIGHTNINGBOLT: TilesValue<827>, HBRDG0: TilesValue<828>, HBRDG1: TilesValue<829>, HBRDG2: TilesValue<830>, HBRDG3: TilesValue<831>, HBRDG_END: TilesValue<832>, RADAR0: TilesValue<832>, RADAR1: TilesValue<833>, RADAR2: TilesValue<834>, RADAR3: TilesValue<835>, RADAR4: TilesValue<836>, RADAR5: TilesValue<837>, RADAR6: TilesValue<838>, RADAR7: TilesValue<839>, FOUNTAIN: TilesValue<840>, INDBASE2: TilesValue<844>, TELEBASE: TilesValue<844>, TELELAST: TilesValue<851>, SMOKEBASE: TilesValue<852>, TINYEXP: TilesValue<860>, SOMETINYEXP: TilesValue<864>, LASTTINYEXP: TilesValue<867>, TINYEXPLAST: TilesValue<883>, COALSMOKE1: TilesValue<916>, COALSMOKE2: TilesValue<920>, COALSMOKE3: TilesValue<924>, COALSMOKE4: TilesValue<928>, FOOTBALLGAME1: TilesValue<932>, FOOTBALLGAME2: TilesValue<940>, VBRDG0: TilesValue<948>, VBRDG1: TilesValue<949>, VBRDG2: TilesValue<950>, VBRDG3: TilesValue<951>, NUKESWIRL1: TilesValue<952>, NUKESWIRL2: TilesValue<953>, NUKESWIRL3: TilesValue<954>, NUKESWIRL4: TilesValue<955>, CHURCH1BASE: TilesValue<956>, CHURCH1: TilesValue<960>, CHURCH1BASE: TilesValue<956>, CHURCH1: TilesValue<960>, CHURCH2BASE: TilesValue<965>, CHURCH2: TilesValue<969>, CHURCH3BASE: TilesValue<974>, CHURCH3: TilesValue<978>, CHURCH4BASE: TilesValue<983>, CHURCH4: TilesValue<987>, CHURCH5BASE: TilesValue<992>, CHURCH5: TilesValue<996>, CHURCH6BASE: TilesValue<1001>, CHURCH6: TilesValue<1005>, CHURCH7BASE: TilesValue<1010>, CHURCH7: TilesValue<1014>, CHURCH7LAST: TilesValue<1018>, TILE_COUNT: TilesValue<1024>, TILE_INVALID: TilesValue<-1>};
  SimSprite: {};
  Callback: {};
  JSCallback: {new(_0: any): JSCallback};
  Micropolis: {new(): Micropolis};
  increment45(_0: Direction2, _1: number): Direction2;
  rotate45(_0: Direction2, _1: number): Direction2;
  WORLD_W: number;
  WORLD_H: number;
  BITS_PER_TILE: number;
  BYTES_PER_TILE: number;
  WORLD_W_2: number;
  WORLD_H_2: number;
  WORLD_W_4: number;
  WORLD_H_4: number;
  WORLD_W_8: number;
  WORLD_H_8: number;
  EDITOR_TILE_SIZE: number;
  PASSES_PER_CITYTIME: number;
  CITYTIMES_PER_MONTH: number;
  CITYTIMES_PER_YEAR: number;
  HISTORY_LENGTH: number;
  MISC_HISTORY_LENGTH: number;
  HISTORY_COUNT: number;
  POWER_STACK_SIZE: number;
  NOWHERE: number;
  ISLAND_RADIUS: number;
  MAX_TRAFFIC_DISTANCE: number;
  MAX_ROAD_EFFECT: number;
  MAX_POLICE_STATION_EFFECT: number;
  MAX_FIRE_STATION_EFFECT: number;
  RES_VALVE_RANGE: number;
  COM_VALVE_RANGE: number;
  IND_VALVE_RANGE: number;
}
