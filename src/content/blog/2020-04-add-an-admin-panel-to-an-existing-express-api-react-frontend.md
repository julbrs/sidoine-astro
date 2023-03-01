---
author: Julien Bras
pubDatetime: 2020-04-13 19:00:00
title: Add an Admin Panel to an existing Express API - React frontend
postSlug: add-an-admin-panel-to-an-existing-express-api-react-frontend
featured: false
tags:
  - strapi
  - node
  - express
description: Compare JS solutions to add an Admin Panel to an existing Express API - React frontend
---

## Context

Here is a quick personal review of JS solution for generating an Admin Panel today (April 2020). The goal is to add an admin panel to an existing Express API backend + React frontend.

I want to have something comparable to the [Django Admin](https://docs.djangoproject.com/en/3.0/ref/contrib/admin/) as a reference.

It must manage:

- some kind of authentication
- some kind of file management, ideally with *S3 hosting* as the backend is running on *Heroku*
- I am OK to add modules to my existing Express application, or change completely the backend.

## AdminBro

![[adminbro.png]]

Just an admin-panel to add on Express app. There is no easy way to add a file upload feature ([this](https://adminbro.com/DropZone.html) can help). But it is a great tool to not modify to much my existing solution.

## Strapi.io

This tool is more a *Content Management System* than a *Framework*. It define itself as a `headless CMS`. I can find some *Drupal* inspiration inside the tool:

- tool to manage different Content-Type (entities)
- plugin system to add authentication (lots of providers supported)
- support a classic database or MongoDB
- obviously there is an admin panel to manage the entities
- you can manage files, and it can be handled by default on various providers including S3 (good !)
- it provide out of the box a REST api, and you can also activate a GraphQL api easily.

It is a very fast way to create a headless backend. But as it rely a lot on plugins, you may not find exactly the feature you need. For example there is no *Internationalization* [plugin](https://medium.com/strapi/content-internationalization-with-strapi-507ef5869c15) *yet* to manage multiple language.

## Feathersjs

This is a framework. No admin interface.

- entities are service (very easy to add a new service !)
- handle different backend including Mongo
- no admin webapp backend but there is a [react-admin plugin](https://github.com/josx/ra-data-feathers) ! [react-admin](https://marmelab.com/react-admin/) is a solution to add an admin panel directly in a react application
- *react-admin* is not easy to implement !
- nothing for file upload out of the box

## Back4app

This is a hosted version of Parse server. Parse use to be a tool provided by Facebook, but it now an open-source tool [here](https://parseplatform.org/). It seems we cannot consume data as raw RESTapi but rather with a dedicated SDK.

![[back4app.png]]

Provide lots of stuff out of the box

- API to consume the data
- Authentication with multiple providers
- Admin Panel (yes it is mandatory for my little selection !)
- File management

## React-Admin

[This](https://marmelab.com/react-admin) is a React library that can generate an admin panel. It rely on existing REST or GraphQL API , with a a DataProvider object that explain how to communicate with the API. It is needed to write the DataProvider if your API does not stick exactly with an [already available](https://marmelab.com/react-admin/DataProviders.html#available-providers) DataProvider. In my case the *Simple REST* was not compatible directly.

![[react-admin.png]]

## Conclusion

I was pushing hard on *AdminBro* but I wasn't able to handle a clean and fast solution for one of my entities that is linked to a file. The file management seems not obvious for me ! *AdminBro* is not hard to install and setup but it require customization to fit exactly with your existing Express application. My main issue was this file management point.

*Feathers* is a nice idea, but it require a *start from scratch* regarding the backend, and the *react-admin* solution was not so *magic*.

About *Back4app* it is the first time I was dealing with the Parse system. I was worried to need to implement a specific Parse Client API inside my frontend to use it. The goal was not to rebuild completely the frontend application.

Finally I decided to give a try with *Strapi.io* and check if it fit my collaborators ! I know it is not perfect but it is very fast to setup and deploy.

### Update 2020-04-22

Finally I have decided to use the [react-admin](https://marmelab.com/react-admin/) project in the frontend part:

- It does not need to replace my existing Express API. It save me some time.
- It is more all-in-one place for all my users. Both end-users and admin-users can consume the same url, same application. It is globally easier.
- It seems pretty intimidating to create a custom [DataProvider](https://marmelab.com/react-admin/DataProviders.html#writing-your-own-data-provider) for my existing API but the documentation of the project is accessible and I have managed to setup [mine](https://github.com/julbrs/montessori-ressources/blob/8b374ed92e9dabead47b2434619bc7693626e0b8/src/components/Admin/dataprovider.js) in a couple of hours.

_Let me know in comment what is your favorite admin-panel solution, and why you need one !_
