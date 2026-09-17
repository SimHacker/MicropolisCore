#include "Native.hpp"

#import <AppKit/AppKit.h>
#import <ApplicationServices/ApplicationServices.h>
#import <CoreGraphics/CoreGraphics.h>
#import <ImageIO/ImageIO.h>
#import <ScreenCaptureKit/ScreenCaptureKit.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

#include <string>
#include <vector>

namespace {

// The walk is bounded rather than exhaustive. A Safari or Electron window can expose
// tens of thousands of AX nodes, and each attribute read is a synchronous IPC round
// trip to the other process, so an unbounded walk is measured in seconds. Callers get
// told when a budget cut them off; they do not get to wait forever by accident.
struct Budget {
  int maxDepth = 12;
  int maxNodes = 4000;
  int visited = 0;
  bool truncated = false;
};

std::string FromCFString(CFStringRef value) {
  if (value == nullptr) {
    return {};
  }
  CFIndex length = CFStringGetLength(value);
  CFIndex capacity = CFStringGetMaximumSizeForEncoding(length, kCFStringEncodingUTF8) + 1;
  std::string result(static_cast<size_t>(capacity), '\0');
  if (!CFStringGetCString(value, result.data(), capacity, kCFStringEncodingUTF8)) {
    return {};
  }
  result.resize(std::strlen(result.c_str()));
  return result;
}

/** Reads a string attribute. AX will also hand back numbers and booleans where a
 *  caller expects text (kAXValueAttribute on a checkbox, for instance), so those are
 *  coerced rather than dropped. */
bool CopyStringAttribute(AXUIElementRef element, CFStringRef attribute, std::string* out) {
  CFTypeRef value = nullptr;
  if (AXUIElementCopyAttributeValue(element, attribute, &value) != kAXErrorSuccess ||
      value == nullptr) {
    return false;
  }

  bool ok = false;
  CFTypeID type = CFGetTypeID(value);
  if (type == CFStringGetTypeID()) {
    *out = FromCFString(static_cast<CFStringRef>(value));
    ok = true;
  } else if (type == CFNumberGetTypeID()) {
    double number = 0;
    CFNumberGetValue(static_cast<CFNumberRef>(value), kCFNumberDoubleType, &number);
    *out = std::to_string(number);
    ok = true;
  } else if (type == CFBooleanGetTypeID()) {
    *out = CFBooleanGetValue(static_cast<CFBooleanRef>(value)) ? "true" : "false";
    ok = true;
  }

  CFRelease(value);
  return ok;
}

bool CopyBoolAttribute(AXUIElementRef element, CFStringRef attribute, bool* out) {
  CFTypeRef value = nullptr;
  if (AXUIElementCopyAttributeValue(element, attribute, &value) != kAXErrorSuccess ||
      value == nullptr) {
    return false;
  }
  bool ok = false;
  if (CFGetTypeID(value) == CFBooleanGetTypeID()) {
    *out = CFBooleanGetValue(static_cast<CFBooleanRef>(value));
    ok = true;
  }
  CFRelease(value);
  return ok;
}

bool CopyFrame(AXUIElementRef element, CGRect* out) {
  CFTypeRef positionValue = nullptr;
  CFTypeRef sizeValue = nullptr;
  CGPoint origin = CGPointZero;
  CGSize size = CGSizeZero;
  bool haveOrigin = false;
  bool haveSize = false;

  if (AXUIElementCopyAttributeValue(element, kAXPositionAttribute, &positionValue) ==
          kAXErrorSuccess &&
      positionValue != nullptr) {
    haveOrigin = AXValueGetValue(static_cast<AXValueRef>(positionValue), kAXValueTypeCGPoint,
                                 &origin);
    CFRelease(positionValue);
  }
  if (AXUIElementCopyAttributeValue(element, kAXSizeAttribute, &sizeValue) == kAXErrorSuccess &&
      sizeValue != nullptr) {
    haveSize = AXValueGetValue(static_cast<AXValueRef>(sizeValue), kAXValueTypeCGSize, &size);
    CFRelease(sizeValue);
  }

  if (!haveOrigin && !haveSize) {
    return false;
  }
  *out = CGRectMake(origin.x, origin.y, size.width, size.height);
  return true;
}

int ChildCount(AXUIElementRef element) {
  CFIndex count = 0;
  if (AXUIElementGetAttributeValueCount(element, kAXChildrenAttribute, &count) !=
      kAXErrorSuccess) {
    return 0;
  }
  return static_cast<int>(count);
}

Napi::Object RectToJs(Napi::Env env, CGRect rect) {
  Napi::Object object = Napi::Object::New(env);
  object.Set("x", Napi::Number::New(env, rect.origin.x));
  object.Set("y", Napi::Number::New(env, rect.origin.y));
  object.Set("width", Napi::Number::New(env, rect.size.width));
  object.Set("height", Napi::Number::New(env, rect.size.height));
  return object;
}

Napi::Array PathToJs(Napi::Env env, const std::vector<int>& path) {
  Napi::Array array = Napi::Array::New(env, path.size());
  for (size_t i = 0; i < path.size(); i++) {
    array.Set(static_cast<uint32_t>(i), Napi::Number::New(env, path[i]));
  }
  return array;
}

Napi::Object ElementToJs(Napi::Env env, AXUIElementRef element, const std::vector<int>& path,
                         int depth, pid_t pid, const std::string& app) {
  Napi::Object object = Napi::Object::New(env);

  std::string text;
  object.Set("nativeRole",
             Napi::String::New(env, CopyStringAttribute(element, kAXRoleAttribute, &text)
                                        ? text
                                        : "AXUnknown"));
  if (CopyStringAttribute(element, kAXSubroleAttribute, &text)) {
    object.Set("subrole", Napi::String::New(env, text));
  }

  // Two attributes compete to be "the name": the title, and the description that
  // sighted-user-invisible controls carry instead. Prefer the title, fall back, so a
  // selector on [name=...] finds toolbar buttons that only have descriptions.
  if (CopyStringAttribute(element, kAXTitleAttribute, &text) && !text.empty()) {
    object.Set("name", Napi::String::New(env, text));
  } else if (CopyStringAttribute(element, kAXDescriptionAttribute, &text) && !text.empty()) {
    object.Set("name", Napi::String::New(env, text));
  }

  if (CopyStringAttribute(element, kAXValueAttribute, &text)) {
    object.Set("value", Napi::String::New(env, text));
  }

  bool flag = false;
  if (CopyBoolAttribute(element, kAXEnabledAttribute, &flag)) {
    object.Set("enabled", Napi::Boolean::New(env, flag));
  }
  if (CopyBoolAttribute(element, kAXFocusedAttribute, &flag)) {
    object.Set("focused", Napi::Boolean::New(env, flag));
  }

  CGRect frame = CGRectZero;
  if (CopyFrame(element, &frame)) {
    object.Set("bounds", RectToJs(env, frame));
  }

  object.Set("childCount", Napi::Number::New(env, ChildCount(element)));
  object.Set("depth", Napi::Number::New(env, depth));
  object.Set("path", PathToJs(env, path));
  object.Set("pid", Napi::Number::New(env, pid));
  if (!app.empty()) {
    object.Set("app", Napi::String::New(env, app));
  }
  return object;
}

void Walk(Napi::Env env, Napi::Array& out, AXUIElementRef element, std::vector<int>* path,
          int depth, Budget* budget, pid_t pid, const std::string& app) {
  if (budget->visited >= budget->maxNodes) {
    budget->truncated = true;
    return;
  }
  budget->visited++;
  out.Set(out.Length(), ElementToJs(env, element, *path, depth, pid, app));

  if (depth >= budget->maxDepth) {
    if (ChildCount(element) > 0) {
      budget->truncated = true;
    }
    return;
  }

  CFTypeRef children = nullptr;
  if (AXUIElementCopyAttributeValue(element, kAXChildrenAttribute, &children) !=
          kAXErrorSuccess ||
      children == nullptr) {
    return;
  }
  if (CFGetTypeID(children) == CFArrayGetTypeID()) {
    CFArrayRef array = static_cast<CFArrayRef>(children);
    CFIndex count = CFArrayGetCount(array);
    for (CFIndex i = 0; i < count; i++) {
      if (budget->visited >= budget->maxNodes) {
        budget->truncated = true;
        break;
      }
      AXUIElementRef child =
          static_cast<AXUIElementRef>(const_cast<void*>(CFArrayGetValueAtIndex(array, i)));
      path->push_back(static_cast<int>(i));
      Walk(env, out, child, path, depth + 1, budget, pid, app);
      path->pop_back();
    }
  }
  CFRelease(children);
}

/**
 * Ask a Chromium-based application to build its accessibility tree.
 *
 * Chromium does not maintain one until it believes an assistive technology is listening,
 * because the tree is expensive to keep in sync with the DOM. Without this, every Electron
 * app on the machine — Cursor, VS Code, Slack, Discord, and this app's own windows —
 * reports a nearly empty tree, and the emptiness is indistinguishable from a bug in us.
 *
 * AXManualAccessibility is the documented opt-in for exactly this case. It is ignored by
 * applications that do not implement it, so it is safe to set on anything and there is no
 * point testing first.
 *
 * The tree does not appear instantly. Chromium builds it asynchronously, so the first
 * query against a cold Electron app can still come back thin and the second will not.
 */
void RequestAccessibilityTree(AXUIElementRef application) {
  AXUIElementSetAttributeValue(application, CFSTR("AXManualAccessibility"), kCFBooleanTrue);
}

std::string AppNameForPid(pid_t pid) {
  NSRunningApplication* app =
      [NSRunningApplication runningApplicationWithProcessIdentifier:pid];
  if (app == nil) {
    return {};
  }
  NSString* name = app.localizedName ?: app.bundleIdentifier;
  return name == nil ? std::string{} : std::string(name.UTF8String);
}

const char* StateName(bool granted) { return granted ? "granted" : "denied"; }

}  // namespace

