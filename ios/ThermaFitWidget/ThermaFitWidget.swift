import WidgetKit
import SwiftUI

// MARK: - Data model (mirrors WidgetSnapshot JSON from JS side)

struct WidgetLayer: Codable {
    let emoji: String
    let label: String
}

struct WidgetSuggestion: Codable {
    let layers: [WidgetLayer]
    let personalFeelsLike: Double
    let showUmbrellaTip: Bool
}

struct WidgetWeather: Codable {
    let tempC: Double
    let condition: String
    let cityName: String
    let fetchedAt: Double
}

struct WidgetPreferences: Codable {
    let units: String
}

struct WidgetSnapshot: Codable {
    let weather: WidgetWeather
    let suggestion: WidgetSuggestion
    let preferences: WidgetPreferences
}

// MARK: - Timeline entry

struct ThermaFitEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot?
}

// MARK: - Timeline provider

struct ThermaFitProvider: TimelineProvider {
    let appGroupID = "group.com.thermafit"
    let storageKey = "thermafit_widget_snapshot"

    func placeholder(in context: Context) -> ThermaFitEntry {
        ThermaFitEntry(date: Date(), snapshot: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (ThermaFitEntry) -> Void) {
        completion(ThermaFitEntry(date: Date(), snapshot: loadSnapshot()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ThermaFitEntry>) -> Void) {
        let entry = ThermaFitEntry(date: Date(), snapshot: loadSnapshot())
        // Refresh every 30 minutes
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextRefresh))
        completion(timeline)
    }

    private func loadSnapshot() -> WidgetSnapshot? {
        guard
            let defaults = UserDefaults(suiteName: appGroupID),
            let raw = defaults.string(forKey: storageKey),
            let data = raw.data(using: .utf8)
        else { return nil }

        return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    }
}

// MARK: - Widget

@main
struct ThermaFitWidgetBundle: Widget {
    let kind = "ThermaFitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ThermaFitProvider()) { entry in
            ThermaFitWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("ThermaFit")
        .description("See your personalised weather layers at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
