# Bogeyman.js

## Usage

Run server

```bash
node bogeyman.js
```

Make a request

```bash
curl -XGET "localhost:8080" --data '
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

## Advanced

TBD

## License

TBD
