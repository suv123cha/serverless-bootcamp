import AWS from 'aws-sdk';
//middleware
import middleware from '../lib/middleware';
import createError from 'http-errors';


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    let auctions;

    const { id } = event.pathParameters;
    const { amount } = event.body;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {id},
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount
        },
        ReturnValues: 'ALL_NEW'
    };

    let updatedAuction;
    try {
        const result = await dynamoDB.update(params).promise();
        updatedAuction = result.Attributes;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: updatedAuction }),
    };
}

export const handler = middleware(placeBid);