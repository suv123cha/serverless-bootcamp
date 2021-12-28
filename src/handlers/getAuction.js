import AWS from 'aws-sdk';
//middleware
import middleware from '../lib/middleware';
import createError from 'http-errors';


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    let auctions;

    const { id } = event.pathParameters;

    try {
        const results = await dynamoDB.get(
            {
                TableName: process.env.AUCTIONS_TABLE_NAME,
                Key: { id }
            }
        ).promise();
        auctions = results.Item;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    if(!auctions) {
        throw new createError.NotFound(`Auctions with ID "${id}" not found!`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: auctions }),
    };
}

export const handler = middleware(getAuctions);