/* resource.cpp
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

/** @file resource.cpp
 * Get resources (from files)
 */

////////////////////////////////////////////////////////////////////////


#include "micropolis.h"


////////////////////////////////////////////////////////////////////////

/**
 * Find the resource with the given name and identification.
 * @param name Name of the resource (a 4 character string)
 * @param id   Identification of the resource.
 * @return Pointer to the resource.
 * @bug Function is not safely handling strings.
 * @bug File handling is not safe across platforms (text-mode may modify data).
 * @todo What is the point of a \c Quad \a id when we cast it to an \c int ?
 */
Resource *Micropolis::getResource(std::string name, Quad id)
{
    Resource *r = resources;

    while (r != NULL) {
        if ((r->id == id) && 
            (r->name == name)) {
            return r;
        }
        r = r->next;
    }

    // Resource not found, load it from disk

    // Allocate memory for the resource administration itself
    r = (Resource *)newPtr(sizeof(Resource));
    assert(r != NULL);

    r->name = name;
    r->id = id;

    // Load the file into memory

    std::string fname;
    fname += resourceDir;
    fname += "/";
    fname += r->name;
    fname += ".";
    fname += std::to_string(r->id);

    struct stat st;
    FILE *fp = NULL;

    if (stat(fname.c_str(), &st) < 0) {  // File cannot be found/loaded
        goto loadFailed;
    }

    if (st.st_size == 0) { // File is empty
        goto loadFailed;
    }

    r->size = st.st_size;
    r->buf = (char *)newPtr(r->size);
    if (r->buf == NULL) { // No memory allocated
        goto loadFailed;
    }

    // XXX Opening in text-mode
    fp = fopen(fname.c_str(), "r"); // Open file for reading

    if (fp == NULL) {
        goto loadFailed;
    }

    // File succesfully opened. Below here we must always close the file!!

    // XXX This may break due to use of text-mode
    if ((int)fread(r->buf, sizeof(char), r->size, fp) != r->size) {
        fclose(fp);
        goto loadFailed;
    }

    // File-load ok !!
    fclose(fp);

    r->next = resources;
    resources = r;

    return r;

loadFailed:
    // Load failed, print an error and quit
    r->buf = NULL;
    r->size = 0;
    fprintf(stderr, "Can't find resource file \"%s\"!\n", fname.c_str());
    perror("getResource");
    return NULL;
}

/**
 * Get the text of a message.
 * @param id  Identification of the resource.
 * @param num Number of the string in the resource.
 */
std::string Micropolis::getIndString(int id, short num)
{
    // Find or load the string table
    StringTable *st = findOrLoadStringTable(id);
    if (st != NULL && num < st->lines) {
        return st->strings[num];
    } else {
        // Handle the case where the string is not found
        return  std::string("");
    }
}


StringTable *Micropolis::findOrLoadStringTable(int id)
{
    // Search for the string table in the already loaded list
    for (StringTable* tp = stringTables; tp != NULL; tp = tp->next) {
        if (tp->id == id) {
            return tp;
        }
    }

    // Load the string table as it's not found
    Resource *r = getResource("stri", id);
    if (!r) {
        return NULL; // Handle the case where the resource is not found
    }

    StringTable *st = new StringTable();
    st->id = id;
    char *buf = r->buf;
    Quad lineStart = 0;
    for (Quad i = 0; i < r->size; i++) {
        if (buf[i] == '\n') {
            st->strings.push_back(std::string(&buf[lineStart], i - lineStart));
            lineStart = i + 1;
        }
    }

    st->lines = st->strings.size();
    st->next = stringTables;
    stringTables = st;

    return st;
}


////////////////////////////////////////////////////////////////////////

