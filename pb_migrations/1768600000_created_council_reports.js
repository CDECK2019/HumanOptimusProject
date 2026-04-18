/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "councilrpt0001",
    "created": "2026-04-18 00:00:00.000Z",
    "updated": "2026-04-18 00:00:00.000Z",
    "name": "council_reports",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rel_user_rpt01",
        "name": "user",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "rel_snap_rpt01",
        "name": "snapshot",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "hsnaps000000001",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "fld_rpt_query",
        "name": "query",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 4000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "fld_rpt_experts",
        "name": "experts_json",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 500000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "fld_rpt_synth",
        "name": "synthesis_json",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 200000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "fld_rpt_genat",
        "name": "generated_at",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX idx_council_reports_user_created ON council_reports (user, created DESC)"
    ],
    "listRule": "user = @request.auth.id",
    "viewRule": "user = @request.auth.id",
    "createRule": "user = @request.auth.id",
    "updateRule": "user = @request.auth.id",
    "deleteRule": "user = @request.auth.id",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("councilrpt0001");
  return dao.deleteCollection(collection);
});
