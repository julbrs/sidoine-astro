---
author: Julien Bras
pubDatetime: 2022-11-11 19:00:00
title: OAuth with Serverless using SST
postSlug: oauth-with-serverless-using-sst
featured: false
tags:
  - sst
  - serverless
  - oauth
  - smugmug
description: Part 4 of a series around SST - Serverless Stack. In this article, we will see how to implement OAuth with Serverless using SST.
---

> [!NOTE] SST Series
> This article is part of a series around SST - Serverless Stack. I will try to let you discover some amazing aspects of this particular solution in the serverless world.
>
> - Part 1: [SST is The Most Underrated Serverless Framework You Need to Discover](/sst-the-most-underrated-serverless-framework-you-need-to-discover)
> - Part 2: [SST is The Most Underrated Serverless Framework You Need to Discover (part 2)](/sst-the-most-underrated-serverless-framework-you-need-to-discover-part-2)
> - Part 3: [Why and How Migrate From Firebase to Serverless Stack?](/why-and-how-migrate-from-firebase-to-serverless-stack)
> - Part 4: [OAuth with Serverless using SST](/oauth-with-serverless-using-sst)

## Why we Need Authentication in a Serverless Application?

Once you have built your first serverless application, you may need to quickly invest effort in a authentication layer. For example on [Why and How Migrate From Firebase to Serverless Stack?](/why-and-how-migrate-from-firebase-to-serverless-stack) we choose to use an authentication based on **Google** in order to save some data relative to each user of our application.

## Why it's a Challenge?

It's a very classic use-case to implement an authentication system based on third-part actors, like Google or Facebook. Instead of managing locally a users and passwords system, it's generally more secure to allow a login via Google, and then Google servers is validating to our systems that the login is a success. There is multiple advantage here:

- the end-user have just to use his own Google login to connect to your application, and there is no need to create and store a new password
- your application doesn't have to manage and secure a password system

