var express = require('express'),
    router = require('./router'),
    fs = require('fs'),
    execFile = require('child_process').execFile,
    spawn = require('child_process').spawn;

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname+'/view');
  app.set('view engine', 'jade');
  app.set('view options', {layout:false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(__dirname+'/public'));
});

app.configure('development',function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production',function(){
  app.use(express.errorHandler());
});

var appserver = {
  server: app,
  monitors: [],
  mon_interval: 30,
  run_script: function(script,args,options,callback){
    var fname = __dirname+'/script/'+script;
    return execFile(fname,args,options,callback);
  },
  run: function(cmd,args,options){
    return spawn(cmd,args,options);
  }
};

router.apply(appserver);

app.listen(8787);
console.log('icewater listening on port %d in %s mode',
  app.address().port, app.settings.env);

