import Flutter
import GoogleMaps
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // The key comes from ios/Flutter/Secrets.xcconfig (git-ignored). Without it the app uses the mock map.
    if AppDelegate.hasMapsKey {
      GMSServices.provideAPIKey(Bundle.main.object(forInfoDictionaryKey: "GMSApiKey") as! String)
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  static var hasMapsKey: Bool {
    guard let key = Bundle.main.object(forInfoDictionaryKey: "GMSApiKey") as? String else { return false }
    return !key.isEmpty && !key.hasPrefix("$(")
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
    // The Dart side asks before creating a Google map: a map without GMSServices' key crashes on iOS.
    let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "JazlahMaps")!
    FlutterMethodChannel(name: "jazlah/maps", binaryMessenger: registrar.messenger())
      .setMethodCallHandler { call, result in
        result(call.method == "hasKey" ? AppDelegate.hasMapsKey : FlutterMethodNotImplemented)
      }
  }
}
