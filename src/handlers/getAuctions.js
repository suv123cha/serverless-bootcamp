import AWS from 'aws-sdk';
//middleware
import middleware from '../lib/middleware';
import createError from 'http-errors';


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    const { status } = event.queryStringParameters;
    let auctions;
  
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
            ':status': status,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    console.log(params);
    try {
        const result = await dynamoDB.query(params).promise();
        console.log(result);
        auctions = result.Items;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: auctions }),
    };
}

export const handler = middleware(getAuctions);