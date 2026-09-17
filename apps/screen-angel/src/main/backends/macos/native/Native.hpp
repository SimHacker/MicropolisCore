// The macOS half of the Screen Angel's native surface.
//
// Everything here exists because Electron cannot reach it: the accessibility tree,
// the permission gates in front of that tree, and the window list. The transparent
// click-through overlay is NOT here, because Electron already does it.

#ifndef SCREEN_ANGEL_NATIVE_HPP
#define SCREEN_ANGEL_NATIVE_HPP

#include <napi.h>

class Native : public Napi::Addon<Native> {
 public:
  Native(Napi::Env env, Napi::Object exports);

 private:
  /**
   * Reports whether the two permissions this app needs have been granted, without
   * prompting for either. Called on every launch so the UI can explain the state
   * instead of silently returning empty trees.
   */
  Napi::Value checkPermissions(const Napi::CallbackInfo& info);

  /**
   * Asks for the permissions that are missing. macOS shows its own dialog and, for
   * Accessibility, requires the user to visit System Settings and then relaunch —
   * so this returns immediately and the caller must poll checkPermissions.
   */
  Napi::Value requestPermissions(const Napi::CallbackInfo& info);

  /** App name, window title, pid and frame of the frontmost window. */
  Napi::Value getFocusedWindow(const Napi::CallbackInfo& info);

  /**
   * Every on-screen window. Titles come from the window server and are withheld
   * until Screen Recording is granted, so a title may be empty while the owner
   * name is not.
   */
  Napi::Value getOpenWindows(const Napi::CallbackInfo& info);

  /**
   * Walks the accessibility tree and returns it flattened, with an index path per
   * node. Bounded by maxDepth and maxNodes because an unbounded walk of a browser
   * window takes seconds and would freeze the caller.
   */
  Napi::Value queryTree(const Napi::CallbackInfo& info);

  /** The single deepest element under a screen point. Cheap; no walk. */
  Napi::Value getElementAt(const Napi::CallbackInfo& info);

  /**
   * One still frame, encoded, returned as bytes.
   *
   * Takes {rect} in global screen points, or {windowId} for a single window, plus an
   * optional maxEdge to downscale before encoding and a format. Returns the encoded
   * buffer and the size actually produced.
   *
   * Encoding happens here rather than in JavaScript because the alternative is copying
   * a full-resolution bitmap across the boundary in order to throw most of it away.
   *
   * Nothing about files, caching or lifetimes is decided here. This returns bytes; who
   * owns them is a question for the layer that asked.
   */
  Napi::Value captureImage(const Napi::CallbackInfo& info);
};

#endif  // SCREEN_ANGEL_NATIVE_HPP
