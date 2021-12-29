import AWS from 'aws-sdk';
//middleware
import middleware from '../lib/middleware';
import createError from 'http-errors';
import validator from '@middy/validator';
import { getAuctionById } from './getAuction';
import placeBidSchema from '../lib/schemas/placeBidSchema';


const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;
    const { email } = event.requestContext.authorizer;

    const auction = await getAuctionById(id);

    // Auction status validation
    if(auction.status != 'OPEN') {
        throw new createError.Forbidden(`You cannot bid on a closed auction`);
    }

    // Aunction amount validation
    if(amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`)
    }

    // Same person check
    if(email === auction.seller) {
        throw new createError.Forbidden(`You cannot bid on your own auctions`);
    }

    // Highest bidder check
    if(email === auction.highestBid.bidder) {
        throw new createError.Forbidden(`You are already a highest bidder`);
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {id},
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email
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

export const handler = middleware(placeBid)
    .use(validator({ inputSchema: placeBidSchema }));