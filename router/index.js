var log = require('./log'),
    api = require('./api');

exports.apply = function(app){
  log.apply(app);
  api.apply(app);

  app.server.get('/',function(req,res){
    res.render('index',{ title: 'icewater' });
  });
}