Native::Native(Napi::Env env, Napi::Object exports) {
  DefineAddon(exports, {
    InstanceMethod("checkPermissions", &Native::checkPermissions),
    InstanceMethod("requestPermissions", &Native::requestPermissions),
    InstanceMethod("getFocusedWindow", &Native::getFocusedWindow),
    InstanceMethod("getOpenWindows", &Native::getOpenWindows),
    InstanceMethod("queryTree", &Native::queryTree),
    InstanceMethod("getElementAt", &Native::getElementAt),
    InstanceMethod("captureImage", &Native::captureImage),
  });
}

Napi::Value Native::checkPermissions(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Object result = Napi::Object::New(env);
  result.Set("accessibility", Napi::String::New(env, StateName(AXIsProcessTrusted())));
  result.Set("screenCapture",
             Napi::String::New(env, StateName(CGPreflightScreenCaptureAccess())));
  return result;
}

Napi::Value Native::requestPermissions(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  @autoreleasepool {
    // Accessibility cannot be granted in-process: this only opens the pane and adds
    // the app to the list. The user has to tick the box, and macOS then requires a
    // relaunch before the trust takes effect.
    NSDictionary* options = @{(__bridge id)kAXTrustedCheckOptionPrompt : @YES};
    AXIsProcessTrustedWithOptions((__bridge CFDictionaryRef)options);
    CGRequestScreenCaptureAccess();
  }
  return env.Undefined();
}

