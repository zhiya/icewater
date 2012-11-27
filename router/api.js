var R = require('../R'),
    exec = require('child_process').exec,
    fs = require('fs');

exports.apply = function(app){
  function start_monitor(interval){
    if(app.monitors.length !== 0){
      return false;
    }
    app.mon_interval = interval;

    var logpath = R.config.log.path+'log/';
    try{
      fs.closeSync(fs.openSync(logpath));
    }catch(error){
      fs.mkdirSync(logpath);
    }

    var sarp = app.run('sar',['-P','ALL',interval]);
    sarp.stdout.pipe(fs.createWriteStream(logpath+'cores.log'));
    app.monitors.push(sarp);
    console.log('sar -P ALL %s > %scores.log',interval,logpath);

    var sarn = app.run('sar',['-n','DEV',interval]);
    sarn.stdout.pipe(fs.createWriteStream(logpath+'tcp.log'));
    app.monitors.push(sarn);
    console.log('sar -n DEV %s > %stcp.log',interval,logpath);

    var sarr = app.run('sar',['-r',interval]);
    sarr.stdout.pipe(fs.createWriteStream(logpath+'mem.log'));
    app.monitors.push(sarr);
    console.log('sar -r %s > %smem.log',interval,logpath);

    var saru = app.run('sar',['-u',interval]);
    saru.stdout.pipe(fs.createWriteStream(logpath+'cpu.log'));
    app.monitors.push(saru);
    console.log('sar -u %s > %scpu.log',interval,logpath);

    var sockmon = app.run_script('socket-mon.sh',[interval]);
    sockmon.stdout.pipe(fs.createWriteStream(logpath+'socket.log'));
    app.monitors.push(sockmon);
    console.log('socket-mon.sh %s > %ssocket.log.log',interval,logpath);
    return true;
  };

  function stop_monitor(){
    if(app.monitors.length===0){
      return ;
    }
    for(var i=0;i<app.monitors.length;++i){
      var p = app.monitors[i];
      if(p){
        p.kill();
      }
    }
    app.monitors = [];
    var d = new Date();
    var destlogfile =
      R.config.log.path+'log.'+
      d.getFullYear()+
      '-'+(d.getMonth()+1)+
      '-'+d.getDate()+
      '_'+(d.toLocaleTimeString().replace(/:/g,'-'));
    console.log('storing logs: %s',destlogfile);
    fs.renameSync(R.config.log.path+'log',destlogfile);

    app.run_script('prepare-log.sh',[destlogfile],function(error,stdout,stderr){
      if(error){
        console.error(error);
      }else if(stderr){
        console.error(stderr);
      }else{
        console.log(stdout);
      }
    });
  };

  app.server.get('/api/monitor/start',function(req,res){
    res.setHeader('content-type','application/json');
    var interval = 0;
    try{
      var intstr = req.param('interval');
      if(!intstr){
        return res.end(JSON.stringify({error:'invaild parameters!'}));
      }
      interval = parseInt(intstr);
    }catch(error){
      res.end(JSON.stringify({error:error}));
    }
    var ret = start_monitor(interval);
    res.end(JSON.stringify({error:ret?null:'start monitor failed!'}));
  });

  app.server.get('/api/monitor/status',function(req,res){
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({
      error: null,
      data: {
        started: app.monitors.length!==0,
        interval: app.mon_interval,
      }
    }));
  });

  app.server.get('/api/monitor/stop',function(req,res){
    res.setHeader('content-type','application/json');
    stop_monitor();
    res.end(JSON.stringify({error:null}));
  });
}

