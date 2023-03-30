const AWS = require('aws-sdk');
const SES = new AWS.SES();

const senderEmailAddress = process.env.SENDER_EMAIL_ADDRESS;
const recipientEmailAddress = process.env.RECIPIENT_EMAIL_ADDRESS;

exports.handler = async (event) => {
    const jobId = event.detail.jobRunId;
    const jobName = event.detail.jobName;

    const emailParams = {
        Destination: {
            ToAddresses: [
                recipientEmailAddress
            ]
        },
        Message: {
            Body: {
                Html: {
                    Data: `
                        <p>The Glue ETL job ${jobName} with JobRunId ${jobId} has completed. The export file is now available for download from the S3 bucket.</p>
                        <p>Thank you,</p>
                        <p>The My Messaging Platform Team</p>
                    `
                }
            },
            Subject: {
                Data: 'My Messaging Platform - Data Export Notification'
            }
        },
        Source: senderEmailAddress
    };

    try {
        const result = await SES.sendEmail(emailParams).promise();
        console.log(`Email sent: ${result.MessageId}`);
    } catch (err) {
        console.error(err, err.stack);
    }
};
