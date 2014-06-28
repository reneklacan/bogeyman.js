var http = require('http');
var phantom = require('phantom');
var util = require('util');
var phantoms = {};
var port = 40000;

http.createServer(function(request, response) {
  response.writeHead(200);

  request.on('data', function(message) {
    var command = JSON.parse(message.toString('utf-8'));

    var defaultParams = {
      method: 'GET',
      data: {},
      params: {
        web_security: 'no',
        ignore_ssl_errors: 'yes',
        load_images: 'no',
      }
    }

    var params = defaultParams;
    var phantomParams = [];

    for (var attr in command.params) {
      params.params[attr] = command.params[attr];
    }

    console.log(command);

    ['url', 'method', 'data'].forEach(function(attr) {
      console.log(command[attr]);
      if (command[attr] === undefined)
        return;

      params[attr] = command[attr];
    })

    for (var attr in params.params) {
      value = params.params[attr];
      attr = attr.replace(/_/g, '-');
      phantomParams.push(util.format("--%s=%s", attr, value));
    }

    var phantomKey = phantomParams.join(' ');

    var createPageCallback = function(page) {
      page.set('onResourceReceived', function (resource) {
        if (resource.stage == 'end') {
          if (page.additional === undefined) {
            page.additional = {};
          }

          page.additional.status = resource.status;
        }
      })

      console.log(command.url)
      console.log(params);

      page.open(params.url, params.method, params.data, function (status) {
        if (status == "success") {
          page.evaluate(
            function(params) {
              return {
                status: 'success',
                response: {
                  code: params.code,
                  body: document.documentElement.innerHTML,
                }
              };
            },
            function(result) {
              response.write(JSON.stringify(result));
              response.end();
            },
            {
              //code: page.additional.status
            }
          )
          page.close();
        }
        else {
          console.log('fail');
          response.write(JSON.stringify({
            status: status,
            response: null,
          }));
          response.end();
        }
      })
    }

    if (phantoms[phantomKey]) {
      phantoms[phantomKey].createPage(createPageCallback);
    }
    else {
      phantomParams.push({ port: port++ });
      phantomParams.push(function(phantomInstance) {
        phantoms[phantomKey] = phantomInstance;
        phantomInstance.createPage(createPageCallback);
      });

      phantom.create.apply(this, phantomParams);
    }
  });

  request.on('end',function(){
  });
}).listen(8080);
