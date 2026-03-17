import SwiftUI
import WidgetKit

struct ThermaFitWidgetView: View {
    var entry: ThermaFitEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if let snapshot = entry.snapshot {
            SnapshotView(snapshot: snapshot, family: family)
        } else {
            PlaceholderView()
        }
    }
}

// MARK: - Snapshot view

struct SnapshotView: View {
    let snapshot: WidgetSnapshot
    let family: WidgetFamily

    private var feelsLike: String {
        let c = snapshot.suggestion.personalFeelsLike
        if snapshot.preferences.units == "imperial" {
            return "\(Int(c * 9 / 5 + 32))°F"
        }
        return "\(Int(c))°C"
    }

    private var updatedAt: String {
        let date = Date(timeIntervalSince1970: snapshot.weather.fetchedAt / 1000)
        let fmt = DateFormatter()
        fmt.timeStyle = .short
        return fmt.string(from: date)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Header
            HStack {
                Text("ThermaFit")
                    .font(.caption2.bold())
                    .foregroundColor(.blue)
                Spacer()
                Text(updatedAt)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            // Location + temp
            HStack(spacing: 4) {
                Text("📍 \(snapshot.weather.cityName)")
                    .font(.caption)
                Text("·  \(Int(snapshot.weather.tempC))°C")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Personal feels like
            Text("Feels like \(feelsLike) for you")
                .font(.caption2)
                .foregroundColor(.blue)

            // Umbrella tip
            if snapshot.suggestion.showUmbrellaTip {
                Text("🌂 Rain later")
                    .font(.caption2)
                    .foregroundColor(.blue)
            }

            Spacer(minLength: 2)

            // Layers
            let displayLayers = family == .systemSmall
                ? Array(snapshot.suggestion.layers.prefix(2))
                : Array(snapshot.suggestion.layers.prefix(4))

            ForEach(Array(displayLayers.enumerated()), id: \.offset) { _, layer in
                Text("\(layer.emoji) \(layer.label)")
                    .font(.caption)
                    .lineLimit(1)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(red: 0.1, green: 0.1, blue: 0.17))
    }
}

// MARK: - Placeholder

struct PlaceholderView: View {
    var body: some View {
        VStack(spacing: 6) {
            Text("ThermaFit")
                .font(.caption.bold())
                .foregroundColor(.blue)
            Text("Open app to load weather")
                .font(.caption2)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.1, green: 0.1, blue: 0.17))
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    ThermaFitWidgetBundle()
} timeline: {
    ThermaFitEntry(date: .now, snapshot: nil)
}
