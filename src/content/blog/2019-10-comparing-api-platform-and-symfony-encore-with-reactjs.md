---
author: Julien Bras
pubDatetime: 2019-10-04 19:00:00
title: Comparing API Platform and Symfony Encore with ReactJS
postSlug: comparing-api-platform-and-symfony-encore-with-reactjs
featured: false
tags:
  - api
  - javascript
  - symfony
  - react
  - php
description: Compare Symfony Encore with ReactJS and API Platform
---

This article have been written in Oct 2019 and the goal is to compare **at this date** the main differences between the 2 projects. No proper comparison have be found *yet* by myself, so I am writing one !

## Symfony

It is a PHP framework that allow to produce webapp, web API, etc. Backed by Sensio Labs. More details here [https://symfony.com](https://symfony.com/).

## Symfony Encore

It is a Symfony package that allow to use frontend javascript inside Symfony. It allow using ReactJS within Symfony. Here is some example and the official documentation:

- [https://symfony.com/doc/current/frontend/encore/simple-example.html](https://symfony.com/doc/current/frontend/encore/simple-example.html)
- [https://symfony.com/doc/current/frontend/encore/reactjs.html](https://symfony.com/doc/current/frontend/encore/reactjs.html)
- [https://auth0.com/blog/developing-modern-apps-with-symfony-and-react/#Building-the-Frontend-App-with-React](https://auth0.com/blog/developing-modern-apps-with-symfony-and-react/#Building-the-Frontend-App-with-React)
- [https://medium.com/@lmatte7/how-to-use-react-with-symfony-4-88fb27abf5e5](https://medium.com/@lmatte7/how-to-use-react-with-symfony-4-88fb27abf5e5)

It is possible to have a Single Page Application or to create multiple React app inside the same Symfony package. You must run the Symfony server and the encore app when you are developing on the application. There is no ‘auto-refresh’ feature like you have on a CRA React app.

![](/img/symfony1.png)

## API Platform

API Platform is an development environnement, based on Symfony, that allow to create and deploy an application with an API backend (REST or GraphQL), and a frontend (React by default). It is API-first in mind.

The documentation is here [https://api-platform.com](https://api-platform.com/).

The development environment is based on Docker containers, and it has been developed to make it easy to deploy on cloud ready systems (like k8n or other).

![](/img/symfony2.png)

There is no way in this project to use the ‘default’ template layout of Symfony, you must have a SPA application. There is only one React app needed !

## Which one to choose ?

This is an hard point. Each solution comes with specific advantages.

The API part of API Platform is in fact a composer package that you can easily install on a existing Symfony platform ( composer require api ). You will then be able to use the very powerful annotation @ApiRessource to present any entity as full CRUD REST API ([see here](https://api-platform.com/docs/core/getting-started/#mapping-the-entities)).

I think it is easier to integrate slowly a ReactJS frontend with Symfony Encore, as you can keep your codebase and existing templates. But API Platform is more powerful when starting brand new project that will need a webapp and a mobile app.

What is your choice ? [Let me know](https://twitter.com/_julbrs/status/1180184235535142914) !
