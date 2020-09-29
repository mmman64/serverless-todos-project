import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { iTodo } from '../types/iTodo';
import { iUpdateTodoRequest } from '../types/requestTypes/iUpdateTodoRequest';

const AWSXRAY = require('aws-xray-sdk');
const XAWS = AWSXRAY.captureAWS(AWS);

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME,
    private readonly bucketName = process.env.FILES_S3_BUCKET
  ) {}

  async getAllTodos(userId: string): Promise<iTodo[]> {
    console.log('getting all todos');

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    const todos = result.Items;

    return todos as iTodo[];
  }

  async checkIfTodoExists(todoId: string, userId: string): Promise<boolean> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId,
        },
      })
      .promise();

    return !!result.Item;
  }

  async createTodo(todo: iTodo): Promise<iTodo> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo,
      })
      .promise();

    return todo;
  }

  async updateTodo(
    todoId: string,
    userId: string,
    updatedTodo: iUpdateTodoRequest
  ): Promise<boolean> {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression:
          'set #name = :name, #dueDate = :dueDate, #done = :done',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done',
        },
        ExpressionAttributeValues: {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done,
        },
      })
      .promise();

    return true;
  }

  async deleteTodo(todoId: string, userId: string): Promise<boolean> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId,
        },
      })
      .promise();

    return true;
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    const s3 = new AWS.S3({
      signatureVersion: 'v4',
    });

    return s3.getSignedUrl('putObject', {
      Bucket: process.env.FILES_S3_BUCKET,
      Key: todoId,
      Expires: parseInt(process.env.SIGNED_URL_EXPIRATION),
    });
  }

  async setAttachmentUrl(todoId: string, userId: string): Promise<boolean> {
    const attachmentUrl: string = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl',
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
      })
      .promise();

    return true;
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance');
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
