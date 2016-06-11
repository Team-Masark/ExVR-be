var _ = require('lodash');
var fs = require('fs');
var request = require('request');
var Promise = require('es6-promise').Promise;
var imageStitcher = require('../services/imageStitcher');
var q = require('q');

var streetmapImgSvc = function() {
  var config = {
    'streetMapKey': 'AIzaSyDF_xPIhuK16vhxNSkHvG-u2XbVeeef0GI'
  };

  var fetchData = function(config) {
    return new Promise(function(resolve, reject) {
      request(config,
        function(error, response) {
          if (error) {
            return reject(error);
          }
          resolve(response);
        });
    });
  };

  var getStreetImage = function(lat, lang, heading, imgName) {
    var imgPromise = q.defer();
    var reqConfig = {
      method: 'GET',
      uri: "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" + lat + "," + lang + "&fov=120&heading=" + heading + "&pitch=0&key=" + config.streetMapKey
    };
    download(reqConfig.uri, imgName + '.jpg', function() {
      console.log('yo')
      imgPromise.resolve('solved');
    });
    return imgPromise.promise;
  };

  var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

  var getCompleteImage = function(lat, lang) {
    var stitchedImagePromise = q.defer();
    Promise.all([getStreetImage(lat, lang, 0, 'pano1'),
      getStreetImage(lat, lang, 120, 'pano2'),
      getStreetImage(lat, lang, 240, 'pano3')
    ]).then(function(resolvedPromises) {
      imageStitcher.stitchImages().then(function(data){
        console.log(data);
        if(data === 'done'){
          console.log('i')
          stitchedImagePromise.resolve('Done');
        }
        else{
          stitchedImagePromise.resolve('f****');
        }
      });
    });
    return stitchedImagePromise.promise;
  }

  return {
    getCompleteImage: getCompleteImage
  }
}();

module.exports = streetmapImgSvc;