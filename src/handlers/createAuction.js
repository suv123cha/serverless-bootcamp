import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

//middleware
import middleware from '../lib/middleware';
import createError from 'http-errors';

import validator from '@middy/validator';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
    const { title } = event.body;
    const { email } = event.requestContext.authorizer;

    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1)

    let action = {
        id: uuid(),
        title,
        seller: email,
        status: 'OPEN',
        highestBid: {
            amount: 0,
        },
        createdAT: now.toISOString(),
        endingAt: endDate.toISOString()
    };

    try 
    {
        await dynamoDB.put({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Item: action
        }).promise();

    } 
    catch (error) 
    {
        console.log(error);
        throw new createError.InternalServerError(error);
    }
    

    return {
      statusCode: 201,
      body: JSON.stringify({ response: action }),
    };
}

export const handler = middleware(createAuction)
    .use(validator({ inputSchema: createAuctionSchema }));