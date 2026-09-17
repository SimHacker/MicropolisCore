#include "Native.hpp"

#include <psapi.h>

#include <string>
#include <vector>

namespace {

struct Budget {
  int maxDepth = 12;
  int maxNodes = 4000;
  int visited = 0;
  bool truncated = false;
};

std::string FromWide(const wchar_t* value) {
  if (value == nullptr || *value == L'\0') {
    return {};
  }
  int length = WideCharToMultiByte(CP_UTF8, 0, value, -1, nullptr, 0, nullptr, nullptr);
  if (length <= 1) {
    return {};
  }
  std::string result(static_cast<size_t>(length - 1), '\0');
  WideCharToMultiByte(CP_UTF8, 0, value, -1, result.data(), length, nullptr, nullptr);
  return result;
}

std::string TakeBstr(BSTR value) {
  std::string result = FromWide(value);
  if (value != nullptr) {
    SysFreeString(value);
  }
  return result;
}

Napi::Object RectToJs(Napi::Env env, const RECT& rect) {
  Napi::Object object = Napi::Object::New(env);
  object.Set("x", Napi::Number::New(env, rect.left));
  object.Set("y", Napi::Number::New(env, rect.top));
  object.Set("width", Napi::Number::New(env, rect.right - rect.left));
  object.Set("height", Napi::Number::New(env, rect.bottom - rect.top));
  return object;
}

Napi::Array PathToJs(Napi::Env env, const std::vector<int>& path) {
  Napi::Array array = Napi::Array::New(env, path.size());
  for (size_t i = 0; i < path.size(); i++) {
    array.Set(static_cast<uint32_t>(i), Napi::Number::New(env, path[i]));
  }
  return array;
}

/** Executable file name for a process id, without the directory. Used as the app name
 *  so that selectors written against 'Sims.exe' keep working wherever it is installed. */
std::string ProcessName(DWORD pid) {
  HANDLE process =
      OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pid);
  if (process == nullptr) {
    return {};
  }
  wchar_t buffer[MAX_PATH] = {0};
  DWORD size = MAX_PATH;
  std::string name;
  if (QueryFullProcessImageNameW(process, 0, buffer, &size)) {
    std::wstring full(buffer, size);
    size_t slash = full.find_last_of(L"\\/");
    name = FromWide(slash == std::wstring::npos ? full.c_str() : full.c_str() + slash + 1);
  }
  CloseHandle(process);
  return name;
}

std::string WindowTitle(HWND window) {
  int length = GetWindowTextLengthW(window);
  if (length <= 0) {
    return {};
  }
  std::wstring buffer(static_cast<size_t>(length) + 1, L'\0');
  GetWindowTextW(window, buffer.data(), length + 1);
  return FromWide(buffer.c_str());
}

Napi::Object WindowToJs(Napi::Env env, HWND window) {
  DWORD pid = 0;
  GetWindowThreadProcessId(window, &pid);

  Napi::Object object = Napi::Object::New(env);
  object.Set("app", Napi::String::New(env, ProcessName(pid)));
  object.Set("title", Napi::String::New(env, WindowTitle(window)));
  object.Set("pid", Napi::Number::New(env, static_cast<double>(pid)));

  RECT rect = {0, 0, 0, 0};
  if (GetWindowRect(window, &rect)) {
    object.Set("bounds", RectToJs(env, rect));
  }
  return object;
}

/**
 * The value of an element, where it has one. UIA hides this behind a pattern rather
 * than a property, so a control with no ValuePattern simply has no value — which is
 * different from having an empty one, and the selector language treats it that way.
 */
bool ElementValue(IUIAutomationElement* element, std::string* out) {
  IUIAutomationValuePattern* pattern = nullptr;
  if (FAILED(element->GetCurrentPatternAs(UIA_ValuePatternId, IID_PPV_ARGS(&pattern))) ||
      pattern == nullptr) {
    return false;
  }
  BSTR value = nullptr;
  bool ok = false;
  if (SUCCEEDED(pattern->get_CurrentValue(&value))) {
    *out = TakeBstr(value);
    ok = true;
  }
  pattern->Release();
  return ok;
}

