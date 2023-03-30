# respondio-aws-task

# Task 1: Design Data Export Architecture on AWS

# Overview

Let's assume that our messaging platform is being used by 2000+ organizations, and each organization is processing billions of messages per day.

These organizations want to analyze their messaging data on a monthly or quarterly basis.

We need the feature where the organizations could export all of their data and use it for Data Analysis and Data Insights purposes.

Your assignment is to design the **infrastructure** for this **Data Export** feature.

# Existing Infrastructure

You can assume that the following is the current infrastructure. In this infrastructure, you will be adding more AWS resources to provide the data export functionality.

![image](https://user-images.githubusercontent.com/7500774/228910165-f904d6be-318c-4a4f-93f4-11e973406878.png)

<aside>
💡 You are allowed to change this infrastructure as required.

</aside>

# Requirements

The Data Export feature should meet the following criteria:

## 1. Store a large amount of messaging data

As we are processing billions of messages, we need a highly reliable and scalable architecture to store such a large amount of data - that is also suitable for export purposes.

<aside>
💡 Don't use the RDS database!

</aside>

## 2. Export the data in CSV format

The following is required:

1. Export the data into a comma-separated file format (`.csv`), or it can be an archived file (`.zip` or `.rar`) that contains multiple CSVs.
2. Users would want to export data by providing date ranges e.g. from `2021-01-01` to `2021-03-31`.

<aside>
💡 Make sure that you design your data store in such a way that it is possible to query the data based on the date ranges efficiently.

</aside>

## 3. Send Notification

Since it takes a significant time to export a large volume of data the best user experience would be to perform the data export in the background and notify the user only when the export file is ready for download. 

So we would need to send an email address to the users to notify them.

## 4. Ensure Privacy

The exported files will contain sensitive data. It’s important to secure the organization’s data.

We should allow the user to download the file **only** if he belongs to the organization e.g.

Example: Organization **O1** has the following users **U1** and **U2** while **O2** has the users **U3** and **U4.** The data export files belonging to **O1** should not be downloadable by the users of **O2.**

<aside>
💡 You can assume that **user** and **organization** data has been stored in the RDS database.

</aside>

## 5. Cost Analysis

Finally, you are required to do a cost analysis of your proposed solution (calculator.aws)

# Playground Rules

1. You must only use the [Amazon AWS](https://aws.amazon.com/) cloud service provider.
2. You can add changes to the current infrastructure, or you can assume your own infrastructure that receives billions of messages.
3. You are allowed to use any AWS service.
4. You are required to include all of the services in your *Cost Analysis*.


Proposed Architecture of "cf_template1"
![image](https://user-images.githubusercontent.com/7500774/228920473-1e9aff18-8b44-4627-8388-63e8fa514fdb.png)

