function RaphChart(elemid,data){
  this.id = elemid;
  this.r = Raphael(this.id);
  this.data = data;

  this.title = this.data.shift();
  this.title_x = 30;
  this.title_y = 50;
  this.title_ys = 10;

  this.chart_x0 = 80;
  this.chart_y0 = 25;
  this.chart_width = 800;
  this.chart_height = 250;

  this.linewidth = 1.5;

  this.ks = [];
  for(var i=0;i<this.title.elements.length;++i){
    this.ks.push(i);
  }

  this.vs = [];

  var self = this;
  this.data.forEach(function(d){
    var na = [];
    d.elements.forEach(function(e){
      na.push(Number(e));
    });
    self.vs.push(na);
  });
};
RaphChart.prototype.generate = function(){
  this.linechart = this.r.linechart(
    this.chart_x0,
    this.chart_y0,
    this.chart_width,
    this.chart_height,
    this.ks,this.vs,{
      nostroke: false,
      axis: "0 0 1 1",
      smooth: true
  });
  var items = this.linechart.axis[0].text.items;
  var lx = 0;
  for(var i=0;i<items.length;++i){
    var value = '';
    var item = items[i];
    var idx = item.attr().text;
    var ix = item.attr().x;
    if(ix-lx >= 50){
      value = this.title.elements[idx];
      lx = ix;
    }
    items[i].attr({
      text: value
    });
  }
  var lines = this.linechart.lines;
  for(var i=0;i<lines.length;++i){
    lines[i].attr({
      'stroke-width': this.linewidth
    });
    var clr = lines[i].attr('stroke');
    this.r.text(this.title_x,this.title_y,this.data[i].title).attr({
      fill: clr
    });
    this.title_y += this.title_ys;
  }
};


