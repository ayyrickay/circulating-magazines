# Circulating American Magazines ![Build Status](https://github.com/ayyrickay/circulating-magazines/actions/workflows/main.yml/badge.svg?branch=develop)

A data visualization that renders magazine circulation data. Powered primarily by `dc.js`. Visible on the [Circulating Magazines Project at JMU](https://sites.lib.jmu.edu/circulating/visualizations/)

## Run locally

1. Use Node.js 24 (for `nvm` users):
   `nvm use`
2. Install dependencies:
   `npm install`
3. Start a local dev server with auto-reload:
   `npx live-server --port=3000 --open=/`
4. Open:
   `http://localhost:3000/`

## Adding and updating new titles

1. Run `npm install` to install all dependencies for the data cleaning scripts.

2. Create an `assets/data/rawData` directory and add circulation and geodata as separate files with the respective titles `<CODE>-Circulation.csv` and `<CODE>-geodata.csv`. Schemas for the CSV files TBD.

3. Use `npm run circulation-cleaner` and/or `npm run geodata-cleaner` to convert the CSVs to JSON files that are consumable by the front-end.

4. Finally, use `npm run title-generator` to update the list of titles that are rendered by the front end.

## Adding Special Notes

Special Notes can be added in the `data/constants.js` folder. It is represented as a simple JSON object, in which the key is the title code (e.g., `NEYO`) and the value is the special note. The UI will pull from this map to populate the special notes field in the visualization.
