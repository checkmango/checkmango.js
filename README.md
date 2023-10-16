# Checkmango SDK for JavaScript

## Introduction

This is the official JavaScript SDK for [Checkmango](https://checkmango.com). It provides convenient access to the Checkmango API for applications written in JavaScript.

## Installation

### Installing the package

Install with `npm install @checkmango/checkmango.js`.

### Create an API key

Create a new API key from your [Checkmango dashboard](https://checkmango.com/user/api-tokens).

Add your API key into your project, for example as `CHECKMANGO_API_KEY` in your `.env` file. Do the same for your `CHECKMANGO_TEAM_ID`.

## Usage

>**Warning**
> Do not use this package directly in the browser, as this will expose your API key.
> Instead, use this package in a server-side application and make requests to your server from the browser.

```js
import Checkmango from '@checkmango/checkmango.js';
const cm = new Checkmango(process.env.CHECKMANGO_API_KEY, process.env.CHECKMANGO_TEAM_ID);

const health = await cm.health();
``` 

Parameters for requests should be passed in an object. For list methods, these parameters are used for filtering and for list pagination. For create and update methods, these parameters contain the values for the request.

```js
const experiments = await cm.listExperiments({ perPage: 10 });

const experiment = await cm.getExperiment({ key: 'MY_EXPERIMENT', include: ['variants'] });

const experiment = await cm.createExperiment({ key: 'MY_EXPERIMENT', event: 'MY_EVENT' });
```

### Including related resources

You can include related resources in the response by passing an array of relationships to the `include` parameter.

```js
const experiment = await cm.getExperiment({ key: 'MY_EXPERIMENT', include: ['variants', 'team'] });
```

### Pagination

List methods return a `List` object, which contains the list of resources and pagination information.

```js
const experiments = await cm.listExperiments({ perPage: 10, page: 2 });
```