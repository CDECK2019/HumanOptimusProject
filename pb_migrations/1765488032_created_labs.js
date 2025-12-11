/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "labs00000000001",
    "created": "2025-12-11 21:20:32.744Z",
    "updated": "2025-12-11 21:20:32.744Z",
    "name": "labs",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rel_snap_labs01",
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
        "id": "field_tname0001",
        "name": "test_name",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "field_val000001",
        "name": "value",
        "type": "number",
        "required": true,
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
        "id": "field_unit00001",
        "name": "unit",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "field_low000001",
        "name": "ref_low",
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
        "id": "field_high00001",
        "name": "ref_high",
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
  const collection = dao.findCollectionByNameOrId("labs00000000001");

  return dao.deleteCollection(collection);
})
