var R = require('../R');

exports.apply = function(app){
  app.server.get('/log',function(req,res){
    R.struct.log.list(function(error,files){
      if(error){
        res.end(error);
      }else{
        res.render('log-list', {
          title: 'icewater-loglist',
          started: app.monitors.length!==0,
          interval: app.mon_interval,
          fileliststr: JSON.stringify(files)
        });
      }
    });
  });

  app.server.get('/log/:filename',function(req,res){
    var filename = req.param('filename');
    R.struct.log.view(filename, function(error,data){
      if(error){
        console.log(error);
        res.end(error);
      }else{
        var datastr = JSON.stringify(data);
        res.render('log-view', {
          title: 'icewater-logview',
          datastr: datastr
        });
      }
    });
  });
};

