file(GLOB SOURCE_FILES "*.mm")

enable_language(OBJCXX)

add_library(NativeMacOS SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})

set_target_properties(NativeMacOS PROPERTIES PREFIX "" SUFFIX ".node")

# ScreenCaptureKit needs macOS 14: SCScreenshotManager arrived there, and the older
# CGWindowListCreateImage it replaces was obsoleted outright in macOS 15.
set(CMAKE_OSX_DEPLOYMENT_TARGET "14.0" CACHE STRING "" FORCE)

target_link_libraries(NativeMacOS
  ${CMAKE_JS_LIB}
  "-framework AppKit"
  "-framework ApplicationServices"
  "-framework CoreFoundation"
  "-framework CoreGraphics"
  "-framework ImageIO"
  "-framework ScreenCaptureKit"
  "-framework UniformTypeIdentifiers"
)

target_include_directories(NativeMacOS PRIVATE
  ${NODE_ADDON_API_DIR}
  ${CMAKE_JS_INC}
  ${CMAKE_CURRENT_BINARY_DIR}
)