Napi::Value Native::getFocusedWindow(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  @autoreleasepool {
    NSRunningApplication* frontmost = [NSWorkspace sharedWorkspace].frontmostApplication;
    if (frontmost == nil) {
      return env.Null();
    }
    pid_t pid = frontmost.processIdentifier;

    Napi::Object result = Napi::Object::New(env);
    NSString* appName = frontmost.localizedName ?: frontmost.bundleIdentifier ?: @"";
    result.Set("app", Napi::String::New(env, appName.UTF8String));
    result.Set("pid", Napi::Number::New(env, pid));
    result.Set("title", Napi::String::New(env, ""));

    AXUIElementRef application = AXUIElementCreateApplication(pid);
    if (application == nullptr) {
      return result;
    }

    // The focus poller runs constantly, so this is also where Chromium apps get asked to
    // build their tree — by the time anyone queries one, it has usually finished.
    RequestAccessibilityTree(application);

    CFTypeRef window = nullptr;
    if (AXUIElementCopyAttributeValue(application, kAXFocusedWindowAttribute, &window) ==
            kAXErrorSuccess &&
        window != nullptr) {
      AXUIElementRef windowElement = static_cast<AXUIElementRef>(const_cast<void*>(window));
      std::string title;
      if (CopyStringAttribute(windowElement, kAXTitleAttribute, &title)) {
        result.Set("title", Napi::String::New(env, title));
      }
      CGRect frame = CGRectZero;
      if (CopyFrame(windowElement, &frame)) {
        result.Set("bounds", RectToJs(env, frame));
      }
      CFRelease(window);
    }

    CFRelease(application);
    return result;
  }
}

