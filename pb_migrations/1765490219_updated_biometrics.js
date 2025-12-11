/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("biomet000000001")

  // remove
  collection.schema.removeField("rel_snap_bio001")

  // remove
  collection.schema.removeField("field_height001")

  // remove
  collection.schema.removeField("field_weight001")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "relbiomsnapshot",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_height_in",
    "name": "height_in",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 120,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_weight_lbs",
    "name": "weight_lbs",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 1000,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_body_fat",
    "name": "body_fat",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 100,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_age",
    "name": "age",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 120,
      "noDecimal": true
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_gender",
    "name": "gender",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_bmi",
    "name": "bmi",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 100,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_bp_sys",
    "name": "blood_pressure_systolic",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 300,
      "noDecimal": true
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_bp_dia",
    "name": "blood_pressure_diastolic",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 200,
      "noDecimal": true
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fld_hr_rest",
    "name": "resting_heart_rate",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": 250,
      "noDecimal": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("biomet000000001")

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  // remove
  collection.schema.removeField("relbiomsnapshot")

  // remove
  collection.schema.removeField("fld_height_in")

  // remove
  collection.schema.removeField("fld_weight_lbs")

  // remove
  collection.schema.removeField("fld_body_fat")

  // remove
  collection.schema.removeField("fld_age")

  // remove
  collection.schema.removeField("fld_gender")

  // remove
  collection.schema.removeField("fld_bmi")

  // remove
  collection.schema.removeField("fld_bp_sys")

  // remove
  collection.schema.removeField("fld_bp_dia")

  // remove
  collection.schema.removeField("fld_hr_rest")

  return dao.saveCollection(collection)
})
