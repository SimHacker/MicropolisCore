file(GLOB SOURCE_FILES "*.cpp")

add_library(NativeWin32 SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})

set_target_properties(NativeWin32 PROPERTIES PREFIX "" SUFFIX ".node")

# uuid supplies CLSID_CUIAutomation and IID_IUIAutomation; ole32 and oleaut32 the COM
# and BSTR machinery; user32 the window enumeration; psapi the process image names.
target_link_libraries(NativeWin32
  ${CMAKE_JS_LIB}
  ole32
  oleaut32
  uuid
  user32
  psapi
)

target_include_directories(NativeWin32 PRIVATE
  ${NODE_ADDON_API_DIR}
  ${CMAKE_JS_INC}
)
