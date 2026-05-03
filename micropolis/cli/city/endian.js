export const Endian = {
    /**
     * Swap bytes in a 16-bit value (convert between big-endian and little-endian)
     * @param {number} value - The 16-bit value to swap
     * @returns {number} - The byte-swapped value
     */
    swapShort: (value) => {
        return ((value & 0xFF) << 8) | ((value & 0xFF00) >> 8);
    },

    /**
     * Swap words in a 32-bit value (special handling for SimCity long values)
     * @param {number} value - The 32-bit value to swap
     * @returns {number} - The word-swapped value
     */
    halfSwapLong: (value) => {
        return ((value & 0x0000FFFF) << 16) | ((value & 0xFFFF0000) >> 16);
    },

    /**
     * Read a 16-bit big-endian value from a buffer
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The byte offset to read at
     * @returns {number} - The 16-bit value in host byte order
     */
    readShort: (buffer, offset) => {
        const value = buffer.readUInt16BE(offset);
        return value;
    },

    /**
     * Read a 32-bit big-endian value from two consecutive shorts.
     *
     * The save file stores 32-bit values across two big-endian 16-bit shorts
     * where the first short is the high word. On little-endian machines the
     * C++ code applies half_swap_longs after swap_shorts to correct the word
     * order; the net effect is a simple big-endian 32-bit read.
     *
     * See fileio.cpp loadFile():
     *   n = *(Quad *)(miscHist + 50);
     *   HALF_SWAP_LONGS(&n, 1);
     *   setFunds(n);
     *
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The byte offset to read at
     * @returns {number} - The signed 32-bit value
     */
    readLong: (buffer, offset) => {
        return buffer.readInt32BE(offset);
    },

    /**
     * Read a funding percentage stored as a 32-bit fixed-point integer.
     *
     * The C++ engine stores funding percentages as (int)(percent * 65536)
     * across two consecutive big-endian shorts. NOT an IEEE-754 float.
     *
     * See fileio.cpp loadFile():
     *   n = *(Quad *)(miscHist + 58);
     *   HALF_SWAP_LONGS(&n, 1);
     *   policePercent = ((float)n) / ((float)65536);
     *
     * See fileio.cpp saveFile():
     *   n = (int)(policePercent * 65536);
     *
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The byte offset to read at
     * @returns {number} - The funding percentage as a float (0.0 to 1.0)
     */
    readFundingPercent: (buffer, offset) => {
        return buffer.readInt32BE(offset) / 65536.0;
    },

    /**
     * Write a 16-bit big-endian value to a buffer.
     * @param {Buffer} buffer - The buffer to write to
     * @param {number} offset - The byte offset to write at
     * @param {number} value - The 16-bit value to write
     */
    writeShort: (buffer, offset, value) => {
        buffer.writeUInt16BE(value & 0xFFFF, offset);
    },

    /**
     * Write a 32-bit big-endian value to a buffer (reverse of readLong).
     * See fileio.cpp saveFile():
     *   n = totalFunds;
     *   HALF_SWAP_LONGS(&n, 1);
     *   (*(Quad *)(miscHist + 50)) = n;
     *
     * @param {Buffer} buffer - The buffer to write to
     * @param {number} offset - The byte offset to write at
     * @param {number} value - The signed 32-bit value to write
     */
    writeLong: (buffer, offset, value) => {
        buffer.writeInt32BE(value, offset);
    },

    /**
     * Write a funding percentage as a 32-bit fixed-point integer (reverse of readFundingPercent).
     * See fileio.cpp saveFile():
     *   n = (int)(policePercent * 65536);
     *
     * @param {Buffer} buffer - The buffer to write to
     * @param {number} offset - The byte offset to write at
     * @param {number} percent - The funding percentage (0.0 to 1.0)
     */
    writeFundingPercent: (buffer, offset, percent) => {
        const n = Math.round(percent * 65536);
        buffer.writeInt32BE(n, offset);
    }
};
