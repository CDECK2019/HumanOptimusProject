/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "biomet000000001",
    "created": "2025-12-11 21:20:32.744Z",
    "updated": "2025-12-11 21:20:32.744Z",
    "name": "biometrics",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rel_snap_bio001",
        "name": "snapshot",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "hsnaps000000001",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "field_height001",
        "name": "height_cm",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "field_weight001",
        "name": "weight_kg",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [],
    "listRule": "snapshot.user = @request.auth.id",
    "viewRule": "snapshot.user = @request.auth.id",
    "createRule": "snapshot.user = @request.auth.id",
    "updateRule": "snapshot.user = @request.auth.id",
    "deleteRule": "snapshot.user = @request.auth.id",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("biomet000000001");

  return dao.deleteCollection(collection);
})
