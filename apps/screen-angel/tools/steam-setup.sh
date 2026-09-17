#!/usr/bin/env bash
#
# Get Screen Angel talking to Steam, on a machine that has never done it.
#
# This checks the four things that have to be true and, for each one that is not, says
# what to do about it. It does not download anything: Valve's SDK is behind a clickthrough
# agreement, and a script that pretends to accept an agreement on your behalf is a script
# that lied about a contract you are party to.

set -uo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_DIR="${SCREEN_ANGEL_STEAM_SDK:-$APP_DIR/steamworks_sdk}"
APP_ID="${SCREEN_ANGEL_STEAM_APPID:-480}"

pass() { printf '  \033[32mok\033[0m    %s\n' "$1"; }
fail() { printf '  \033[31mno\033[0m    %s\n' "$1"; }
note() { printf '        %s\n' "$1"; }

# --install <zip> puts a downloaded SDK where it belongs.
#
# Three steps, one of which is invisible until it bites: the zip nests everything under
# 'sdk', and macOS marks anything a browser downloaded with com.apple.quarantine — which
# travels to the dylib inside, where it becomes a dlopen failure rather than a download
# problem. Doing this by hand works fine and gets forgotten by the next machine.
if [ "${1:-}" = "--install" ]; then
	zip="${2:-}"
	if [ -z "$zip" ] || [ ! -f "$zip" ]; then
		echo "usage: $0 --install /path/to/steamworks_sdk_164.zip" >&2
		exit 2
	fi

	staging="$(mktemp -d)"
	trap 'rm -rf "$staging"' EXIT

	echo "Unpacking $zip"
	unzip -q "$zip" -d "$staging" || { echo "unzip failed" >&2; exit 1; }

	# Tolerate both shapes: a top-level 'sdk' directory, or the contents directly.
	if [ -d "$staging/sdk/redistributable_bin" ]; then
		source_dir="$staging/sdk"
	elif [ -d "$staging/redistributable_bin" ]; then
		source_dir="$staging"
	else
		echo "No redistributable_bin in that zip — is it really the Steamworks SDK?" >&2
		exit 1
	fi

	if [ -e "$SDK_DIR" ]; then
		echo "Replacing the existing $SDK_DIR"
		rm -rf "$SDK_DIR"
	fi
	mv "$source_dir" "$SDK_DIR"

	if command -v xattr >/dev/null 2>&1; then
		xattr -dr com.apple.quarantine "$SDK_DIR" 2>/dev/null && echo "Cleared quarantine"
	fi
	echo "Installed to $SDK_DIR"
	echo
fi

problems=0

echo
echo "Screen Angel — Steam setup check"
echo

# 1. The Steam client itself. Nothing works without one running, because the API is a
#    thin shim that talks to the client over local IPC.
echo "Steam client"
if [ -d /Applications/Steam.app ] || command -v steam >/dev/null 2>&1; then
	pass "installed"
	if pgrep -x steam_osx >/dev/null 2>&1 || pgrep -x steam >/dev/null 2>&1; then
		pass "running"
	else
		fail "not running — start it and sign in; the API is a shim over the client"
		problems=$((problems + 1))
	fi
else
	fail "not installed — https://store.steampowered.com/about/"
	problems=$((problems + 1))
fi

# 2. Which binding is in play, because the answer changes what else has to be true.
#
# steam-bridge ships the native addon and Valve's matching library together, so it needs
# no SDK at all. steamworks-ffi-node calls Valve's library through FFI, so it needs the SDK
# on disk — and needs the RIGHT version of it.
LIB="${SCREEN_ANGEL_STEAM_LIB:-bridge}"
echo
echo "Node binding  (SCREEN_ANGEL_STEAM_LIB=$LIB)"

case "$LIB" in
bridge)
	PACKAGE="$APP_DIR/node_modules/steam-bridge"
	if [ -d "$PACKAGE" ]; then
		pass "steam-bridge installed"
	else
		fail "steam-bridge missing — run: pnpm install"
		problems=$((problems + 1))
	fi

	# The prebuilt addon is per platform-arch, and there is no fallback: an Intel Mac or
	# a Linux arm64 box has nothing to load, which surfaces as a module resolution error
	# at the first Steam call rather than at install time.
	case "$(uname -s)-$(uname -m)" in
	Darwin-arm64) ADDON="steam_bridge_native.darwin-arm64.node" ;;
	Linux-x86_64) ADDON="steam_bridge_native.linux-x64-gnu.node" ;;
	*) ADDON="" ;;
	esac

	if [ -z "$ADDON" ]; then
		fail "no prebuilt addon for $(uname -s)-$(uname -m)"
		note "steam-bridge ships darwin-arm64, linux-x64-gnu and win32-x64-msvc only."
		note "Use SCREEN_ANGEL_STEAM_LIB=ffi with the SDK instead."
		problems=$((problems + 1))
	elif [ -f "$PACKAGE/$ADDON" ]; then
		pass "$ADDON"
		BRIDGE_DYLIB="$PACKAGE/libsteam_api.dylib"
	else
		fail "$ADDON not in the package"
		problems=$((problems + 1))
	fi

	# The SDK is not required on this path. Say so, because the previous paragraph of
	# this script used to demand it and someone will remember that.
	if [ -d "$SDK_DIR/redistributable_bin" ]; then
		note "(an SDK is also present in $SDK_DIR — unused by steam-bridge)"
	else
		note "(no SDK needed: steam-bridge carries Valve's library itself)"
	fi
	;;

