import AWS from 'aws-sdk';
//middleware
import middleware from '../lib/middleware';
import createError from 'http-errors';


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
    let auctions;
    try {
        const results = await dynamoDB.scan(
            {
                TableName: process.env.AUCTIONS_TABLE_NAME,
            }
        ).promise();
        auctions = results.Items;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: auctions }),
    };
}

export const handler = middleware(getAuction);