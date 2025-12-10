import UIKit
import Capacitor
import WebKit
import AVFoundation

class CustomBridgeViewController: CAPBridgeViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Configure audio session for recording
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
            try audioSession.setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
        }
    }
    
    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let configuration = super.webViewConfiguration(for: instanceConfiguration)
        
        // Enable camera and microphone access
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // Enable getUserMedia support for audio and video
        if #available(iOS 14.3, *) {
            configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        }
        
        // CRITICAL: Enable media capture
        configuration.setValue(true, forKey: "allowsInlineMediaPlayback")
        configuration.setValue(false, forKey: "_requiresUserActionForMediaPlayback")
        
        return configuration
    }
    
    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        let webView = super.webView(with: frame, configuration: configuration)
        
        // Additional webView configuration
        webView.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        
        // Enable media devices
        if #available(iOS 15.0, *) {
            webView.configuration.preferences.setValue(true, forKey: "mediaDevicesEnabled")
            webView.configuration.preferences.setValue(true, forKey: "mockCaptureDevicesEnabled")
        }
        
        return webView
    }
}
