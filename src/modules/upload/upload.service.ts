import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);
  AWS_S3_BUCKET = 'chat-media';
  s3 = new AWS.S3({
    accessKeyId: '',
    secretAccessKey: '',
  });

  async handleUpload(file: Express.Multer.File) {
    const { originalname } = file;
    return await this.s3Upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
  }

  async s3Upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDispsition: 'inline',
      CreateBucketConfiguration: {
        LocationContstraint: 'ap-south-1',
      },
    };
    try {
      let s3Response = await this.s3.upload(params).promise();
      return s3Response;
    } catch (error) {
      this.logger.error('Error uploading file to s3. Error:', error);
    }
  }
}