Napi::Object ElementToJs(Napi::Env env, IUIAutomationElement* element,
                         const std::vector<int>& path, int depth, const std::string& app,
                         DWORD pid) {
  Napi::Object object = Napi::Object::New(env);

  // The control type id, as a decimal string. The localized name is deliberately not
  // used: it changes with the user's display language, and a selector that only works
  // in English is not a selector.
  CONTROLTYPEID controlType = 0;
  if (FAILED(element->get_CurrentControlType(&controlType))) {
    controlType = UIA_CustomControlTypeId;
  }
  object.Set("nativeRole", Napi::String::New(env, std::to_string(controlType)));

  BSTR name = nullptr;
  if (SUCCEEDED(element->get_CurrentName(&name))) {
    std::string text = TakeBstr(name);
    if (!text.empty()) {
      object.Set("name", Napi::String::New(env, text));
    }
  }

  std::string value;
  if (ElementValue(element, &value)) {
    object.Set("value", Napi::String::New(env, value));
  }

  BOOL flag = FALSE;
  if (SUCCEEDED(element->get_CurrentIsEnabled(&flag))) {
    object.Set("enabled", Napi::Boolean::New(env, flag != FALSE));
  }
  if (SUCCEEDED(element->get_CurrentHasKeyboardFocus(&flag))) {
    object.Set("focused", Napi::Boolean::New(env, flag != FALSE));
  }

  RECT rect = {0, 0, 0, 0};
  if (SUCCEEDED(element->get_CurrentBoundingRectangle(&rect))) {
    object.Set("bounds", RectToJs(env, rect));
  }

  object.Set("depth", Napi::Number::New(env, depth));
  object.Set("path", PathToJs(env, path));
  object.Set("pid", Napi::Number::New(env, static_cast<double>(pid)));
  if (!app.empty()) {
    object.Set("app", Napi::String::New(env, app));
  }
  // Overwritten by the walker once the children have actually been counted.
  object.Set("childCount", Napi::Number::New(env, 0));
  return object;
}

void Walk(Napi::Env env, Napi::Array& out, IUIAutomationTreeWalker* walker,
          IUIAutomationElement* element, std::vector<int>* path, int depth, Budget* budget,
          const std::string& app, DWORD pid) {
  if (budget->visited >= budget->maxNodes) {
    budget->truncated = true;
    return;
  }
  budget->visited++;

  Napi::Object node = ElementToJs(env, element, *path, depth, app, pid);
  out.Set(out.Length(), node);

  IUIAutomationElement* child = nullptr;
  if (FAILED(walker->GetFirstChildElement(element, &child)) || child == nullptr) {
    return;
  }

  if (depth >= budget->maxDepth) {
    budget->truncated = true;
    child->Release();
    return;
  }

  int index = 0;
  while (child != nullptr) {
    if (budget->visited >= budget->maxNodes) {
      budget->truncated = true;
      child->Release();
      break;
    }

    path->push_back(index);
    Walk(env, out, walker, child, path, depth + 1, budget, app, pid);
    path->pop_back();
    index++;

    IUIAutomationElement* sibling = nullptr;
    if (FAILED(walker->GetNextSiblingElement(child, &sibling))) {
      sibling = nullptr;
    }
    child->Release();
    child = sibling;
  }

  node.Set("childCount", Napi::Number::New(env, index));
}

/** First visible top-level window belonging to a process. */
HWND MainWindowForPid(DWORD pid) {
  struct Search {
    DWORD pid;
    HWND found;
  } search{pid, nullptr};

  EnumWindows(
      [](HWND window, LPARAM param) -> BOOL {
        auto* search = reinterpret_cast<Search*>(param);
        DWORD owner = 0;
        GetWindowThreadProcessId(window, &owner);
        if (owner != search->pid || !IsWindowVisible(window) ||
            GetWindow(window, GW_OWNER) != nullptr) {
          return TRUE;
        }
        search->found = window;
        return FALSE;
      },
      reinterpret_cast<LPARAM>(&search));

  return search.found;
}

}  // namespace

Native::Native(Napi::Env env, Napi::Object exports) {
  // Electron may already have put this thread in an apartment. RPC_E_CHANGED_MODE
  // means exactly that, and is not a failure: COM is up, just not on our terms.
  HRESULT initialized = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
  mOwnsCom = SUCCEEDED(initialized);

  if (FAILED(CoCreateInstance(CLSID_CUIAutomation, nullptr, CLSCTX_INPROC_SERVER,
                              IID_PPV_ARGS(&mAutomation)))) {
    mAutomation = nullptr;
  }

  DefineAddon(exports, {
    InstanceMethod("checkPermissions", &Native::checkPermissions),
    InstanceMethod("requestPermissions", &Native::requestPermissions),
    InstanceMethod("getFocusedWindow", &Native::getFocusedWindow),
    InstanceMethod("getOpenWindows", &Native::getOpenWindows),
    InstanceMethod("queryTree", &Native::queryTree),
    InstanceMethod("getElementAt", &Native::getElementAt),
  });
}

Native::~Native() {
  if (mAutomation != nullptr) {
    mAutomation->Release();
    mAutomation = nullptr;
  }
  if (mOwnsCom) {
    CoUninitialize();
  }
}

