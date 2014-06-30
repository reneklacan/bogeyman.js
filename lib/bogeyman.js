var http = require('http');
var phantom = require('phantom');
var util = require('util');
var phantoms = {};
var port = 41000;

function bogeyman() {
  http.createServer(function(request, response) {
    response.writeHead(200);

    request.on('data', function(message) {
      try {
        var command = JSON.parse(message.toString('utf-8'));
      }
      catch (e) {
        if (e instanceof SyntaxError) {
          // return invalid command if message cannot be parsed
          response.write(JSON.stringify({
            status: 'invalid command',
            response: null,
          }));
          response.end();
          return;
        } else {
          throw e; // let others bubble up
        }
      }

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

      // update params from received command
      for (var attr in command.params) {
        params.params[attr] = command.params[attr];
      }

      ['url', 'method', 'data', 'cookies'].forEach(function(attr) {
        if (command[attr] === undefined)
          return;

        params[attr] = command[attr];
      })

      // convert params to valid phantom params
      for (var attr in params.params) {
        value = params.params[attr];
        attr = attr.replace(/_/g, '-');
        phantomParams.push(util.format("--%s=%s", attr, value));
      }

      var phantomKey = phantomParams.sort().join(' ');

      var createPageCallback = function(page) {
        // get http status and store it
        page.set('onResourceReceived', function (resource) {
          if (resource.stage == 'end') {
            if (page.additional === undefined) {
              page.additional = {};
            }

            page.additional.status = resource.status;
          }
        })

        console.log(params.method + ' ' + params.url);

        // retrieve url content and return response
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
                response.write(JSON.stringify(result, null, 2));
                response.end();
              },
              {
                code: page.additional.status
              }
            )
            page.close();
          }
          else {
            response.write(JSON.stringify({
              status: status,
              response: null,
            }, null, 2));
            response.end();
          }
        })
      }

      // use existing phantom instance or create new instance
      // instances are identified by used arguments
      if (phantoms[phantomKey]) {
        phantoms[phantomKey].createPage(createPageCallback);
      }
      else {
        // use current port and increment it for next use
        phantomParams.push({ port: port++ });
        phantomParams.push(function(phantomInstance) {
          phantoms[phantomKey] = phantomInstance;
          (params.cookies || []).forEach(phantomInstance.addCookie);
          phantomInstance.addCookie;
          phantomInstance.createPage(createPageCallback);
        });

        phantom.create.apply(this, phantomParams);
      }
    });
  }).listen(process.argv[2] || 31313);
}

exports.bogeyman = bogeyman
