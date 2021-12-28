import AWS from 'aws-sdk';
//middleware
import middleware from '../lib/middleware';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
    let auctions;
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

    return auctions;
}

async function getAuctions(event, context) {
    const { id } = event.pathParameters;
    const auctions = await getAuctionById(id);
    return {
      statusCode: 200,
      body: JSON.stringify({ response: auctions }),
    };
}

export const handler = middleware(getAuctions);