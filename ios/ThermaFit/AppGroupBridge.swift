import Foundation

/// Writes the widget snapshot JSON to the shared App Group UserDefaults so the
/// ThermaFitWidget WidgetKit extension can read it without opening the main app.
@objc(AppGroupBridge)
class AppGroupBridge: NSObject {
  @objc
  func setWidgetData(
    _ json: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    let defaults = UserDefaults(suiteName: "group.com.thermafit")
    defaults?.set(json, forKey: "thermafit_widget_snapshot")
    defaults?.synchronize()
    resolve(nil)
  }

  @objc static func requiresMainQueueSetup() -> Bool { return false }
}
