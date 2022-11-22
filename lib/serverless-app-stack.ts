import {Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'

export class ServerlessAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 'hello.handler'                // file is "hello", function is "handler"
    });
    
    const myBucket = new s3.Bucket(this, "my-static-website-bucket", {
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,        
      websiteIndexDocument: "index.html"
   });
   const deployment = new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
    sources: [s3Deployment.Source.asset("site") ],
    destinationBucket: myBucket
 });

 const my_apiGw = new apigw.RestApi(this, "hello-api", {
  defaultCorsPreflightOptions:{
    allowOrigins:apigw.Cors.ALL_ORIGINS,
    allowMethods:apigw.Cors.ALL_METHODS,
    allowHeaders:["*"],
  }
});


my_apiGw.root.resourceForPath("hello/{name}").addMethod("GET", new apigw.LambdaIntegration(hello));
    
  }
}
