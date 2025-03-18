import { job, bucket } from '@nitric/sdk';
import * as tf from '@tensorflow/tfjs-node-gpu';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// S3 client for fetching images
const s3Client = new S3Client({});
const imagesBucket = bucket('images').for('reading', 'writing');

const loadImage = async (s3Url: string): Promise<tf.Tensor3D> => {
  const [_, bucket, key] = s3Url.match(/s3:\/\/([^/]+)\/(.+)/) || [];
  if (!bucket || !key) throw new Error(`Invalid S3 URL: ${s3Url}`);
  const { Body } = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
  const buffer = Buffer.from(await (Body as any).transformToByteArray());
  return tf.node.decodeImage(buffer) as tf.Tensor3D;
};

const saveImage = async (tensor: tf.Tensor3D, outputKey: string) => {
  const buffer = Buffer.from(await tf.node.encodeJpeg(tensor));
  await new Upload({
    client: s3Client,
    params: {
      Bucket: 'images',
      Key: outputKey,
      Body: buffer,
      ContentType: 'image/jpeg',
    },
  }).done();
};

	const resizeImages = job({
			name: 'resize-images',
			});
			
		resizeImages.job(async (ctx) => {
		const { data } = ctx.req;     // Expecting { urls: string[] } e.g., ["s3://images/input/img1.jpg"]

		console.log(`Resizing ${data.urls.length} images...`);
		
			//your tensorflow GPU-accelerated logic here
			
		try {
				const resizedImages = await Promise.all(
				data.urls.map(async (url, index) => {
				const imageTensor = await loadImage(url);
				const resized = tf.image.resizeBilinear(imageTensor, [50, 50]); // Downsize to 50x50
				const outputKey = `output/resized-${index}.jpg`;
        await saveImage(resized, outputKey);
        const size = resized.shape;
				imageTensor.dispose(); // Free GPU memory
				resized.dispose();
				return { outputUrl: `s3://images/${outputKey}`, width: size[1], height: size[0] };
			})
		);
		 return { resizedCount: resizedImages.length, results: resizedImages };
	}
		catch (error) {
				console.error('Resize failed:', error);
			throw error; // Let Nitric log it
		}
		});