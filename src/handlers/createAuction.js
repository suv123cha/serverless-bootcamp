import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
    const { title } = JSON.parse(event.body);
    const now = new Date();

    let action = {
        id: uuid(),
        title,
        status: 'OPEN',
        createdAT: now.toISOString()
    };

    await dynamoDB.put({
        TableName: 'AuctionsTable',
        Item: action
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ response: action }),
    };
}

export const handler = createAuction;