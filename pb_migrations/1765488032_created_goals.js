/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "goals0000000001",
    "created": "2025-12-11 21:20:32.744Z",
    "updated": "2025-12-11 21:20:32.744Z",
    "name": "goals",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rel_snap_goal01",
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
        "id": "field_desc00001",
        "name": "description",
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
        "id": "field_prio00001",
        "name": "priority",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "low",
            "medium",
            "high"
          ]
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
  const collection = dao.findCollectionByNameOrId("goals0000000001");

  return dao.deleteCollection(collection);
})
