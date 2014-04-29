Dompletion
=====

Dompletion is a DOM-Aware JavaScript Code Completion tool that assists the developer in writing fault-free JavaScript code that interacts with DOM. Dompletion is build on top of [Ace](http://ace.c9.io/#nav=about), an embeddable code-editor written in JavaScript. Just like Ace it can be embedded into any web page or JavaScript application.




## Configuration

Dompletion has been tested with the photo gallery application [Phormer](http://p.horm.org/er/). This example application contains some basic synchronous and asynchronous JavaScript events. To use Clematis with the Phormer gallery application, download Phormer and deploy it locally using a personal webserver such as [MAMP](http://www.mamp.info/en/index.html). 


## Web Crawler
>The following step is only required if you are using Dompletion for any web application other than Phormer.

The URL to the web application will then need to be passed into Dompletion web crawler (crawler.jar) as an argument, for example:

```
--url http://localhost:8888/phormer331/index.php

```



## Running Dompletion

In terms of running, setting up the project is easier than ever. Simply checkout the project from GitHub. After the checkout Dompletion works out of the box. No build step is required. 

To try it out, simply start the bundled mini HTTP server:

```python
    ./static.py
```

Or using Node.JS

```javascript
    npm install mime
    node ./static.js
```

The editor can then be opened at http://localhost:8888/kitchen-sink.html.


## Contributing

Your feedback is valued! Please use the [Issue tracker](https://github.com/saltlab/dompletion/issues) for reporting bugs or feature requests.


