# Clean and parse circulation from CSV
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

for filename in ../rawData/*-Circulation.csv; do
    # Clean data
    node circulation-cleaner.js "${filename}"
done
