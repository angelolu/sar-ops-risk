
# Background
This repo contains the Risk and Ops apps, developed by California Search and Rescue.

The Risk app helps teams proactively identify and mitigate operational risk. It guides the user through two tools:
- Operational Risk Management Analysis (ORMA): A structured framework to assess potential threats and guide informed decision-making.
- Severity, Probability, Exposure (SPE) Analysis: Evaluate the potential impact and likelihood of risks, allowing you to prioritize mitigation strategies.

It's made with search and rescue in mind as a replacement for the now-defunct NPS Risk app.

The Ops app is used for overhead management during a search operation. Features currently include:
- Radio logging with presets and the ability to export ICS 309, SAR 133 PDFs and CSVs.
- Dashboard showing the assignment and status of teams, and the time since last contact.
- Support for receipt printers as a persistent offline log in case of power/software failure.

They both use Expo and Expo App Services to support Android, iOS and web.

# Update architecture
This app uses two different types of updates:

1. Updates through app stores.
2. Updates through EAS Update. These get downloaded when the user opens the app while they have a network connection. The update will get applied the next time the app is relaunched. This can only happen if the underlying app runtime version has not changed.

## Expo Configuration
The Expo `preview` channel is used by native apps built using the `preview` and `development` profile by EAS Build.

The Expo `production` channel is used by native apps built using the `production` profile by EAS Build. These builds can be submitted to the Google Play Store using the `production` profile of EAS Submit automatically in the Expo UI. iOS builds need to be built and submitted using the CLI manually.

## Automations
### Pushing to `preview`
- EAS Update creates an update for the `preview` branch, which is used by the `preview` channel.

### Opening a PR to `main`
- Web app deployed to Firebase Hosting with link added to the PR as a comment to check for functionality before submitting the PR. This preview expires in 7 days.

### Merging to `main`
- Web app deployed to production on Firebase Hosting.
- EAS Update creates an update for the `main` branch, which is used by the `production` channel.
  - If the `version` property in `app.json` matches the one in production on app stores, users will get the update the next time they restart the app.

# Contributing
All contributions welcome! The intent is to keep this app lightweight and generally applicable for teams to use.
1. Decide if the `version` property in `app.json` needs to be updated (major changes, native changes, etc.)
2. Push to `preview`
3. Open a PR to `main`. Check that the web page works.
4. Merge to `main`
5. If the `version` property was bumped in 1, create iOS and Android builds and submit them to their respective app stores.
    - Ideally, stash all changes
    - `eas build --profile production --platform all`
    - `eas submit -p android`, `eas submit -p ios` or  `eas submit -p ios`
    - On Google Play Console, check the app works in the "Internal testing" track before promoting to the "Production" track.
    - On App Store Connect, check the app works using TestFlight before submitting to production.