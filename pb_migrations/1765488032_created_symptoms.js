/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "sympt0000000001",
    "created": "2025-12-11 21:20:32.744Z",
    "updated": "2025-12-11 21:20:32.744Z",
    "name": "symptoms",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rel_snap_symp01",
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
        "id": "field_name00001",
        "name": "name",
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
        "id": "field_sever0001",
        "name": "severity",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 5,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "field_dur000001",
        "name": "duration_days",
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
        "id": "field_notes0001",
        "name": "notes",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
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
  const collection = dao.findCollectionByNameOrId("sympt0000000001");

  return dao.deleteCollection(collection);
})
