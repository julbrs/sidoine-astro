---
author: Julien Bras
pubDatetime: 2021-09-26 19:00:00
title: SST is The Most Underrated Serverless Framework You Need to Discover
postSlug: sst-the-most-underrated-serverless-framework-you-need-to-discover
featured: false
tags:
  - serverless
  - aws
  - sst
  - cdk
description: Part 1 of a series around SST - Serverless Stack
---

> [!NOTE] SST Series
> This article is part of a series around SST - Serverless Stack. I will try to let you discover some amazing aspects of this particular solution in the serverless world.
>
> - Part 1: [[SST is The Most Underrated Serverless Framework You Need to Discover]]
> - Part 2: [[SST is The Most Underrated Serverless Framework You Need to Discover (part 2)]]
> - Part 3: [[Why and How Migrate From Firebase to Serverless Stack?]]
> - Part 4: [[OAuth with Serverless using SST]]

So you start building using **serverless** principles, and you discover the [Serverless framework](https://www.serverless.com/). Great ! You will discover here another option, that I consider superior in multiple area, the [Serverless Stack (SST)](https://serverless-stack.com/). I will first introduce some basic concepts for beginners, then I will expose the main difference between the solutions. Let's dig into this!

## Introducing some concepts

### Serverless

Serverless is "is a cloud computing execution model in which the cloud provider allocates machine resources on demand, taking care of the servers on behalf of their customers" ([Wikipedia](https://en.wikipedia.org/wiki/Serverless_computing)). It allow you to run backend functions or applications without managing any backend server, or containers. Each major cloud provider is providing today serverless solutions:

- *Lambda* on AWS
- *Microsoft Azure Functions* on Azure
- *Cloud Functions* on Google Cloud Platform

Basically you just define a function in a supported language, you push it to your cloud provider and *voilà!*, it's accessible and you don't have to deal with servers. It's the developer dream!

![](/img/lambda.png)

_A very simple serverless function on AWS!_

### Framework for Serverless

Once you have build your first functions using serverless, you discover that the feedback loop to test something is generally longer that your local code:

- First you develop the function
- You need to deploy it on your cloud provider (manually maybe the first time)
- You need to wait for the deployment, attach HTTP trigger if it's a REST API for example (API Gateway for AWS)
- You test it (via Postman or using your web-application maybe)
- You detected a bug
- You get the log trace in the log system of the cloud provider (CloudWatch for AWS for example)
- Then your go back to the start of the list

The back-and-forth is generally more costly because the code cannot be run directly on your local machine. So we try to rely on a solution that will speed up the development process, and eventually allow us to develop locally before pushing to the cloud provider (again to speed-up the process).

### What is the Serverless Framework?

![](/img/serverless.png)

[This](https://www.serverless.com/) particular framework was introduced back in 2015 (under the name JAWS, source: [Wikipedia](https://en.wikipedia.org/wiki/Serverless_Framework)). The project have an astonishing **40k** stars on [Github](https://github.com/serverless/serverless)! This framework offer a high number of features:

- it support a large number of languages (more or less the same as supported language for serverless platform)
- it is compatible with the major cloud provider here (AWS, Azure, GCP...)
- it allow you to develop locally before pushing to the cloud provider
- there is [a million plugins](https://www.serverless.com/plugins/) that can help you to achieve what you need

The main piece in the framework is the `serverless.yml` file that is the configuration file of your serverless application. You can list here all the functions you want to deploy, how they are triggered (http endpoint or cron scheduling for example).

Here is an example file (from [serverless/examples repo](https://github.com/serverless/examples/blob/master/aws-node-rest-api/serverless.yml)):

```plain
service: aws-node-rest-api

frameworkVersion: '2'


provider:
  name: aws
  runtime: nodejs12.x
  lambdaHashingVersion: '20201221'

functions:
  hello:
    handler: handler.hello
    events:
      - http:
          path: /
          method: get
```

It describes in a very efficient way the provider and runtime you want to use, then the list of function you want to deploy. Each function is referenced with a `handler`. For *nodejs* runtime, it's just pointing to the file named `handler.js` and the exported function named `hello`.

Then you add `events` for each function if you want to trigger the function on HTTP event for example.

Under the hood the deployment is managed by CloudFormation on AWS (I do not have any experience on deployment on different cloud provider). It's possible to add custom resources in the `serverless.yml` file using [CloudFormation template language](https://www.serverless.com/framework/docs/providers/aws/guide/resources).

#### My Story With This Framework

I have discover this framework back in 2018/2019, in my early day playing with Lambda on AWS. I think it is still the first thing you are testing after playing with serverless manually.

I use it to build some simple scheduling jobs on AWS, and build some full featured REST API.

### What is the Serverless Stack (SST)?

![](/img/sst2.png)

[This](https://serverless-stack.com/) framework is much more recent. There is a couple of post here on **DEV** from [Franck Wang](https://dev.to/fwang), the author of this framework starting on September 2020 ([here](https://dev.to/aws-builders/using-serverless-framework-and-cdk-together-12he) and [here](https://dev.to/aws-builders/work-on-your-lambda-functions-live-51cp)). The project have only **3k** stars on [Github](https://github.com/serverless-stack/serverless-stack) (at the time of writing this article).

The framework is much more limited in term of features, as it's new, but it cover the most classic use-cases:

- only AWS is supported as cloud provider
- only [a few languages are supported](https://docs.serverless-stack.com/installation) for Lambda functions (no *Java* for example)
- a local setup is available for development

The framework is relying on [CDK](https://aws.amazon.com/cdk/) which is an AWS tool designed to "define your cloud application resources using familiar programming languages". Behind the scene CDK is allowing you to write code that will be translated to CloudFormation template files. It's generally much more compact to write CDK that the equivalent CloudFormation template file!

A simple example of the framework:

```plain
new Api(this, "Api", {
  routes: {
    "GET  /notes": "src/list.main",
    "POST /notes": "src/create.main",
  },
})
```

This piece of code is using `Api` which is a *Construct*. A *Construct* is a CDK concept that represent a set of pre-configured resources on AWS. It's a very efficient way to define quickly an application. Same as the previous framework here I define HTTP routes. The first one `GET /notes` will use a Lambda function with the code available in the file `src/list.js` under the exported function `main`.

### My Story With This Framework

I have discover the framework begin of 2021 and it's blowing my mind each time I am using it. I think that CDK is far superior to CloudFormation template files:

- You can split your code in multiple file easily!
- Your IDE is generally helping you writing CDK (TypeScript assisted for example)
- You are writing less (Construct are helping to handle high order components !)

I use it actually to build a complete application (front + back) with authentication, relying a lot on *Construct* provided by SST team ([Auth](https://docs.serverless-stack.com/constructs/Auth), [Cron](https://docs.serverless-stack.com/constructs/Cron), [Bucket](https://docs.serverless-stack.com/constructs/Bucket)).

## Conclusion

This is the end of my first article on this framework. I hope it will help you give a try when you will have to choose a serverless Framework! In the next episode of this series, I will speak about the local development feature of this framework, you can [follow me](https://twitter.com/_julbrs) to be informed when it will be out!
