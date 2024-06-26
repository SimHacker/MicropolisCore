# Makefile for MicropolisCore
#
# Micropolis, Unix Version.  This game was released for the Unix platform
# in or about 1990 and has been modified for inclusion in the One Laptop
# Per Child program.  Copyright (C) 1989 - 2007 Electronic Arts Inc.  If
# you need assistance with this program, you may contact:
#   http://wiki.laptop.org/go/Micropolis  or email  micropolis@laptop.org.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or (at
# your option) any later version.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.  You should have received a
# copy of the GNU General Public License along with this program.  If
# not, see <http://www.gnu.org/licenses/>.
#
#             ADDITIONAL TERMS per GNU GPL Section 7
#
# No trademark or publicity rights are granted.  This license does NOT
# give you any right, title or interest in the trademark SimCity or any
# other Electronic Arts trademark.  You may not distribute any
# modification of this program using the trademark SimCity or claim any
# affliation or association with Electronic Arts Inc. or its employees.
#
# Any propagation or conveyance of this program must include this
# copyright notice and these terms.
#
# If you convey this program (or any modifications of it) and assume
# contractual liability for the program to recipients of it, you agree
# to indemnify Electronic Arts for any liability that those contractual
# assumptions impose on Electronic Arts.
#
# You may not misrepresent the origins of this program; modified
# versions of the program must be marked as such and not identified as
# the original program.
#
# This disclaimer supplements the one included in the General Public
# License.  TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, THIS
# PROGRAM IS PROVIDED TO YOU "AS IS," WITH ALL FAULTS, WITHOUT WARRANTY
# OF ANY KIND, AND YOUR USE IS AT YOUR SOLE RISK.  THE ENTIRE RISK OF
# SATISFACTORY QUALITY AND PERFORMANCE RESIDES WITH YOU.  ELECTRONIC ARTS
# DISCLAIMS ANY AND ALL EXPRESS, IMPLIED OR STATUTORY WARRANTIES,
# INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, SATISFACTORY QUALITY,
# FITNESS FOR A PARTICULAR PURPOSE, NONINFRINGEMENT OF THIRD PARTY
# RIGHTS, AND WARRANTIES (IF ANY) ARISING FROM A COURSE OF DEALING,
# USAGE, OR TRADE PRACTICE.  ELECTRONIC ARTS DOES NOT WARRANT AGAINST
# INTERFERENCE WITH YOUR ENJOYMENT OF THE PROGRAM; THAT THE PROGRAM WILL
# MEET YOUR REQUIREMENTS; THAT OPERATION OF THE PROGRAM WILL BE
# UNINTERRUPTED OR ERROR-FREE, OR THAT THE PROGRAM WILL BE COMPATIBLE
# WITH THIRD PARTY SOFTWARE OR THAT ANY ERRORS IN THE PROGRAM WILL BE
# CORRECTED.  NO ORAL OR WRITTEN ADVICE PROVIDED BY ELECTRONIC ARTS OR
# ANY AUTHORIZED REPRESENTATIVE SHALL CREATE A WARRANTY.  SOME
# JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF OR LIMITATIONS ON IMPLIED
# WARRANTIES OR THE LIMITATIONS ON THE APPLICABLE STATUTORY RIGHTS OF A
# CONSUMER, SO SOME OR ALL OF THE ABOVE EXCLUSIONS AND LIMITATIONS MAY
# NOT APPLY TO YOU.
#
########################################################################


########################################################################
# Emscripten settings


EMCC = em++

EMCXXFLAGS = \
    -std=c++11 \
	-fPIC

EMLDFLAGS = \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s 'ENVIRONMENT=web,worker' \
	-lembind \
	--embind-emit-tsd micropolisengine.d.ts \
	--shell-file src/micropolisengine_template.html \
	--js-library src/micropolisengine_lib.js \
	--preload-file ../resources/cities@cities/


########################################################################
# Sources and headers


SOURCES = \
	src/allocate.cpp \
	src/animate.cpp \
	src/budget.cpp \
	src/callback.cpp \
	src/connect.cpp \
	src/disasters.cpp \
	src/emscripten.cpp \
	src/evaluate.cpp \
	src/fileio.cpp \
	src/generate.cpp \
	src/graph.cpp \
	src/initialize.cpp \
	src/map.cpp \
	src/frontendmessage.cpp \
	src/message.cpp \
	src/micropolis.cpp \
	src/position.cpp \
	src/power.cpp \
	src/random.cpp \
	src/scan.cpp \
	src/simulate.cpp \
	src/sprite.cpp \
	src/tool.cpp \
	src/traffic.cpp \
	src/update.cpp \
	src/utilities.cpp \
	src/zone.cpp

SUBHEADERS = \
	src/callback.h \
	src/data_types.h \
	src/frontendmessage.h \
	src/map_type.h \
	src/position.h \
	src/text.h \
	src/tool.h

HEADERS = \
	$(SUBHEADERS) \
	src/micropolis.h


########################################################################


OBJECTS = $(SOURCES:.cpp=.o)
LIBRARY = build/micropolisengine
OUTPUTFILES = \
    $(LIBRARY).wasm \
	$(LIBRARY).js \
	$(LIBRARY).d.ts \
	$(LIBRARY).data \
	$(LIBRARY).html

all: $(LIBRARY)

# Compilation rule for wasm
$(LIBRARY): $(OBJECTS)
	mkdir -p build
	$(EMCC) \
		$(EMLDFLAGS) \
		-o $(LIBRARY).html \
		$^

%.o: %.cpp $(HEADERS)
	$(EMCC) \
	    $(EMCXXFLAGS) \
		-c $< \
		-o $@

install: all
	echo "MicropolisEngine: makefile: make install"
	pwd
	ls -la .
	ls -la build
	cp build/micropolisengine.wasm ../micropolis/src/lib
	cp build/micropolisengine.data ../micropolis/src/lib
	cp build/micropolisengine.js ../micropolis/src/lib
	cp build/micropolisengine.d.ts ../micropolis/src/types

clean:
	rm -rf \
	    $(OBJECTS) \
		$(OUTPUTFILES) \
		build


########################################################################
# Dependencies


src/micropolis.h: $(SUBHEADERS)

allocate.cpp: micropolis.h
animate.cpp: micropolis.h
budget.cpp: micropolis.h
connect.cpp: micropolis.h
disasters.cpp: micropolis.h
emscripten.cpp: micropolis.h
evaluate.cpp: micropolis.h
frontendmessage.cpp: micropolis.h
fileio.cpp: micropolis.h
generate.cpp: micropolis.h
graph.cpp: micropolis.h
initialize.cpp: micropolis.h
map.cpp: micropolis.h
message.cpp: micropolis.h
micropolis.cpp: micropolis.h
position.cpp: micropolis.h
power.cpp: micropolis.h
random.cpp: micropolis.h
resource.cpp: micropolis.h
scan.cpp: micropolis.h
simulate.cpp: micropolis.h
sprite.cpp: micropolis.h
stubs.cpp: micropolis.h
tool.cpp: micropolis.h
traffic.cpp: micropolis.h
update.cpp: micropolis.h
utilities.cpp: micropolis.h
zone.cpp: micropolis.h


########################################################################
