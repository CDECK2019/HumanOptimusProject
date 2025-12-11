/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "interv000000001",
    "created": "2025-12-11 21:20:32.744Z",
    "updated": "2025-12-11 21:20:32.744Z",
    "name": "interventions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rel_snap_int001",
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
        "id": "field_cat000001",
        "name": "category",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "supplement",
            "medication",
            "lifestyle",
            "diet"
          ]
        }
      },
      {
        "system": false,
        "id": "field_name_in01",
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
        "id": "field_dose00001",
        "name": "dose_amount",
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
        "id": "field_dose_u001",
        "name": "dose_unit",
        "type": "text",
        "required": false,
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
        "id": "field_freq00001",
        "name": "frequency",
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
  const collection = dao.findCollectionByNameOrId("interv000000001");

  return dao.deleteCollection(collection);
})
