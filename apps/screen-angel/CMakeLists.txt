# Built by cmake-js, not by anything else. `pnpm run native` or postinstall.
#
# Windows and macOS only. Linux is deliberately absent: the Wayland/X11 split
# doubles the backend count for the smallest slice of the audience, and every
# capture and accessibility path there needs its own portal dance. Kando pays
# that bill; we can pay it later. See SCREEN-ANGEL.yml#platforms.

cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0042 NEW)

project(screen-angel-native)

add_definitions(-DNAPI_VERSION=8)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

execute_process(COMMAND node -p "require('node-addon-api').include"
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  OUTPUT_VARIABLE NODE_ADDON_API_DIR
)
string(REGEX REPLACE "[\r\n\"]" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})

if (WIN32)
  add_subdirectory(src/main/backends/windows/native)
elseif (APPLE)
  add_subdirectory(src/main/backends/macos/native)
else ()
  message(FATAL_ERROR
    "Screen Angel has no backend for this platform. Windows and macOS only — see CMakeLists.txt.")
endif ()