This classic scenario is using generally a standard named **[OAuth](https://en.wikipedia.org/wiki/OAuth)**, built to allow access delegation without sharing private credentials. As an example here is an abstract flow of the OAuth2 protocol found on Wikipedia:

![OAuth Abstract Flow](https://upload.wikimedia.org/wikipedia/commons/7/72/Abstract-flow.png)

There is a series of steps to achieve (about 5 or 6) and it's pretty tricky to implement this flow in a serverless stack, because such functions are by definition [stateless](https://sst.dev/chapters/what-is-aws-lambda.html): how to store temporary the authorization grant for example? That's why we generally rely on an authentication framework!

## What are the Options?

If you want to stick to serverless deployment, there is multiple options to implement an Authentication layer:

- [SST](https://sst.dev/) is providing multiple constructs ([`Cognito`](https://docs.sst.dev/constructs/Cognito), [`Auth`](https://docs.sst.dev/constructs/Auth)) for this precise request
- [Next.js](https://nextjs.org/), which can be [considered as a full-stack platform](https://www.youtube.com/watch?v=W4UhNo3HAMw) thanks to the backend capabilities, comes with [NextAuth.js](https://next-auth.js.org/) which is a promising solution to implement authentication in the platform.
- It's also possible to build a custom layer for the authentication, but we will not expend here on this option as it's the most time-consuming one 😅

> [!NOTE] NextAuth vs SST Auth
> I plan to post an article to compare the 2 options. [Stay tuned!](https://twitter.com/_julbrs)

## Let's Focus on SST Auth

This article will be focused on **SST [`Auth`](https://docs.sst.dev/constructs/Auth)** construct only: The [`Cognito`](https://docs.sst.dev/constructs/Cognito) construct (was named `Auth` [before SST 1.0](https://docs.sst.dev/constructs/v0/Auth) ) is based on [AWS Cognito User Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) and [Cognito Identity Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html), and provide less flexibility to the application owner at the end of the day. Read [here](https://docs.sst.dev/auth#why-not-use-cognito) why the SST team decided to create the new **Auth** construct.

The idea behind SST Auth is to provide to the application developer a simple way to implement an authentication system based. It's shipped with adapters for common use cases, like Google, Facebook adapters but you can extend it for your own use case.

Here we will use it to develop a small application with authentication based on the [SmugMug](https://www.smugmug.com/) provider. It's specific because SmugMug API is [supporting only OAuth 1.0a](https://api.smugmug.com/api/v2/doc/tutorial/authorization.html) today, so we will need to build our own custom adapter.

## Build Our Application (step-by-step)

> [!WARNING]
> This tutorial will use `yarn` and `TypeScript` as default language (as a classic convention) but feel free to explore the other option offered by SST.

You can follow the extensive [documentation](https://docs.sst.dev/quick-start), but the first step is to bootstrap our application:

```
yarn create sst --template=examples/api-sst-auth-google smugmug-auth
```

This will use the `examples/api-sst-auth-google` [starter](https://github.com/serverless-stack/sst/tree/master/examples/api-sst-auth-google) to step up the coding time. The goal then will be to replace the Google authentication by SmugMug.

Navigate to your project:

```
cd smugmug-auth/
```

First let's add a package to handle OAuth 1.0a authentication. My best bet is today [oauth](https://www.npmjs.com/package/oauth) which is not new but seems widely used. Unfortunately it doesn't support promises out-of-the-box.

```
cd services/
yarn add oauth
yarn add @types/oauth --dev
yarn add @serverless-stack/node
```

We can also populate the SmugMug API key and API key secret in a `.env.local` file (not pushed to git):

```
SMUGMUG_CLIENT_ID=your API key
SMUGMUG_CLIENT_SECRET=your API key secret
```

In order to generate such keys, you need to create a dedicated application in [SmugMug Developer](https://www.smugmug.com/app/developer) section.

Then let's start the SST application from the root folder. For this step it's required to be [authenticated on an AWS account](https://docs.sst.dev/advanced/iam-credentials#loading-from-a-file).

```
yarn start
```

SST is asking for a stage name. I use generally `dev` because I am the only one working on the application, and I deploy the production version on a dedicated `prod` stage later on. You can use the stage name you want.

Once the stack is up you can also start the react app:

```
cd web/
yarn dev
```

And you can try to login on Google:

![](/img/smugmug1.gif)

It doesn't work because of the mis-configuration of the application for the deployed backend but basically it's just a configuration point. Let's set up what we need for SmugMug authentication. Here is the flow we want:

- the user is accessing our application
- the user click on login
- the user is redirected to SmugMug in order to login and accept to share some informations (email, full name) with our application
- then the user is redirected to our application and authenticated.

### Backend

Let's start by tweaking the backend. The function `services/functions/auth.js` is the heart of the authentication system. It's actually using the **GoogleAdapter** inside the **AuthHandler** provided by SST. Unfortunately there is no SmugMugAdapter yet, neither a generic OAuth1.0aAdapter. So let's build it!

Create a new folder `services/functions/smugmug` and a first `api.ts` file inside:

```ts
import OAuth from "oauth";
const domain = "https://api.smugmug.com";
const baseUrl = `${domain}/api/v2`;

const requestUrl = `${domain}/services/oauth/1.0a/getRequestToken`;
export const authUrl = `${domain}/services/oauth/1.0a/authorize`;
const accessUrl = `${domain}/services/oauth/1.0a/getAccessToken`;
const signatureMethod = "HMAC-SHA1";

export interface OAuthToken {
  token: string;
  tokenSecret: string;
}
export const SmugMugOAuth = class {
  oauth: OAuth.OAuth;

  constructor(consumerKey: string, consumerSecret: string) {
    this.oauth = new OAuth.OAuth(
      requestUrl,
      accessUrl,
      consumerKey,
      consumerSecret,
      "1.0A",
      null,
      signatureMethod,
      undefined,
      // mandatory to get JSON result on GET and POST method (LIVE API Browser instead!)
      { Accept: "application/json" }
    );
  }

  getOAuthRequestToken = async (callback: string): Promise<OAuthToken> => {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthRequestToken(
        {
          oauth_callback: callback,
        },
        (error, oAuthToken, oAuthTokenSecret, results) => {
          if (error) {
            reject(error);
          }
          resolve({ token: oAuthToken, tokenSecret: oAuthTokenSecret });
        }
      );
    });
  };

  getOAuthAccessToken = async (
    requestToken: OAuthToken,
    oAuthVerifier: string
  ): Promise<OAuthToken> => {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(
        requestToken.token,
        requestToken.tokenSecret,
        oAuthVerifier,
        (error, oAuthAccessToken, oAuthAccessTokenSecret, results) => {
          if (error) {
            reject(error);
          }
          resolve({
            token: oAuthAccessToken,
            tokenSecret: oAuthAccessTokenSecret,
          });
        }
      );
    });
  };

  get = async (url: string, accessToken: OAuthToken) => {
    return new Promise((resolve, reject) => {
      this.oauth.get(
        `${domain}${url}`,
        accessToken.token,
        accessToken.tokenSecret,
        (error, responseData, result) => {
          if (error) {
            console.log(error);
            reject(error);
          }
          if (typeof responseData == "string") {
            resolve(JSON.parse(responseData).Response);
          } else {
            const err = Error("not a valid answer");
            console.log(err.message);
            reject(err);
          }
        }
      );
    });
  };
};
```

This file is creating a `SmugMugOAuth` class that is wrapping the `oauth` lib for us. It will then be easier to call for the various function provided by `oauth`, with promises support! It defines the following methods:

- `getOAuthRequestToken` to get a Request Token (first part of the OAuth exchange)
- `getOAuthAccessToken` to get an Access Token (second part of the OAuth exchange)
- `get` to query the SmugMug API with a provided access token

Then in the same folder let's create an `adapter.ts` to build our custom **SmugMugAdapter**:

```ts
import {
  useCookie,
  useDomainName,
  usePath,
  useQueryParams,
} from "@serverless-stack/node/api";
import { createAdapter } from "@serverless-stack/node/auth";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authUrl, OAuthToken, SmugMugOAuth } from "./api";

export interface SmugMugUser {
  userId: string;
  fullName: string;
  uri: string;
  webUri: string;
  accessToken: OAuthToken;
}

export interface SmugMugConfig {
  /**
   * The clientId provided by SmugMug
   */
  clientId: string;
  /**
   * The clientSecret provided by SmugMug
   */
  clientSecret: string;

  onSuccess: (user: SmugMugUser) => Promise<APIGatewayProxyStructuredResultV2>;
}

export const SmugMugAdapter = createAdapter((config: SmugMugConfig) => {
  return async function () {
    const oauth = new SmugMugOAuth(config.clientId, config.clientSecret);

    const [step] = usePath().slice(-1);

    if (step === "authorize") {
      // Step 1: Obtain a request token

      const callback =
        "https://" +
        [useDomainName(), ...usePath().slice(0, -1), "callback"].join("/");

      const requestToken = await oauth.getOAuthRequestToken(callback);

      // Step 2: Redirect the user to the authorization URL
      const expires = new Date(Date.now() + 1000 * 30).toUTCString();

      return {
        statusCode: 302,
        cookies: [
          `req-token=${JSON.stringify(
            requestToken
          )}; HttpOnly; expires=${expires}`,
        ],
        headers: {
          location: `${authUrl}?oauth_token=${requestToken.token}&Access=Full&Permissions=Modify`,
        },
      };
    }

    // Step 3: The user logs in to SmugMug (on SmugMug side)
    // The user is presented with a request to authorize your app

    // Step 4: If the user accepts, they will be redirected back to your app, with a verification code embedded in the request
    // Use the verification code to obtain an access token

    if (step === "callback") {
      const params = useQueryParams();
      const reqToken: OAuthToken = JSON.parse(useCookie("req-token"));
      const accessToken = await oauth.getOAuthAccessToken(
        reqToken,
        params.oauth_verifier!
      );
      const response: any = await oauth.get(`/api/v2!authuser`, accessToken);
      const user: any = response.User;

      return config.onSuccess({
        userId: user.NickName,
        fullName: user.Name,
        uri: user.Uri,
        webUri: user.WebUri,
        accessToken,
      });
    }

    throw new Error("Invalid auth request");
  };
});
```

The class `SmugMugAdapter` is a custom adapter created by the `createAdapter` method described in the [Auth documentation](https://docs.sst.dev/auth#custom-adapters).

It describe all the steps for the OAuth 1.0a process:

- when the endpoint `authorize` is called, it call the method `getOAuthRequestToken`
- then we send the user to the authorization URL on SmugMug with the request token
- SmugMug will redirect the user to the application with a verification code
- With the verification code we can request an access token!
- Finally we are calling the `/api/v2!authuser` to retrieve the autenticated user information.

Then we need to adapt the `services/functions/auth.ts` file to use our custom adapter:

```ts
import { Session, AuthHandler } from "@serverless-stack/node/auth";
import { Table } from "@serverless-stack/node/table";
import { ViteStaticSite } from "@serverless-stack/node/site";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { SmugMugAdapter, SmugMugUser } from "./smugmug/adapter";

declare module "@serverless-stack/node/auth" {
  export interface SessionTypes {
    user: {
      userID: string;
    };
  }
}

export const handler = AuthHandler({
  providers: {
    smugmug: SmugMugAdapter({
      clientId: process.env.SMUGMUG_CLIENT_ID!,
      clientSecret: process.env.SMUGMUG_CLIENT_SECRET!,
      onSuccess: async (user: SmugMugUser) => {
        const ddb = new DynamoDBClient({});
        await ddb.send(
          new PutItemCommand({
            TableName: Table.users.tableName,
            Item: marshall(user),
          })
        );

        return Session.parameter({
          redirect: process.env.IS_LOCAL
            ? "http://127.0.0.1:3000"
            : ViteStaticSite.site.url,
          type: "user",
          properties: {
            userID: user.userId,
          },
        });
      },
    }),
  },
});
```

Basically we just remove the **GoogleAdapter** and put instead our **SmugMugAdapter**! We can also see that we are storing our user in a DynamoDB table (which was already created in the original template). It can be a nice place to store data related to our users.

Finally pass the environment variables to the `auth` Lambda in `stacks/MyStack.ts`:

```ts
// Create Auth provider
const auth = new Auth(stack, "auth", {
  authenticator: {
    handler: "functions/auth.handler",
    bind: [site],
    environment: {
      SMUGMUG_CLIENT_ID: process.env.SMUGMUG_CLIENT_ID!,
      SMUGMUG_CLIENT_SECRET: process.env.SMUGMUG_CLIENT_SECRET!,
    },
  },
});
```

### Frontend

In the frontend we just have to modify the url to redirect the user. Instead of `auth/google/authorize/`, it will be `auth/smugmug/authorize/`:

In `web/src/App.jsx`, line 70:

```jsx
<div>
  <a
    href={`${import.meta.env.VITE_APP_API_URL}/auth/smugmug/authorize`}
    rel="noreferrer"
  >
    <button>Sign in with SmugMug</button>
  </a>
</div>
```

And that's it ; you made it!

![](/img/smugmug2.gif)

The `session` page is a bit buggy here because we didn't adapt the Google data to the SmugMug data. But you can check that we can retrieve user information in the developer tools:

![](/img/smugmug3.png)

Here is the [GitHub repository of the final project](https://github.com/julbrs/sst-smugmug-auth).

## What we Learned Here?

Starting from a bootstrapped project from SST, we have easily adapted it to support the third-party authentication provider we need with the help of the easily extendable construct provided.

You can continue the journey by reading the extensive documentation about [Auth](https://docs.sst.dev/auth). It's also possible to rely on the [OAuth](https://docs.sst.dev/auth#oauth) adapter that is supporting out of the box any OAuth2 compatible service.

Happy authentication!
