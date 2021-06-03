import AppKit
import Cocoa

//var sharedWindowId = UInt32(CommandLine.arguments[1])!;

@discardableResult
func runAppleScript(source: String) -> String? {
	NSAppleScript(source: source)?.executeAndReturnError(nil).stringValue
}


func toJson<T>(_ data: T) throws -> String {
	let json = try JSONSerialization.data(withJSONObject: data)
	return String(data: json, encoding: .utf8)!
}

func attribute<T>(element: AXUIElement, key: String, type: T.Type) -> T? {
	var value: AnyObject?
	let result = AXUIElementCopyAttributeValue(element, key as CFString, &value)

	guard
	  result == .success,
	  let typedValue = value as? T
	else {
	  return nil
	}

	return typedValue
}

func getActiveBrowserTabURLAppleScriptCommand(_ appName: String) -> String? {
	switch appName {
	case "Google Chrome", "Google Chrome Beta", "Google Chrome Dev", "Google Chrome Canary", "Brave Browser", "Brave Browser Beta", "Brave Browser Nightly", "Microsoft Edge", "Microsoft Edge Beta", "Microsoft Edge Dev", "Microsoft Edge Canary", "Ghost Browser", "Wavebox", "Sidekick", "Opera":
		return "tell app \"\(appName)\" to get the URL of active tab of front window"
	case "Safari":
		return "tell app \"Safari\" to get URL of front document"
	default:
		return nil
	}
}

func getAllWindows() -> String {
	
	// let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements, .optionIncludingWindow,.optionOnScreenAboveWindow], 
	// sharedWindowId) as! [[String: Any]]

	let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]

	var result = [[String: Any]]()

	for window in windows {

		// Skip transparent windows, like with Chrome.
		if (window[kCGWindowAlpha as String] as! Double) == 0 { // Documented to always exist.
			continue
		}

		let bounds = CGRect(dictionaryRepresentation: window[kCGWindowBounds as String] as! CFDictionary)!

		// Skip tiny windows, like the Chrome link hover statusbar.
		let minWinSize: CGFloat = 50
		if bounds.width < minWinSize || bounds.height < minWinSize {
			continue
		}

		let appPid = window[kCGWindowOwnerPID as String] as! pid_t

		// This can't fail as we're only dealing with apps.
		let app = NSRunningApplication(processIdentifier: appPid)!
		
		let appName = window[kCGWindowOwnerName as String] as! String

		let dict: [String: Any] = [
			"title": window[kCGWindowName as String] as? String ?? "",
			"id": 	window[kCGWindowNumber as String] as! Int,
			//"layer": window[kCGWindowLayer as String] as! Int,
			"bounds": [
				"x": bounds.origin.x,
				"y": bounds.origin.y,
				"width": bounds.width,
				"height": bounds.height
			],
			"owner": [
				"name": appName,
				"processId": appPid,
				"bundleId": app.bundleIdentifier!,
				//"path": app.bundleURL!.path
			],
			//"memoryUsage": window[kCGWindowMemoryUsage as String] as! Int
		]

		result.append(dict)

	}

	return (try! toJson(result))
}

func getActiveWindow() -> String {

	var result = [String: Any]()

	guard
		let frontmostAppPID = NSWorkspace.shared.frontmostApplication?.processIdentifier,
		let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]]
	else {
		
		return (try! toJson(result))
	}	

	for window in windows {

		let windowOwnerPID = window[kCGWindowOwnerPID as String] as! pid_t // Documented to always exist.
		
		if windowOwnerPID != frontmostAppPID {
			continue
		}

		// Skip transparent windows, like with Chrome.
		if (window[kCGWindowAlpha as String] as! Double) == 0 { // Documented to always exist.
			continue
		}

		let bounds = CGRect(dictionaryRepresentation: window[kCGWindowBounds as String] as! CFDictionary)!

		// Skip tiny windows, like the Chrome link hover statusbar.
		let minWinSize: CGFloat = 50
		if bounds.width < minWinSize || bounds.height < minWinSize {
			continue
		}

		let appPid = window[kCGWindowOwnerPID as String] as! pid_t

		// This can't fail as we're only dealing with apps.
		let app = NSRunningApplication(processIdentifier: appPid)!
		
		let appName = window[kCGWindowOwnerName as String] as! String

		result = [
			"title": window[kCGWindowName as String] as? String ?? "",
			"id": 	window[kCGWindowNumber as String] as! Int,
			//"layer": window[kCGWindowLayer as String] as! Int,
			"bounds": [
				"x": bounds.origin.x,
				"y": bounds.origin.y,
				"width": bounds.width,
				"height": bounds.height
			],
			"owner": [
				"name": appName,
				"processId": appPid,
				"bundleId": app.bundleIdentifier!,
				//"path": app.bundleURL!.path
			],
			//"memoryUsage": window[kCGWindowMemoryUsage as String] as! Int
		]

		// Only run the AppleScript if active window is a compatible browser.
		if
			let script = getActiveBrowserTabURLAppleScriptCommand(appName),
			let url = runAppleScript(source: script)
		{
			result["url"] = url
		}
	}

	return (try! toJson(result))
}

func getWindowBounds() -> String {

	var result = [String: Any]()

	let windowNumber = UInt32(CommandLine.arguments[2])!;

	guard
		let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]],
      	let window = (windows.first { $0[kCGWindowNumber as String] as! Int == windowNumber })
    else {
      return (try! toJson(result))
    }

	let bounds = CGRect(dictionaryRepresentation: window[kCGWindowBounds as String] as! CFDictionary)!

	result = [
		"id": 	window[kCGWindowNumber as String] as! Int,
		"bounds": [
			"x": bounds.origin.x,
			"y": bounds.origin.y,
			"width": bounds.width,
			"height": bounds.height
		]
	]

	return (try! toJson(result))
}

func focusWindow() -> String {

	let result = [String: Any]()

	let windowNumber = UInt32(CommandLine.arguments[2])!;

	guard
		let windowList = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]],
      	let cgWindow = (windowList.first { $0[kCGWindowNumber as String] as! Int == windowNumber })
    else {
      return (try! toJson(result))
    }

     let ownerPID = cgWindow[kCGWindowOwnerPID as String] as! Int

    let maybeIndex = windowList
      .filter { $0[kCGWindowOwnerPID as String] as! Int == ownerPID }
      .firstIndex { $0[kCGWindowNumber as String] as! Int == windowNumber }

  	guard
      let axWindows = attribute(
        element: AXUIElementCreateApplication(pid_t(ownerPID)),
        key: kAXWindowsAttribute,
        type: [AXUIElement].self
      ),
      let index = maybeIndex,
      axWindows.count > index,
      let app = NSRunningApplication(processIdentifier: pid_t(ownerPID))
    else {
      return (try! toJson(result))
    }

    let axWindow = axWindows[index]
    app.activate(options: [.activateIgnoringOtherApps])
    AXUIElementPerformAction(axWindow, kAXRaiseAction as CFString)

    return (try! toJson(result))
}

var method = CommandLine.arguments[1];

if(method == "active-window") {
	
	print(getActiveWindow())	

} else if (method == "all-windows") {
	
	print(getAllWindows())

} else if (method == "window-bounds") {
	
	print(getWindowBounds())

} else if (method == "focus-window") {
	
	print(focusWindow())
}

exit(0)
