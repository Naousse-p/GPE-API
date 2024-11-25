DB_NAME="ecoleConnect"
OUTPUT_DIR="~/Desktop/backup"

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p $OUTPUT_DIR

# Lister les collections
collections=$(mongo $DB_NAME --quiet --eval "db.getCollectionNames().join(' ')")

# Exporter chaque collection en JSON
for collection in $collections; do
  mongoexport --db $DB_NAME --collection $collection --out $OUTPUT_DIR/$collection.json --jsonArray
done