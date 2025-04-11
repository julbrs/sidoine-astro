---
author: Julien Bras
pubDate: 2023-01-23 19:00:00
title: Lambda Warm-up 🔥 on SST (Serverless Stack)
postSlug: lambda-warm-up-on-sst-serverless-stack
tags:
  - sst
  - serverless
  - coldstart
  - warmup
description: Setup a good old warm-up system on SST (Serverless Stack) to avoid cold start on Lambda
---

## What is Cold Time Start?

[Lambda](https://aws.amazon.com/lambda/) is the serverless computing service provided by AWS. It allow the developer to avoid managing any infrastructure by working only on functions, that will executed directly by the service.

One of the biggest issue is the **cold time start**. Every time a query hit Lambda to run a function, a new small container need to be boot up to handle the query. This system is automatic and not customizable for developer side, but it can take some time, aka the cold start time:

![](./warmup.png)
_(from the article [Serverless Framework: Warming up AWS Lambda to avoid “cold start”](https://itnext.io/serverless-framework-warming-up-aws-lambda-to-avoid-cold-start-2be579475531))_

Depending on the runtime, it can vary from ~ 200ms to a few seconds (sometime 12s on Java for example!). It's an issue if the Lambda is exposed on HTTP via an API Gateway. You don't want to let your customer wait 12s to refresh this specific area of the page 😅

## Why Warm-up is a Thing in Serverless computing?

There is multiple strategy to handle this:

- use a runtime with less cold start time (javascript, python, go...)
- use the new AWS fancy feature named [**SnapStart**](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) (available only for `java11` runtime actually)
- warm-up the function on periodic time

I will focus on the last option because SnapStart is not really a solution on [SST](https://sst.dev/) right now (there is an open [issue](https://github.com/aws/aws-cdk/issues/23153) on `aws-cdk` github repository) ; and using a different runtime is not an option right now in the project 😅

To warm your function, you just have to periodically trigger it, AWS will keep a _hot_ container so end user will less experiment a long response time. On my tests, I see the same Java endpoint going **from 8.5 seconds to 1.6 seconds** (not blazing fast but much more acceptable!)

## How to Warm-Up in SST?

### Starting Point

There is actually no built-in system for this kind of setup. On my previous stack with [Serverless Framework](https://www.serverless.com/), we were relying on the plugin [serverless-plugin-warmup](https://www.serverless.com/plugins/serverless-plugin-warmup).

So my idea was to create a new [**Construct**](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html) object that will be useful to warm a specific SST API.

### Step by Step Guide

In your `stacks/` folder, create a new `constructs/` folder and create a new `ApiWarmer.ts` file. Provide the following in the file:

```ts
import { Api, ApiAuthorizer } from "@serverless-stack/resources";
import { Duration } from "aws-cdk-lib";
import { IRuleTarget, Rule, RuleTargetInput, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";

export interface ApiWarmerProps {
  /**
   * The time between each warm up.
   * default to 5 minutes.
   */
  readonly duration?: Duration;

  /**
   * The event to send to the lambda function.
   * default to { source: "serverless-plugin-warmup" }
   */
  readonly event?: RuleTargetInput;

  /**
   * The SST API Gateway to warmup
   */
  readonly api: Api<Record<string, ApiAuthorizer>>;

  /**
   * The list of API Gateway endpoints to warm up.
   * (like "GET /"" or "POST /items"")
   */
  readonly routes: string[];
}

/**
 * This construct is responsible for warming up the API Gateway endpoints.
 */

export default class ApiWarmer extends Construct {
  constructor(scope: Construct, id: string, props: ApiWarmerProps) {
    super(scope, id);

    const duration = props.duration ?? Duration.minutes(5);

    const event =
      props.event ??
      RuleTargetInput.fromObject({
        source: "serverless-plugin-warmup",
      });

    let targets: IRuleTarget[] = [];

    for (const route of props.api.routes) {
      const func = props.api.getFunction(route);
      if (func && props.routes.includes(route)) {
        console.log(`Adding warmer to ${route}...`);
        targets.push(
          new LambdaFunction(func, {
            event,
          })
        );
      }
    }

    // Split targets into chunks of 5 (the max number of targets per rule)
    const chunkSize = 5;
    let chunkId = 0;
    for (let i = 0; i < targets.length; i += chunkSize) {
      chunkId++;
      const chunk = targets.slice(i, i + chunkSize);

      //create the rule
      new Rule(scope, `ApiWarmerRule-${chunkId}`, {
        description: "API Warmup rule",
        targets: chunk,
        schedule: Schedule.rate(duration),
      });
    }
  }
}
```

This will expose a new Construct named ApiWarmer, that take a few parameters:

- `duration` between 2 warm-ups (by default 5 minutes)
- `event` content to provide to the Lambda function (by default the same content sent by the _serverless-plugin-warmup_, easier for us 🙃)
- `api` that will be warmed up (it must be a [SST Api](https://docs.sst.dev/constructs/Api) construct)
- `routes` that will be warmed up: a list of routes to be warmed up, because in our specific case we don't want to warm up all routes of the API

Then in your `MyStack.ts` you will be able to import and use this new construct:

```ts

import { Api } from "@serverless-stack/resources";
import ApiWarmer from "./constructs/ApiWarmer";

...

// Define your API first
new Api(stack, "Api", {
  routes: {
    "GET /notes": "src/list.main",
  },
});

...

// Warm up the API
new ApiWarmer(stack, "ApiWarmer", {
  api,
  routes: ["GET /notes"],
});
```

Under the hood it take advantage of the CDK [events.Rule](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_events.Rule.html) construct with a very simple utilisation. I have not used the [SST Cron](https://docs.sst.dev/constructs/Cron) construct to avoid creating to much ressources in the stack.

## To Conclude

Even if you can't find this specific plugin or feature in [SST](https://sst.dev/), it's not so complex to build around with the power of CDK. I think this is the greatest advantage of this framework 😍. To continue your journey don't leave before reading the following around SST!

- [OAuth with Serverless using SST](/oauth-with-serverless-using-sst)
- [Using the Strangler Fig Pattern in SST](/using-the-strangler-fig-pattern-in-sst)
- [🔒 Next Auth vs SST Auth](/next-auth-vs-sst-auth)

[Contact me on Twitter 🐣!](https://twitter.com/_julbrs)