Napi::Value Native::getOpenWindows(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Array result = Napi::Array::New(env);

  CFArrayRef windows = CGWindowListCopyWindowInfo(
      kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID);
  if (windows == nullptr) {
    return result;
  }

  CFIndex count = CFArrayGetCount(windows);
  for (CFIndex i = 0; i < count; i++) {
    CFDictionaryRef window =
        static_cast<CFDictionaryRef>(CFArrayGetValueAtIndex(windows, i));

    // Skip the window server's own furniture: layer 0 is where applications live.
    CFNumberRef layerRef =
        static_cast<CFNumberRef>(CFDictionaryGetValue(window, kCGWindowLayer));
    int layer = 0;
    if (layerRef != nullptr) {
      CFNumberGetValue(layerRef, kCFNumberIntType, &layer);
    }
    if (layer != 0) {
      continue;
    }

    Napi::Object entry = Napi::Object::New(env);
    CFStringRef owner =
        static_cast<CFStringRef>(CFDictionaryGetValue(window, kCGWindowOwnerName));
    entry.Set("app", Napi::String::New(env, FromCFString(owner)));

    // kCGWindowName is withheld until Screen Recording is granted, so an empty title
    // here is a permission symptom rather than an untitled window.
    CFStringRef title = static_cast<CFStringRef>(CFDictionaryGetValue(window, kCGWindowName));
    entry.Set("title", Napi::String::New(env, FromCFString(title)));

    CFNumberRef pidRef =
        static_cast<CFNumberRef>(CFDictionaryGetValue(window, kCGWindowOwnerPID));
    int pid = 0;
    if (pidRef != nullptr) {
      CFNumberGetValue(pidRef, kCFNumberIntType, &pid);
    }
    entry.Set("pid", Napi::Number::New(env, pid));

    // The window server's own identifier for this window, which is what capture needs.
    // A pid is not enough: an application with four windows has one pid and four of
    // these, and capturing "the application" is not a thing the API offers.
    CFNumberRef numberRef =
        static_cast<CFNumberRef>(CFDictionaryGetValue(window, kCGWindowNumber));
    int windowId = 0;
    if (numberRef != nullptr) {
      CFNumberGetValue(numberRef, kCFNumberIntType, &windowId);
    }
    entry.Set("windowId", Napi::Number::New(env, windowId));

    CFDictionaryRef boundsDict =
        static_cast<CFDictionaryRef>(CFDictionaryGetValue(window, kCGWindowBounds));
    CGRect bounds = CGRectZero;
    if (boundsDict != nullptr && CGRectMakeWithDictionaryRepresentation(boundsDict, &bounds)) {
      entry.Set("bounds", RectToJs(env, bounds));
    }

    result.Set(result.Length(), entry);
  }

  CFRelease(windows);
  return result;
}

