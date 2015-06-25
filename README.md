# `mr-angular-pages`

## Requirements

* a `fetch()` polyfill. (like `npm:whatwg-fetch`)

## Getting started

```js
import {Inject} from 'npm:fd-angular-core';
import {Page} from 'npm:mr-angular-pages';

@Page({
  template: `<p>{{ app.message }}</p>`
  children: [
    // Regular child states go here.
  ]
})
class HomePage extends BasicPage {

  constructor() {
    // Summary is available here:
    //   this.title, etc...
  }

  activate() {
    // Details are available here
  }

  someAction($event) {
    // perform some action here
  }

  get someData() {
    // calculated property
  }

}
```
