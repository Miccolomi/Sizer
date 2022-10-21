import pymongo

import config

client = pymongo.MongoClient(config.CONNECTION_STRING)

client[config.DB_NAME].create_collection(
    "TM_v7",
    timeseries = {
          "timeField": "tm",
          "metaField": "md",
          "granularity": "minutes"
    }) 

index_meta_and_timestamp = pymongo.IndexModel([('id', pymongo.DESCENDING) , ('tm', pymongo.DESCENDING)], name="IDAndTimestamp")
client[config.DB_NAME].TM_v7.create_indexes([index_meta_and_timestamp])


