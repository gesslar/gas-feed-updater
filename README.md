[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

# gas-feed-updater
This GAS will read an ATOM file and post updates to Discord.

This script should be attached to a Google Sheet, which is used to track previously sent messages.

# Google Sheet
This script expects the following columns in this order: `Date`, `Time`, `Summary`, `Description`

# ATOM Fields
This script reads the following fields from each ATOM entry: `published`, `summary`, `content`, `title`

# Document Properties
This script reads and writes the most recently published date/time in UNIX format to the document property `lastUpdated`.


# Script Properties
The following script properties need to be defined

1. `feed_url` - This is the ATOM url from which to pull updates
2. `discord_webhook` - The webhook URL to the Discord channel you will push to.

# Trigger
You should install a trigger on your script to run at a desired interval and point it to the run function.
