/**
 * Loads the compiled macOS addon. The contract it satisfies is in
 * ../../native-types.ts; the implementation is Native.mm next door.
 */

import type { NativeAddon } from '../../native-types';

// cmake-js writes to build/Release relative to the package root, five levels up.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const native: NativeAddon = require('../../../../../build/Release/NativeMacOS.node');

export { native };
