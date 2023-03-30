const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const Athena = new AWS.Athena();
const SNS = new AWS.SNS();
const SQS = new AWS.SQS();

const s3BucketName = process.env.S3_BUCKET_NAME;
const athenaDatabase = process.env.ATHENA_DATABASE;
const athenaQueryResultBucketName = process.env.ATHENA_QUERY_RESULT_BUCKET_NAME;
const athenaNamedQueryName = process.env.ATHENA_NAMED_QUERY_NAME;
const startDate = process.env.START_DATE;
const endDate = process.env.END_DATE;
const snsTopicArn = process.env.SNS_TOPIC_ARN;
const sqsQueueUrl = process.env.SQS_QUEUE_URL;

exports.handler = async (event) => {
    const jobId = Date.now().toString();
    const s3Key = `messaging_data_${jobId}.csv`;

    const athenaNamedQueryParams = {
        QueryString: `SELECT * FROM ${athenaDatabase}.${athenaNamedQueryName} WHERE date_column BETWEEN CAST('${startDate}' AS TIMESTAMP) AND CAST('${endDate}' AS TIMESTAMP)`,
        QueryExecutionContext: {
            Database: athenaDatabase
        },
        ResultConfiguration: {
            OutputLocation: `s3://${athenaQueryResultBucketName}/`
        },
        WorkGroup: 'primary'
    };

    try {
        const queryExecution = await Athena.startQueryExecution(athenaNamedQueryParams).promise();
        const queryExecutionId = queryExecution.QueryExecutionId;
        console.log(`Started Athena query execution with ID: ${queryExecutionId}`);

        const waitForQuery = async (queryExecutionId) => {
            const queryExecutionParams = {
                QueryExecutionId: queryExecutionId
            };
            const queryExecutionResult = await Athena.getQueryExecution(queryExecutionParams).promise();
            const queryState = queryExecutionResult.QueryExecution.Status.State;

            if (queryState === 'SUCCEEDED') {
                console.log('Athena query succeeded');
                const queryResultLocation = queryExecutionResult.QueryExecution.ResultConfiguration.OutputLocation;
                const s3CopyObjectParams = {
                    Bucket: s3BucketName,
                    Key: s3Key
                };
                await S3.copyObject(s3CopyObjectParams).promise();
                console.log(`Copied query result to S3 bucket: s3://${s3BucketName}/${s3Key}`);

                const snsPublishParams = {
                    Message: 'Export job completed',
                    TopicArn: snsTopicArn,
                    MessageAttributes: {
                        jobId: {
                            DataType: 'String',
                            StringValue: jobId
                        },
                        s3Key: {
                            DataType: 'String',
                            StringValue: s3Key
                        }
                    }
                };
                await SNS.publish(snsPublishParams).promise();
                console.log(`Published message to SNS topic: ${snsTopicArn}`);

                const sqsSendMessageParams = {
                    QueueUrl: sqsQueueUrl,
                    MessageBody: JSON.stringify({
                        jobId: jobId,
                        s3Key: s3Key
                    })
                };
                await SQS.sendMessage(sqsSendMessageParams).promise();
                console.log(`Sent message to SQS queue: ${sqsQueueUrl}`);
            } else if (queryState === 'FAILED' || queryState === 'CANCELLED') {
                console.log(`Athena query failed or was cancelled: ${queryExecutionId}`);
            } else {
                console.log(`Athena query is still running: ${queryExecutionId}`);
                setTimeout(() => {
                    waitForQuery(queryExecutionId);
                }, 5000);
            }
        };
        await waitForQuery(queryExecutionId);
    } catch (err) {
        console.error(err, err.stack);
    }
};