Napi::Value Native::queryTree(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!AXIsProcessTrusted()) {
    Napi::Error::New(env,
                     "Accessibility permission has not been granted, so the interface tree is "
                     "not readable. Grant it in System Settings > Privacy & Security > "
                     "Accessibility, then relaunch.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Budget budget;
  pid_t pid = 0;

  if (info.Length() > 0 && info[0].IsObject()) {
    Napi::Object options = info[0].As<Napi::Object>();
    if (options.Has("maxDepth") && options.Get("maxDepth").IsNumber()) {
      budget.maxDepth = options.Get("maxDepth").As<Napi::Number>().Int32Value();
    }
    if (options.Has("maxNodes") && options.Get("maxNodes").IsNumber()) {
      budget.maxNodes = options.Get("maxNodes").As<Napi::Number>().Int32Value();
    }
    if (options.Has("pid") && options.Get("pid").IsNumber()) {
      pid = options.Get("pid").As<Napi::Number>().Int32Value();
    }
  }

  @autoreleasepool {
    if (pid == 0) {
      NSRunningApplication* frontmost = [NSWorkspace sharedWorkspace].frontmostApplication;
      if (frontmost == nil) {
        Napi::Error::New(env, "No application is frontmost.").ThrowAsJavaScriptException();
        return env.Undefined();
      }
      pid = frontmost.processIdentifier;
    }

    // Querying our own tree is legal and occasionally the point — the overlay's UI is
    // a web page, and the design says the Screen Angel must be able to drive itself.
    AXUIElementRef application = AXUIElementCreateApplication(pid);
    if (application == nullptr) {
      Napi::Error::New(env, "Could not open an accessibility handle for that process.")
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }

    RequestAccessibilityTree(application);

    Napi::Array elements = Napi::Array::New(env);
    std::vector<int> path;
    Walk(env, elements, application, &path, 0, &budget, pid, AppNameForPid(pid));
    CFRelease(application);

    Napi::Object result = Napi::Object::New(env);
    result.Set("elements", elements);
    result.Set("visited", Napi::Number::New(env, budget.visited));
    result.Set("truncated", Napi::Boolean::New(env, budget.truncated));
    return result;
  }
}

Napi::Value Native::getElementAt(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::TypeError::New(env, "getElementAt expects two numbers: x and y in screen points.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }
  if (!AXIsProcessTrusted()) {
    Napi::Error::New(env, "Accessibility permission has not been granted.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  float x = info[0].As<Napi::Number>().FloatValue();
  float y = info[1].As<Napi::Number>().FloatValue();

  AXUIElementRef systemWide = AXUIElementCreateSystemWide();
  if (systemWide == nullptr) {
    return env.Null();
  }

  AXUIElementRef element = nullptr;
  AXError error = AXUIElementCopyElementAtPosition(systemWide, x, y, &element);
  CFRelease(systemWide);

  if (error != kAXErrorSuccess || element == nullptr) {
    return env.Null();
  }

  pid_t pid = 0;
  AXUIElementGetPid(element, &pid);

  @autoreleasepool {
    Napi::Object result = ElementToJs(env, element, {}, 0, pid, AppNameForPid(pid));
    CFRelease(element);
    return result;
  }
}

// CAPTURE
//
// ScreenCaptureKit is not a preference here, it is the only option: CGWindowListCreateImage
// was obsoleted in macOS 15 and no longer compiles, and the older CGDisplayCreateImage went
// the same way. Everything below is therefore gated at macOS 14, which is where
// SCScreenshotManager arrived.
//
// The API is asynchronous and this function is synchronous, which is deliberate. A capture
// completes in a few tens of milliseconds and the completion handler runs on a background
// queue, so waiting on a semaphore cannot deadlock against the caller's thread. Threading
// a promise all the way out to JavaScript would buy nothing at this duration and would
// make every call site asynchronous for no reason.

namespace {

// This file is compiled WITHOUT ARC, which matters more than usual here.
//
// The objects handed to these completion handlers are autoreleased on whatever queue the
// handler runs on. That pool drains as soon as the handler returns, which is before the
// waiting thread wakes up — so storing the pointer without retaining it yields a dangling
// pointer and a segmentation fault at first use. Retain inside the handler, autorelease on
// the way out, and the result lives until the caller's own pool drains.
//
// Nothing else in this file crosses a thread boundary, which is why nothing else needs it.

/** Blocks for a shareable-content enumeration. nil on timeout or refusal. */
SCShareableContent* ShareableContentSync(NSError** outError) {
  __block SCShareableContent* content = nil;
  __block NSError* error = nil;
  dispatch_semaphore_t done = dispatch_semaphore_create(0);

  [SCShareableContent getShareableContentExcludingDesktopWindows:NO
                                             onScreenWindowsOnly:YES
                                               completionHandler:^(SCShareableContent* result,
                                                                   NSError* failure) {
                                                 content = [result retain];
                                                 error = [failure retain];
                                                 dispatch_semaphore_signal(done);
                                               }];

  long timedOut =
      dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC));
  dispatch_release(done);
  if (timedOut != 0) {
    return nil;
  }

  if (outError != nullptr) {
    *outError = [error autorelease];
  } else {
    [error release];
  }
  return [content autorelease];
}

/** Blocks for one screenshot. Caller owns the returned image. */
CGImageRef CaptureSync(SCContentFilter* filter, SCStreamConfiguration* config, NSError** outError) {
  __block CGImageRef image = NULL;
  __block NSError* error = nil;
  dispatch_semaphore_t done = dispatch_semaphore_create(0);

  [SCScreenshotManager captureImageWithFilter:filter
                                configuration:config
                            completionHandler:^(CGImageRef result, NSError* failure) {
                              if (result != NULL) {
                                image = CGImageRetain(result);
                              }
                              error = [failure retain];
                              dispatch_semaphore_signal(done);
                            }];

  long timedOut =
      dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC));
  dispatch_release(done);
  if (timedOut != 0) {
    return NULL;
  }

  if (outError != nullptr) {
    *outError = [error autorelease];
  } else {
    [error release];
  }
  return image;
}

/** Encode to PNG or JPEG. Returns nil on failure rather than a half-written buffer. */
NSData* EncodeImage(CGImageRef image, bool jpeg, double quality) {
  NSMutableData* data = [NSMutableData data];
  CFStringRef type = jpeg ? (__bridge CFStringRef)UTTypeJPEG.identifier
                          : (__bridge CFStringRef)UTTypePNG.identifier;

  CGImageDestinationRef destination =
      CGImageDestinationCreateWithData((__bridge CFMutableDataRef)data, type, 1, NULL);
  if (destination == NULL) {
    return nil;
  }

  NSDictionary* properties =
      jpeg ? @{(__bridge NSString*)kCGImageDestinationLossyCompressionQuality : @(quality)} : @{};
  CGImageDestinationAddImage(destination, image, (__bridge CFDictionaryRef)properties);
  bool ok = CGImageDestinationFinalize(destination);
  CFRelease(destination);

  return ok ? data : nil;
}

}  // namespace

