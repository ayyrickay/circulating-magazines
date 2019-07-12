# Clean and parse circulation from CSV
# for filename in ../rawData/*-Circulation.csv; do
#     # Clean data
#     node circulation-cleaner.js "${filename}"
# done

# # Clean and parse geodata from CSV
for filename in ../rawData/*-geodata.csv; do
    # Clean data
    node geodata-cleaner.js "${filename}"
done
