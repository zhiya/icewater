var config = require('../config');

var fs = require('fs');

function isValidLogFile(filename){
  try{
    var fd = fs.openSync(filename,'r');
    fs.close(fd);
    return true;
  }catch(error){
    return false;
  }
};

function parseLogFile(filename,callback){
  if(typeof callback != 'function'){
    callback = function(){};
  }
  if(!isValidLogFile(filename)){
    return callback('Invalid log file: '+filename);
  }
  fs.readFile(filename,function(error,data){
    if(error) return callback(error);

    var lines = data.toString().split('\n');
    var titles = lines.shift().split(' ');
    var data = [];
    titles.forEach(function(title){
      if(title && title.length>0){
        data.push({
          title: title,
          elements: []
        });
      }
    });
    lines.forEach(function(line){
      if(line && line.length>0){
        var segs = line.split(' ');
        if(segs.length === titles.length){
          for(var i=0;i<segs.length;++i){
            data[i].elements.push(segs[i]);
          }
        }
      }
    });
    callback(null,data);
  });
};

exports.list = function(callback){
  if(typeof callback != 'function'){
    callback = function(){};
  }
  fs.readdir(config.log.path,function(error,files){
    if(error) return callback(error);

    var filenames = [];
    files.forEach(function(file){
      try {
        var stats = fs.statSync(config.log.path+file);
        if(stats && stats.isDirectory()){
          filenames.push(file);
        }
      }catch(error){
        console.log(error);
      }
    });
    callback(null,filenames);
  });
};

exports.view = function(log,callback){
  if(typeof callback != 'function'){
    callback = function(){};
  }
  fs.stat(config.log.path+log,function(error,stats){
    if(error) return callback(error);
    if(stats.isDirectory()){
      var _total = config.log.records.length;
      var _finished = 0;
      var td = [];
      config.log.records.forEach(function(logfile){
        parseLogFile(config.log.path+log+'/'+logfile,
          function(error,data){
          _finished++;
          if(error)console.log(error);
          if(typeof data != 'undefined' && data){
            td.push(data);
          }
          if(_finished >= _total){
            fs.readFile(config.log.path+log+'/'+config.log.readme,function(error,data){
              var readme = null;
              if(!error){
                readme = data.toString();
              }
              callback(null,{ records: td, readme: readme });
            });
          }
        });
      });
    }else{
      callback('Invalid log directory!');
    }
  });
};
