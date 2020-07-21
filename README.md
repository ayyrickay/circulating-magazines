# Circulating American Magazines [![Build Status](https://travis-ci.com/ayyrickay/circulating-magazines.svg?branch=develop)](https://travis-ci.org/ayyrickay/circulating-magazines)

A data visualization that renders magazine circulation data. Powered primarily by `dc.js`.

## Adding and updating new titles

1. Run `npm install` to install all dependencies for the data cleaning scripts.

2. Create an `assets/data/rawData` directory and add circulation and geodata as separate files with the respective titles `<CODE>-Circulation.csv` and `<CODE>-geodata.csv`. Schemas for the CSV files TBD.

3. Use `npm run circulation-cleaner` and/or `npm run geodata-cleaner` to convert the CSVs to JSON files that are consumable by the front-end.

4. Finally, use `npm run title-generator` to update the list of titles that are rendered by the front end.