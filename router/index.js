var R = require('../R');

exports.apply = function(app){

  app.get('/',function(req,res){
    res.render('index',{title: 'icewater'});
  });

  app.get('/log',function(req,res){
    R.struct.log.list(function(error,files){
      if(error){
        res.end(error);
      }else{
        res.render('log-list', {
          title: 'icewater-loglist',
          fileliststr: JSON.stringify(files)
        });
      }
    });
  });

  app.get('/log/:filename',function(req,res){
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

