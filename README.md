# Building AI-Powered Apps with Nitric: Deploying GPU-Accelerated Batch Jobs

# Running this Project

First, install Nitric CLI globally and set up your Nitric project. If you are not using Linux, you may check the installation guide for MacOS and Windows <br>

```
curl -L "https://nitric.io/install?version=latest" | bash
nitric new image-resize-demo 
cd image-resize-demo
```
Install TensorFlow.js with GPU support (assumes CUDA-enabled cloud instances)

```
npm install @tensorflow/tfjs-node-gpu @aws-sdk/client-s3 @aws-sdk/lib-storage
```
Next, 
1. Define the batch job in index.ts
2. Configure your GPU resources in nitric.yaml

Run it it locally
```
nitric start
```
Create a stack file (deployment target)

```
stack new my-stack aws
```
Deploy to Cloud (Ensure your cloud credentials are set and GPU quota is approved)
```
nitric up -s my-stack
```