Napi::Value Native::captureImage(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (@available(macOS 14.0, *)) {
    // Fall through.
  } else {
    Napi::Error::New(env, "Screen capture needs macOS 14 or later.").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  // Preflighting rather than requesting: a capture that silently triggers a system
  // permission dialog is a capture that returns nothing and explains nothing.
  if (!CGPreflightScreenCaptureAccess()) {
    Napi::Error::New(env,
                     "Screen Recording permission has not been granted, so nothing can be "
                     "captured. Grant it in System Settings > Privacy & Security > Screen "
                     "Recording, then relaunch.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() == 0 || !info[0].IsObject()) {
    Napi::TypeError::New(env, "captureImage needs an options object.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Object options = info[0].As<Napi::Object>();
  const bool jpeg = options.Has("format") && options.Get("format").IsString() &&
                    options.Get("format").As<Napi::String>().Utf8Value() == "jpeg";
  const double quality = options.Has("quality") && options.Get("quality").IsNumber()
                             ? options.Get("quality").As<Napi::Number>().DoubleValue()
                             : 0.82;
  const double maxEdge = options.Has("maxEdge") && options.Get("maxEdge").IsNumber()
                             ? options.Get("maxEdge").As<Napi::Number>().DoubleValue()
                             : 0;

  @autoreleasepool {
    NSError* error = nil;
    SCShareableContent* content = ShareableContentSync(&error);
    if (content == nil) {
      std::string why = error != nil ? error.localizedDescription.UTF8String
                                     : "timed out enumerating shareable content";
      Napi::Error::New(env, "Could not enumerate what is capturable: " + why)
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }

    SCContentFilter* filter = nil;
    CGRect sourceRect = CGRectNull;

    if (options.Has("windowId") && options.Get("windowId").IsNumber()) {
      // Window capture, which is what excludes our own overlay from the picture: the
      // overlay is a different window, so a filter on the target cannot include it.
      CGWindowID wanted =
          static_cast<CGWindowID>(options.Get("windowId").As<Napi::Number>().Uint32Value());
      SCWindow* found = nil;
      for (SCWindow* window in content.windows) {
        if (window.windowID == wanted) {
          found = window;
          break;
        }
      }
      if (found == nil) {
        Napi::Error::New(env, "That window is not on screen, or is not capturable.")
            .ThrowAsJavaScriptException();
        return env.Undefined();
      }
      filter = [[[SCContentFilter alloc] initWithDesktopIndependentWindow:found] autorelease];
    } else {
      // Rectangle on a display. sourceRect is relative to the display's own origin, so a
      // global screen rectangle has to have that origin subtracted from it.
      SCDisplay* display = nil;
      if (options.Has("displayId") && options.Get("displayId").IsNumber()) {
        CGDirectDisplayID wanted = static_cast<CGDirectDisplayID>(
            options.Get("displayId").As<Napi::Number>().Uint32Value());
        for (SCDisplay* candidate in content.displays) {
          if (candidate.displayID == wanted) {
            display = candidate;
            break;
          }
        }
      }
      if (display == nil) {
        display = content.displays.firstObject;
      }
      if (display == nil) {
        Napi::Error::New(env, "No display is available to capture.").ThrowAsJavaScriptException();
        return env.Undefined();
      }

      filter = [[[SCContentFilter alloc] initWithDisplay:display excludingWindows:@[]] autorelease];

      if (options.Has("rect") && options.Get("rect").IsObject()) {
        Napi::Object rect = options.Get("rect").As<Napi::Object>();
        CGRect frame = display.frame;
        sourceRect = CGRectMake(rect.Get("x").As<Napi::Number>().DoubleValue() - frame.origin.x,
                                rect.Get("y").As<Napi::Number>().DoubleValue() - frame.origin.y,
                                rect.Get("width").As<Napi::Number>().DoubleValue(),
                                rect.Get("height").As<Napi::Number>().DoubleValue());
      }
    }

    SCStreamConfiguration* config = [[[SCStreamConfiguration alloc] init] autorelease];
    config.captureResolution = SCCaptureResolutionBest;
    config.showsCursor = NO;

    // Points, before any Retina scaling. The width and height below are what decides the
    // pixel count; sourceRect only decides what area those pixels cover.
    double wantedWidth = 0;
    double wantedHeight = 0;

    if (!CGRectIsNull(sourceRect)) {
      config.sourceRect = sourceRect;
      wantedWidth = sourceRect.size.width;
      wantedHeight = sourceRect.size.height;
    } else if (filter != nil) {
      wantedWidth = filter.contentRect.size.width;
      wantedHeight = filter.contentRect.size.height;
    }

    if (wantedWidth < 1 || wantedHeight < 1) {
      Napi::Error::New(env, "Nothing to capture: the requested area is empty.")
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }

    // Capture at the display's real pixel density, then let maxEdge decide whether to
    // ask for fewer. Downscaling here rather than after encoding is the whole point:
    // the bytes for the pixels we do not want are never produced.
    double scale = filter.pointPixelScale > 0 ? filter.pointPixelScale : 1.0;
    double pixelWidth = wantedWidth * scale;
    double pixelHeight = wantedHeight * scale;

    if (maxEdge > 0) {
      double longest = pixelWidth > pixelHeight ? pixelWidth : pixelHeight;
      if (longest > maxEdge) {
        double factor = maxEdge / longest;
        pixelWidth *= factor;
        pixelHeight *= factor;
      }
    }

    config.width = static_cast<size_t>(pixelWidth < 1 ? 1 : pixelWidth);
    config.height = static_cast<size_t>(pixelHeight < 1 ? 1 : pixelHeight);
    config.scalesToFit = YES;

    CGImageRef image = CaptureSync(filter, config, &error);
    if (image == NULL) {
      std::string why =
          error != nil ? error.localizedDescription.UTF8String : "the capture timed out";
      Napi::Error::New(env, "Capture failed: " + why).ThrowAsJavaScriptException();
      return env.Undefined();
    }

    NSData* encoded = EncodeImage(image, jpeg, quality);
    size_t producedWidth = CGImageGetWidth(image);
    size_t producedHeight = CGImageGetHeight(image);
    CGImageRelease(image);

    if (encoded == nil) {
      Napi::Error::New(env, "Captured the screen but could not encode the image.")
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }

    Napi::Object result = Napi::Object::New(env);
    result.Set("data", Napi::Buffer<uint8_t>::Copy(
                           env, static_cast<const uint8_t*>(encoded.bytes), encoded.length));
    result.Set("width", Napi::Number::New(env, static_cast<double>(producedWidth)));
    result.Set("height", Napi::Number::New(env, static_cast<double>(producedHeight)));
    result.Set("scale", Napi::Number::New(env, scale));
    result.Set("format", Napi::String::New(env, jpeg ? "jpeg" : "png"));
    return result;
  }
}

NODE_API_ADDON(Native)
