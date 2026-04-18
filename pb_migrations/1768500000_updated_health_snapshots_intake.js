/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hsnaps000000001")

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_onb_complete",
    "name": "onboarding_complete",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_intake_json",
    "name": "intake_profile_json",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": 200000,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hsnaps000000001")

  collection.schema.removeField("fld_onb_complete")
  collection.schema.removeField("fld_intake_json")

  return dao.saveCollection(collection)
})
