## Clean and parse circulation from raw JSON
# for filename in rawData/*-Circulation.json; do
#     # Add circulation header to beginning of file
#     ex -s -c '1i|module.exports.circulationData = ' -c x "$filename"
#     # rename files
#     mv -- "$filename" "${filename%.json}.js"
#     # Clean data
#     node circulation-cleaner.js "${filename%.json}.js"
# done

# for filename in rawData/*-Circulation.js; do
#     node circulation-cleaner.js "$filename"
# done

## Clean and parse geodata from raw JSON
# for filename in rawData/*-Geodata.json; do
#     # Add geodata header to beginning of file
#     ex -s -c '1i|module.exports.geodata = ' -c x "$filename"
#     # rename files
#     mv -- "$filename" "${filename%.json}.js"
#     # Clean data
#     node geodata-cleaner.js "${filename%.json}.js"
# done

## Clean and parse geodata from js module
for filename in rawData/*-Geodata.js; do
    node geodata-cleaner.js "$filename"
done