ffi)
	if [ -d "$APP_DIR/node_modules/steamworks-ffi-node" ]; then
		pass "steamworks-ffi-node installed"
	else
		fail "steamworks-ffi-node missing — run: pnpm install"
		problems=$((problems + 1))
	fi

	echo
	echo "Steamworks SDK  (required for this binding; looking in $SDK_DIR)"
	if [ -d "$SDK_DIR/redistributable_bin" ]; then
		pass "found redistributable_bin"
		for lib in osx/libsteam_api.dylib win64/steam_api64.dll linux64/libsteam_api.so; do
			if [ -f "$SDK_DIR/redistributable_bin/$lib" ]; then
				pass "$lib"
			else
				note "(missing $lib — fine unless you build for that platform)"
			fi
		done
	else
		fail "not here"
		note "Any Steam account can get it, free, without becoming a partner:"
		note "  1. Sign in at https://partner.steamgames.com/documentation/sdk_access_agreement"
		note "  2. Accept the Steamworks SDK Access Agreement"
		note "  3. Download version 1.64 — NOT the latest, see STEAMWORKS.yml:"
		note "     https://partner.steamgames.com/downloads/steamworks_sdk_164.zip"
		note "  4. $0 --install ~/Downloads/steamworks_sdk_164.zip"
		problems=$((problems + 1))
	fi
	;;

*)
	fail "unknown SCREEN_ANGEL_STEAM_LIB '$LIB' — expected 'bridge' or 'ffi'"
	problems=$((problems + 1))
	;;
esac

# 4. Do the library and the SDK agree?
#
# This is the check worth having. Valve bumps interface versions — SteamUtils went from
# v010 to v011 in SDK 1.65 — and a binding built against an older SDK asks the dylib for a
# symbol that is no longer there. The library reports that as init() returning false,
# which is indistinguishable from "Steam is not running" and from "you do not own this
# app". It cost most of an evening once. Comparing the symbols the library names against
# the symbols the dylib exports answers it in a second, and finds the mismatches that do
# NOT block startup — the ones that would otherwise surface months later as a feature
# that quietly never worked.
echo
echo "Binding vs Valve library symbols"

# Which pair are we comparing? For steam-bridge, the addon's undefined symbols against the
# dylib it ships beside itself. For the FFI binding, the symbol names appearing in its
# JavaScript against the dylib in the SDK you supplied.
if [ "$LIB" = "bridge" ]; then
	DYLIB="${BRIDGE_DYLIB:-}"
	SYMBOL_SOURCE="${PACKAGE:-}/${ADDON:-}"
else
	DYLIB="$SDK_DIR/redistributable_bin/osx/libsteam_api.dylib"
	SYMBOL_SOURCE="$APP_DIR/node_modules/steamworks-ffi-node/dist"
fi

if ! command -v nm >/dev/null 2>&1; then
	note "(skipped: no nm on this machine)"
elif [ -z "$DYLIB" ] || [ ! -f "$DYLIB" ] || [ ! -e "$SYMBOL_SOURCE" ]; then
	note "(skipped: need both the binding and a Valve library present)"
else
	wanted="$(mktemp)"; available="$(mktemp)"; missing="$(mktemp)"
	trap 'rm -f "$wanted" "$available" "$missing"' EXIT

	if [ -d "$SYMBOL_SOURCE" ]; then
		# The FFI binding names symbols as strings in its JavaScript.
		find "$SYMBOL_SOURCE" -name '*.js' -exec \
			grep -oh 'SteamAPI_[A-Za-z0-9_]*' {} + 2>/dev/null | sort -u > "$wanted"
	else
		# A compiled addon states its needs honestly, as undefined symbols.
		nm -u "$SYMBOL_SOURCE" 2>/dev/null |
			grep -oh 'SteamAPI_[A-Za-z0-9_]*' | sort -u > "$wanted"
	fi
	nm -gU "$DYLIB" 2>/dev/null | grep -oh 'SteamAPI_[A-Za-z0-9_]*' | sort -u > "$available"
	comm -23 "$wanted" "$available" > "$missing"

	count=$(wc -l < "$missing" | tr -d ' ')
	if [ "$count" = "0" ]; then
		pass "all $(wc -l < "$wanted" | tr -d ' ') symbols the binding needs are present"
	else
		fail "$count symbol(s) the binding needs are absent from that library"
		while read -r symbol; do
			# Show what the SDK has instead, which is the whole diagnosis: a bumped
			# version number beside the one being asked for.
			base="$(printf '%s' "$symbol" | sed 's/_v[0-9]*$//')"
			instead="$(grep "^${base}_v[0-9]*$" "$available" | tr '\n' ' ')"
			if [ -n "$instead" ]; then
				note "$symbol  ->  SDK has: $instead"
			else
				note "$symbol  ->  removed in this SDK"
			fi
		done < "$missing"
		note "The binding is built against a particular SDK. Match it, or expect these to fail"
		note "at the moment they are first called — which for init() is startup, and for"
		note "everything else is whenever you happen to use that feature."
		problems=$((problems + 1))
	fi
fi

# 4. Which app we claim to be. 480 is Spacewar and needs no money and no paperwork; it
#    does need to be in the signed-in account's library, which is free.
echo
echo "App ID"
if [ "$APP_ID" = "480" ]; then
	pass "480 (Spacewar) — the free development sandbox"
	note "Your Steam account has to own it. It is free: open steam://install/480"
	note "Override with SCREEN_ANGEL_STEAM_APPID once you have your own."
else
	pass "$APP_ID (from SCREEN_ANGEL_STEAM_APPID)"
fi

echo
if [ "$problems" -eq 0 ]; then
	echo "All good. Start the app and run:  ./cli/screen-angel info"
	echo "It reports steam.available, your persona name, and the app id it initialised with."
else
	echo "$problems thing(s) to fix, above. Re-run this when you have."
fi
echo
exit 0
