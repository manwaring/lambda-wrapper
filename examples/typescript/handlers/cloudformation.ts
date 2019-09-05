import { S3 } from 'aws-sdk';
import { cloudFormation, CloudFormationSignature } from '@manwaring/lambda-wrapper';

const s3 = new S3({ apiVersion: '2006-03-01', region: 'us-east-1' });

export const handler = cloudFormation(async ({ event, success, failure }: CloudFormationSignature) => {
  try {
    if (event.RequestType.toUpperCase() === 'DELETE') {
      await emptyBucket(event.ResourceProperties.BucketName);
    }
    return success();
  } catch (err) {
    return failure(err);
  }
});

async function emptyBucket(bucket: string): Promise<void> {
  const objects = await listBucketObjects(bucket);
  await removeBucketObjects(bucket, objects);
}

function listBucketObjects(Bucket: string) {
  const params = { Bucket };
  console.log('Listing bucket objects with params', params);
  return s3.listObjectsV2(params).promise();
}

function removeBucketObjects(Bucket: string, objects) {
  const params = {
    Bucket,
    Delete: {
      Objects: objects.Contents.map(object => {
        return { Key: object.Key };
      })
    }
  };
  console.log('Deleting objects from bucket with params', params);
  return s3.deleteObjects(params).promise();
}
