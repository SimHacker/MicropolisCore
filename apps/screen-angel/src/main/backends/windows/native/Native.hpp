// The Windows half of the Screen Angel's native surface.
//
// Same six methods as the macOS addon, same shapes in and out, so the backends above
// stay thin and a module never learns which platform it is on. Backed by UI
// Automation rather than AX, which changes two things worth knowing: there is no
// permission gate to pass, and a non-elevated process cannot read the tree of an
// elevated one at all.

#ifndef SCREEN_ANGEL_NATIVE_HPP
#define SCREEN_ANGEL_NATIVE_HPP

#include <napi.h>

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <uiautomation.h>

class Native : public Napi::Addon<Native> {
 public:
  Native(Napi::Env env, Napi::Object exports);
  virtual ~Native();

 private:
  /** Always granted on Windows; the method exists so callers need no platform test. */
  Napi::Value checkPermissions(const Napi::CallbackInfo& info);

  /** A no-op on Windows, for the same reason. */
  Napi::Value requestPermissions(const Napi::CallbackInfo& info);

  Napi::Value getFocusedWindow(const Napi::CallbackInfo& info);
  Napi::Value getOpenWindows(const Napi::CallbackInfo& info);

  /**
   * Walks the UI Automation tree from a top-level window and returns it flattened.
   * Rooted at a window rather than at the process, because UIA's root is the desktop
   * and descending from there means walking every application at once.
   */
  Napi::Value queryTree(const Napi::CallbackInfo& info);

  Napi::Value getElementAt(const Napi::CallbackInfo& info);

  /** Created once and reused; constructing it per call is measurably slower. */
  IUIAutomation* mAutomation = nullptr;
  bool mOwnsCom = false;
};

#endif  // SCREEN_ANGEL_NATIVE_HPP
