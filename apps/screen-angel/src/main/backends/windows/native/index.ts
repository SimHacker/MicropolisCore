/**
 * Loads the compiled Windows addon. The contract it satisfies is in
 * ../../native-types.ts; the implementation is Native.cpp next door.
 */

import type { NativeAddon } from '../../native-types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const native: NativeAddon = require('../../../../../build/Release/NativeWin32.node');

export { native };
