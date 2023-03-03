---
author: Julien Bras
pubDatetime: 2023-01-11 19:00:00
title: Using the Strangler Fig Pattern in SST
postSlug: using-the-strangler-fig-pattern-in-sst
featured: false
tags:
  - sst
  - aws
  - pattern
description: How to use the Strangler Fig Pattern in SST (Serverless Stack), to slowly migrate a monolith to a serverless architecture.
---

I am currently working on the architecture of a new project for my company. This new project must be compatible with an historical monolith, then extend it. It's a common case to rewrite an existing application with modern toolkit.

## What is the Strangler Fit Pattern?

Martin Fowler was describing in a article back in 2004 a way to slowly replace a monolith by a new product: the [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html). The main advantage: a slow migration, one endpoint by one endpoint, not a bigbang. This pattern is actually widely used when refactoring an application to micro-services for example.

![](/img/strangler1.png)
_From [Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig)_

## Why in SST (Serverless Stack)?

[SST](https://sst.dev/) is a serverless framework that help you to build _fullstack_ application. On my new project, I want to take advantage of this framework (it's a classic piece of our toolkit nowadays!), but I want to _replace_ an application, not to create a new one. So the Strangler Fit Pattern seems pretty attracting.

## Architecture

Based on a [AWS reInvent presentation](https://d1.awsstatic.com/events/reinvent/2019/REPEAT_1_Migrating_monolithic_applications_with_the_strangler_pattern_FSI302-R1.pdf) (Youtube video link [here](https://www.youtube.com/watch?v=E2dnSg-IHdo)), I was convinced to use an **API Gateway** with the `ANY /{proxy+}` to facade the application:

![](/img/strangler2.png)
_From AWS Presentation, [Migrating monolithic applications with the strangler pattern](https://d1.awsstatic.com/events/reinvent/2019/REPEAT_1_Migrating_monolithic_applications_with_the_strangler_pattern_FSI302-R1.pdf)_

Starting from there I have tried to simulate a monolith application (represented by a `ApplicationLoadBalancedFargateService` CDK construct in my project). The implementation of the monolith is not very important, I just rely on the **Application Load Balancer** (there is 99% chance you have such service if your monolith is hosted on AWS, either on EC2 or ECS!).

Here is my monolith in CDK:

```ts
const loadBalancedFargateService = new ApplicationLoadBalancedFargateService(
  stack,
  "Service",
  {
    propagateTags: PropagatedTagSource.SERVICE,
    memoryLimitMiB: 1024,
    desiredCount: 1,
    cpu: 512,
    taskImageOptions: {
      image: ContainerImage.fromRegistry("nginxdemos/hello"),
    },
    publicLoadBalancer: false,
  }
);
```

For the demo, it's using a very simple docker image, `nginxdemos/hello`

Then SST is allowing me to use the same `{proxy+}` in the API routes:

```ts
const api = new Api(stack, "api", {
  routes: {
    "GET /": "functions/lambda.handler",
    "ANY /{proxy+}": {
      type: "alb",
      cdk: {
        albListener: loadBalancedFargateService.listener,
      },
    },
  },
});
```

And _voilà_, I can build new routes with SST, and all routes not specified in `routes` will be handled by the old application declared in the `ApplicationLoadBalancedFargateService`.

The route `/` is answered by my `lambda.handler` function:
![](/img/strangler3.png)

Any other routes are answered by my monolith:
![](/img/strangler4.png)

## To Conclude

This was a quick one but I think it can be a very efficient way to move slowly to [SST](https://sst.dev) framework! You can find the example repository on GitHub [here](https://github.com/julbrs/strangler-fig-sst). Happy tests with this pattern on modern stack, or chat with me on [Twitter](https://twitter.com/_julbrs)!
