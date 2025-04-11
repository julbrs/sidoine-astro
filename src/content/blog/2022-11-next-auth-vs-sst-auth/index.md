---
author: Julien Bras
pubDate: 2022-11-20 19:00:00
title: 🔒 Next Auth vs SST Auth
postSlug: next-auth-vs-sst-auth
featured: true
tags:
  - sst
  - serverless
  - nextjs
  - oauth
description: "A side-by-side comparison of Next Auth and SST Auth: two solutions to implement OAuth authentication in your Next.js application."
---

In a previous article, I describe how to use [SST Auth](/oauth-with-serverless-using-sst) construct in order to implement an OAuth authentication workflow for your application. [Next.js](https://nextjs.org/), the _React framework for production_ is also providing a component named [NextAuth.js](https://next-auth.js.org/) that can be used to implement such authentication system. Let's compare the two solutions! 🤺

## What is SST Auth?

[SST](https://sst.dev/) is framework designed to build **backend serverless applications** initially. I have already written a couple of articles on this solution ([here](/sst-the-most-underrated-serverless-framework-you-need-to-discover) and [here](/sst-the-most-underrated-serverless-framework-you-need-to-discover-part-2) for example). It provides features to deploy web applications too (for example via the [StaticSite](https://docs.sst.dev/constructs/StaticSite) construct) so it's advertised as a tool to build _full-stack serverless applications_.

The [Auth](https://docs.sst.dev/auth) module is a dedicated set of components built by the SST team to implement an authentication system inside your application. It works well with a web application like a React app.

## What is NextAuth.js?

[Next.js](https://nextjs.org/) is probably the most famous React-based framework available today, and gain a lot of visibility in the last few years. Today with version 13, it's truly a **full-stack framework solution** with the support of server-side rendering options and an API layer. You can check for example the [Theo Browne video: Next.js is a backend framework](https://www.youtube.com/watch?v=W4UhNo3HAMw) which is a good introduction to the backend part.

[NextAuth.js](https://next-auth.js.org/) is an independent library (not supported by **Vercel**), with the following motto: _"Authentication for Next.js"_ It provides a built-in solution to implement an authentication system for Next.js, based on OAuth protocol.

You know the actors, it's now time to get to the comparison bullet points, let's fight 😇

![](./next-auth.jpeg)

## Round 1: Supported Adapters/Providers!

Nowadays, authentification is not only email-password credentials. It's more **social logins** like Google, Facebook, or GitHub. It's more secure for the application developer (no more password to store!) and for the application end-user (no new password to remember!). Let's check what is supported by our two choices.

First, **SST Auth** is supporting out of the box today (November 2022) [seven adapters](https://docs.sst.dev/auth#adapters): Google, GitHub, Twitch, Facebook, Magic Link, OAuth, and OIDC. The last two are generic adapters that can be used for any application which is supporting [OAuth2](https://oauth.net/2/) or [OIDC](https://openid.net/connect/). Finally, there is an option to build a [Custom Adapter](https://docs.sst.dev/auth#custom-adapters) if nothing fit your needs. For example in this [last article](/oauth-with-serverless-using-sst), I have built a custom adapter to support **SmugMug**, which is relying on the **OAuth 1.0a** protocol.

**NextAuth.js** is supporting out the box more than [20 providers](https://next-auth.js.org/providers/): the classic ones like Google, Facebook, and GitHub are here, but there are more options compared to SST Auth. Additionally, there is also an [email](https://next-auth.js.org/configuration/providers/email) provider (can be compared to the _Magic Link_ one on SST Auth) or a [custom provider](https://next-auth.js.org/configuration/providers/oauth#using-a-custom-provider). Finally, the [Credentials](https://next-auth.js.org/configuration/providers/credentials) provider is an ideal solution if you need to login via username password, or other arbitrary credentials (YubiKey for example).

➡️ There is much out-of-the-box options using **NextAuth.js** compared to **SST Auth**. But both solutions provide you customization if needed.

## Round 2: Easiness To Implement!

Authentication is a [serious](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) subject, and you don't want to rely on a system that you don't trust 100%. That's why it's important to understand how to implement the solution, and how easily you will be able to understand it and tweak it ultimately.

Let's get a look at **SST Auth**:

- you first need to add the `Auth` construct in your infrastructure stack (generally the `stacks/MyStack.ts` file)

```ts
import { Auth } from "@serverless-stack/resources";

const auth = new Auth(stack, "auth", {
  authenticator: {
    handler: "functions/auth.handler",
  },
});

auth.attach(stack, {
  api: myApi,
  prefix: "/auth", // optional
});
```

- then you can build a new serverless function in `src/functions/auth.ts` that will be responsible for all the authentication calls (`authorize` and `callback` endpoints for OAuth2 for example):

```ts
import { AuthHandler, GoogleAdapter } from "@serverless-stack/node/auth";

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID: "XXXX",
      onSuccess: async (tokenset) => {
        return {
          statusCode: 200,
          body: JSON.stringify(tokenset.claims()),
        };
      },
    }),
  },
});
```

This example case (from the [Auth documentation](https://docs.sst.dev/auth#add-a-handler)) is creating an authentication system based on Google SignIn. It will expose 2 endpoints:

- `/auth/google/authorize`
- `/auth/google/callback`

- Finally, it's up to your frontend application (React for example) to redirect the user to the `autorize` backend endpoint (this will start the OAuth2 flow).

Let's now zoom on **NextAuth.js**:

- First, you need to install NextAuth.js in your Next.js project:

```
yarn add next-auth
```

- Then you have to create a new API in your Next project, inside the designed `pages/api/` folder. So create a file named `pages/api/auth/[...nextauth].js` with the following content:

```js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
};
export default NextAuth(authOptions);
```

This API proxy endpoint is the exact equivalent of the `auth.ts` created for SST. **NextAuth.js** will take care to create multiple endpoints for `authorize` and `callback` in order to support OAuth2.

- Then it's advised to implement the `SessionProvider` at the top level of the application (in `pages/_app.jsx`):

```jsx
import { SessionProvider } from "next-auth/react";
export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

- And finally use the dedicated methods provided by **NextAuth.js** to allow the end-user to sign in or sign out:

```jsx
import { useSession, signIn, signOut } from "next-auth/react";
export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
```

This article will not go deeper into the implementation, but each solution is providing a session system to retrieve the user data on the frontend and on the backend side. It's also possible to prevent access for not authenticated users.

➡️ To conclude on this aspect, both solutions are simple enough to be used by a frontend developer, and it does not require a big amount of code to be used. The documentation provided is also very complete. It's a draw!

## Round 3: Store User-Related Information!

Once authentication is implemented, you may need to store some information relative to each user. For exemple, the profile section needs to be persisted, or any pertinent information for your precise business case. Again both solutions come with a solution for that.

For **SST Auth**, it's fairly natural to rely on a distinct SST construct, [Table](https://docs.sst.dev/constructs/Table) that is relying on AWS DynamoDB. By implementing the `onSuccess` method available in each adapter, it's possible to store the user data in DynamoDB:

```ts
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
          redirect: process.env.IS_LOCAL ? "http://127.0.0.1:3000" : ViteStaticSite.site.url,
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

_Example took from [OAuth with Serverless using SST](/oauth-with-serverless-using-sst)_

With **NextAuthjs**, it's possible to implement an [adapter](https://next-auth.js.org/adapters/overview) (⚠️ NextAuthjs adapter is not the same as an SST Auth adapter!). There are more than 10 options, including DynamoDB, Firebase, Prisma, FaunaDB... Let's zoom in on DynamoDB adapter here:

- Install the corresponding adapter:

```bash
yarn add next-auth @next-auth/dynamodb-adapter
```

- Edit your existing API in `pages/api/auth/[...nextauth].js`:

```js
import { DynamoDB } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter"

const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY as string,
  },
  region: process.env.NEXT_AUTH_AWS_REGION,
};

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: DynamoDBAdapter(
    client
  ),
});
```

You will have more information on the adapter [here](https://next-auth.js.org/adapters/dynamodb). Take note that you will need to create the DynamoDB table before using it (NextAuth.js does not handle the creation of the resource).

➡️ Both solutions implement options to store information relative to the user. SST relies on _constructs_ and NextAuth relies on _adapters_. SST is a more _integrated_ solution because it will handle the creation of the resource (infrastructure as code built-in). No clear winner here again!

## Round 4: Deploy Options!

Now it's time to ship your application 🚀 ! How easy is the process for each solution? Let's find it!

**SST Auth** is part of **SST** obviously. This serverless framework is designed to be used with **AWS**. So you need to rely on this specific cloud provider, but it comes with a dedicated CLI command to push your application. As [documented](https://docs.sst.dev/quick-start#4-deploy-to-prod), this command will send your application to the ~~heavens~~ cloud:

```
yarn deploy --stage prod
```

> It's recommended to use **a specific stage** for the production environment as SST is designed to use multiple instances: when you develop on the application you are using a distinct stage (like dev) with the powerful [Live Lambda Development](https://docs.sst.dev/live-lambda-development) mode.

Regarding **NextAuth.js**, you will have to deploy a **Next.js** application. The short path here is to deploy your application on [Vercel](https://vercel.com/), the creators of **Next.js**. It comes with a pretty generous free tier, and it works out-of-the-box: automatic deployments with GitHub, preview deployments, etc... But a Next.js application can be also deployed in many other providers. For your own managed Node server to serverless deployment, it's up to you to choose the right one! See the complete list on [Next.js documentation page](https://nextjs.org/docs/deployment).

> Let's mention that it's possible to deploy a **Next.js** application using **SST** 😅.
> This setup relies on the [serverless-next.js](https://github.com/serverless-nextjs/serverless-next.js) project and it's hidden behind a construct named [NextJsSite](https://docs.sst.dev/constructs/NextjsSite). It can be a very efficient solution when you want to ship your application on AWS environment (I use it for a production workload in my current company).

➡️ To conclude on this section, **SST** is by design more restricted on the deployment (**AWS** only). For **Next.js**, the classic way is to rely on **Vercel** but other options are available (including SST itself on AWS).

## Conclusion

It's by design not fair to compare tools that are not in the same category! But I think it's useful sometimes to compare a specific feature (here authentication) as the implementation in both solutions is very comparable.

**SST** is a really good option when you need to build an application that will have to rely on multiple AWS services; it's possible to define using _Infrastructure as Code_ and then consume a [Queue](https://docs.sst.dev/constructs/Queue), a [Bucket](https://docs.sst.dev/constructs/Bucket), a [Database](https://docs.sst.dev/constructs/RDS) to name a few available constructs. It's the most extensible solution here. Read my introduction to SST here: [SST is The Most Underrated Serverless Framework You Need to Discover](/sst-the-most-underrated-serverless-framework-you-need-to-discover)

**NextAuth.js** is _just_ a library, and it's more quick to add the authentication layer in an existing **Next.js** application with this solution. It's the most integrated solution here.

I recommend playing with the two solutions here and giving me your feedback on [Twitter](https://twitter.com/_julbrs) (if it's still up and running when you read it 😅).
