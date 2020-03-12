# Clean and parse circulation from CSV
for filename in ../rawData/*-Circulation.csv; do
    # Clean data
    node circulation-cleaner.js "${filename}"
done
