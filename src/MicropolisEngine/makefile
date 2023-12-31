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


# ----------------------------------------------------------------------

CXX = g++
CXXFLAGS = -std=c++11 -fPIC
LDFLAGS = -shared

# ----------------------------------------------------------------------

SOURCES = \
	src/allocate.cpp \
	src/animate.cpp \
	src/budget.cpp \
	src/connect.cpp \
	src/disasters.cpp \
	src/evaluate.cpp \
	src/fileio.cpp \
	src/generate.cpp \
	src/graph.cpp \
	src/initialize.cpp \
	src/main.cpp \
	src/map.cpp \
	src/message.cpp \
	src/micropolis.cpp \
	src/position.cpp \
	src/power.cpp \
	src/random.cpp \
	src/resource.cpp \
	src/scan.cpp \
	src/simulate.cpp \
	src/sprite.cpp \
	src/stubs.cpp \
	src/tool.cpp \
	src/traffic.cpp \
	src/update.cpp \
	src/utilities.cpp \
	src/zone.cpp

HEADERS = \
	src/data_types.h \
	src/generate.h \
	src/map_type.h \
	src/micropolis.h \
	src/position.h \
	src/stdafx.h \
	src/text.h

# ----------------------------------------------------------------------

OBJECTS = $(SOURCES:.cpp=.o)
LIBRARY = micropolisengine.dylib

all: $(LIBRARY)

$(LIBRARY): $(OBJECTS)
	$(CXX) $(LDFLAGS) -o $@ $^

%.o: %.cpp $(HEADERS)
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(LIBRARY)

# ----------------------------------------------------------------------

src/micropolis.h: src/map_type.h src/data_types.h src/position.h

allocate.cpp:   stdafx.h micropolis.h
animate.cpp:    stdafx.h micropolis.h
budget.cpp:     stdafx.h micropolis.h text.h
connect.cpp:    stdafx.h micropolis.h
disasters.cpp:  stdafx.h micropolis.h text.h
evaluate.cpp:   stdafx.h micropolis.h
evaluation.cpp: stdafx.h micropolis.h
fileio.cpp:     stdafx.h micropolis.h
generate.cpp:   stdafx.h micropolis.h generate.h
graph.cpp:      stdafx.h micropolis.h
initialize.cpp: stdafx.h micropolis.h
main.cpp:       stdafx.h micropolis.h
map.cpp:        stdafx.h micropolis.h
message.cpp:    stdafx.h micropolis.h text.h
micropolis.cpp: stdafx.h micropolis.h
power.cpp:      stdafx.h micropolis.h text.h
position.cpp:   stdafx.h micropolis.h
random.cpp:     stdafx.h micropolis.h
resource.cpp:   stdafx.h micropolis.h
scan.cpp:       stdafx.h micropolis.h
simulate.cpp:   stdafx.h micropolis.h text.h
sprite.cpp:     stdafx.h micropolis.h text.h
stubs.cpp:      stdafx.h micropolis.h
tool.cpp:       stdafx.h micropolis.h text.h
traffic.cpp:    stdafx.h micropolis.h
update.cpp:     stdafx.h micropolis.h text.h
utilities.cpp:  stdafx.h micropolis.h
zone.cpp:       stdafx.h micropolis.h


########################################################################
