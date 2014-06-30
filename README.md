# Bogeyman.js

Bogeyman is application build upon awesome PhantomJS and it provides
REST API so you can use PhantomJS headless crawling of heavy javascript
webspages within any programming language or curl.

## Installation

You can install it globally

```bash
npm install -g bogeyman
```

Or locally

```bash
npm install bogeyman
```

## Usage

Run server

```bash
bogeyman 31313 # if you installed it via npm install
node ./bin/bogeyman 31313 # if you cloned a repo
```

Make a request

```bash
curl -XPOST "localhost:31313" --data '
{
  "url": "http://yuna.sk",
  "method": "GET",
  "data": {},
  "params": {
    "proxy": "127.0.0.1:9999",
    "proxy_type": "socks5"
  }
}
```

And get result

```bash
{
  "response": {
    "body": "<html>...</html>",
    "code": 200
  },
  "status": "success"
} 
```

## Cookies

```bash
curl -XPOST "localhost:31313" --data '
{
  "url": "http://yuna.sk",
  "method": "GET",
  "data": {},
  "cookies": [
    {
      "name": "test",
      "value": "test",
      "domain": "yuna.sk",
      "path": "/path",
      "httponly": false,
      "secure": false,
      "expires": 1405164630
    }
  ]
}
'
```

## Advanced

TBD

## License

This library is distributed under the Beerware license.
