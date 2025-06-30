#!/usr/bin/env python
# CognitiveSample-Analysis.py - Sentiment Analysis Script
# This script performs sentiment analysis on text data in a Lakehouse table
# and writes the results back to the same table with all original columns preserved.
import synapse.ml.services
from synapse.ml.services.language import AnalyzeText
from pyspark.sql.functions import col
from pyspark.sql import SparkSession
from pyspark.conf import SparkConf
import sys
from datetime import datetime


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

deployment_config = spark_context.getConf().get("spark.deploymentConfig")
workspace_name = spark_context.getConf().get("spark.workspaceName")