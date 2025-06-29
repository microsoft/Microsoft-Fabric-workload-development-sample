#!/usr/bin/env python
# CognitiveSample-Analysis.py - Sentiment Analysis Script
# This script performs sentiment analysis on text data in a Lakehouse table
# and writes the results back to the same table with all original columns preserved.
import synapse.ml.services
import pandas as pd
from synapse.ml.services.language import AnalyzeText
from pyspark.sql.functions import col
from pyspark.sql import SparkSession
from pyspark.conf import SparkConf
import sys
from datetime import datetime
from textblob import TextBlob


#######################################################
# Setup
#######################################################


# Spark session builder
spark_session = (SparkSession
    .builder
    .appName("Spark Cognitive Sample Analysis")
    .getOrCreate())

spark_context = spark_session.sparkContext
spark_context.setLogLevel("DEBUG")  

item_id = spark_context.getConf().get("spark.itemId")
item_workspace_id = spark_context.getConf().get("spark.itemWorkspaceId")
analysis_type = spark_context.getConf().get("spark.analysisType")
item_table_name = spark_context.getConf().get("spark.itemTableName")
item_table_source_column_name = spark_context.getConf().get("spark.itemTableSourceColumnName")
item_table_result_column_name = spark_context.getConf().get("spark.itemTableResultColumnName")

print(f"Configuration:")
print(f"  - Item id: {item_id}")
print(f"  - Workspace id: {item_workspace_id}")
print(f"  - Analysis type: {analysis_type}")
print(f"  - Item Table: {item_table_name}")
print(f"  - Source column: {item_table_source_column_name}")
print(f"  - Result column: {item_table_result_column_name}")


#######################################################
# Load the Lakehouse table into a DataFrame
#######################################################
deltaTablePath = f"abfss://{item_workspace_id}@onelake.dfs.fabric.microsoft.com/{item_id}/Tables/{item_table_name}/"

print(f"Loading data from table: {item_table_name}")
df = spark_session.read.format("delta").load(deltaTablePath)

print(f"Loaded {df.count()} rows")
print(f"Available columns: {', '.join(df.columns)}")

# Validate required column exists
if item_table_source_column_name not in df.columns:
    print(f"Error: Source column '{item_table_source_column_name}' not found in table.")
    sys.exit(1)

# drop the result column if it is there
if item_table_result_column_name in df.columns:
    df = df.drop(item_table_result_column_name)
    print(f"Dropped existing result column: {item_table_result_column_name}")
    
#######################################################
# Sent  analysis
#######################################################
print(f"Starting {analysis_type} analysis on column: {item_table_source_column_name}")

result = df.toPandas()
print(f"Available column in analyze model: {', '.join(result.columns)}")

# Extract the  values from the response
if(analysis_type == "SentimentAnalysis"):
    print("Extracting sentiment values...")
    result['polarity'] = result.apply(lambda row: TextBlob(row[item_table_source_column_name]).sentiment.polarity, axis=1)
    result[item_table_result_column_name] = result.apply(lambda x: "negative" if x['polarity'] < 0 else "positive", axis=1)
    result = spark_session.createDataFrame(result)
else:
    print(f"Error: Analysis type '{analysis_type}' not implemented.")
    sys.exit(1)
    
print(f"Available columns in result: {', '.join(result.columns)}")
print(f"Sentiment analysis complete, added column: {item_table_result_column_name}")

#######################################################
# Sent  analysis
#######################################################
print(f"Starting {analysis_type} analysis on column: {item_table_source_column_name}")

result = df.toPandas()

print(f"Available column in analyze model: {', '.join(result.columns)}")

# Extract the  values from the response
if(analysis_type == "SentimentAnalysis"):
    print("Extracting sentiment values...")
    result['polarity'] = result.apply(lambda row: TextBlob(row[item_table_source_column_name]).sentiment.polarity, axis=1)
    result[item_table_result_column_name] = result.apply(lambda x: "negative" if x['polarity'] < 0 else "positive", axis=1)
    result = spark_session.createDataFrame(result)
else:
    print(f"Error: Analysis type '{analysis_type}' not implemented.")
    sys.exit(1)
    
print(f"Available columns in result: {', '.join(result.columns)}")
print(f"Sentiment analysis complete, added column: {item_table_result_column_name}")

result.show(5)

#######################################################
# Writing the result back to the Lakehouse table
#######################################################
# Get a list of all original columns from the input DataFrame
original_columns = df.columns
# Add the result column to the output
if(item_table_result_column_name in original_columns):
    output_df = result.select(*original_columns)
else: 
    output_df = result.select(
        *original_columns,   # All original columns using the * operator to unpack the list
        col(item_table_result_column_name)  # Add the new result column
)

# Writing the data back
print(f"Writing results to: {deltaTablePath}")
output_df.write.mode("overwrite").format("delta").save(deltaTablePath)

print(f"Output saved to table: {item_table_name}")
#output_df.show(5)