Napi::Value Native::checkPermissions(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Object result = Napi::Object::New(env);
  result.Set("accessibility", Napi::String::New(env, "granted"));
  result.Set("screenCapture", Napi::String::New(env, "granted"));
  return result;
}

Napi::Value Native::requestPermissions(const Napi::CallbackInfo& info) {
  return info.Env().Undefined();
}

Napi::Value Native::getFocusedWindow(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  HWND window = GetForegroundWindow();
  if (window == nullptr) {
    return env.Null();
  }
  return WindowToJs(env, window);
}

Napi::Value Native::getOpenWindows(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Array result = Napi::Array::New(env);

  struct Collector {
    Napi::Env env;
    Napi::Array* out;
  } collector{env, &result};

  EnumWindows(
      [](HWND window, LPARAM param) -> BOOL {
        auto* collector = reinterpret_cast<Collector*>(param);

        // Only real top-level windows: visible, unowned, and titled. Tool windows and
        // the invisible message-only windows every process keeps would swamp the list.
        if (!IsWindowVisible(window) || GetWindow(window, GW_OWNER) != nullptr) {
          return TRUE;
        }
        if (GetWindowTextLengthW(window) == 0) {
          return TRUE;
        }
        collector->out->Set(collector->out->Length(), WindowToJs(collector->env, window));
        return TRUE;
      },
      reinterpret_cast<LPARAM>(&collector));

  return result;
}

Napi::Value Native::queryTree(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (mAutomation == nullptr) {
    Napi::Error::New(env, "UI Automation is unavailable; the addon could not create a client.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Budget budget;
  DWORD pid = 0;

  if (info.Length() > 0 && info[0].IsObject()) {
    Napi::Object options = info[0].As<Napi::Object>();
    if (options.Has("maxDepth") && options.Get("maxDepth").IsNumber()) {
      budget.maxDepth = options.Get("maxDepth").As<Napi::Number>().Int32Value();
    }
    if (options.Has("maxNodes") && options.Get("maxNodes").IsNumber()) {
      budget.maxNodes = options.Get("maxNodes").As<Napi::Number>().Int32Value();
    }
    if (options.Has("pid") && options.Get("pid").IsNumber()) {
      pid = static_cast<DWORD>(options.Get("pid").As<Napi::Number>().Int64Value());
    }
  }

  HWND window = pid == 0 ? GetForegroundWindow() : MainWindowForPid(pid);
  if (window == nullptr) {
    Napi::Error::New(env, "No visible top-level window to read.").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  if (pid == 0) {
    GetWindowThreadProcessId(window, &pid);
  }

  IUIAutomationElement* root = nullptr;
  if (FAILED(mAutomation->ElementFromHandle(window, &root)) || root == nullptr) {
    // An elevated target is the usual cause: an unelevated client is refused outright
    // rather than given a partial tree.
    Napi::Error::New(env,
                     "Could not read that window's interface. If it belongs to an elevated "
                     "process, Screen Angel has to be elevated too.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  IUIAutomationTreeWalker* walker = nullptr;
  if (FAILED(mAutomation->get_ControlViewWalker(&walker)) || walker == nullptr) {
    root->Release();
    Napi::Error::New(env, "UI Automation returned no tree walker.").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Array elements = Napi::Array::New(env);
  std::vector<int> path;
  Walk(env, elements, walker, root, &path, 0, &budget, ProcessName(pid), pid);

  walker->Release();
  root->Release();

  Napi::Object result = Napi::Object::New(env);
  result.Set("elements", elements);
  result.Set("visited", Napi::Number::New(env, budget.visited));
  result.Set("truncated", Napi::Boolean::New(env, budget.truncated));
  return result;
}

Napi::Value Native::getElementAt(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::TypeError::New(env, "getElementAt expects two numbers: x and y in screen pixels.")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }
  if (mAutomation == nullptr) {
    Napi::Error::New(env, "UI Automation is unavailable.").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  POINT point;
  point.x = info[0].As<Napi::Number>().Int32Value();
  point.y = info[1].As<Napi::Number>().Int32Value();

  IUIAutomationElement* element = nullptr;
  if (FAILED(mAutomation->ElementFromPoint(point, &element)) || element == nullptr) {
    return env.Null();
  }

  int pid = 0;
  element->get_CurrentProcessId(&pid);

  Napi::Object result =
      ElementToJs(env, element, {}, 0, ProcessName(static_cast<DWORD>(pid)),
                  static_cast<DWORD>(pid));
  element->Release();
  return result;
}

NODE_API_ADDON(Native)
