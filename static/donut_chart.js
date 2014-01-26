// EVENT DISPATCHER

var dispatch = d3.dispatch("generate", "highlight");

// DONUT CHART

var presidents = {
  "01": "George Washington", 
  "03": "Thomas Jefferson", 
  "40": "Ronald Reagan", 
  "41": "George Bush", 
  "42": "William J. Clinton", 
  "43": "George W. Bush", 
  "44": "Barack Obama", 
  "16": "Abraham Lincoln", 
  "26": "Theodore Roosevelt"
};

var testvar;

    var parseIdWeightString = function(idWeightString){
        var parsedIdWeights = [];
        _.each( _.range(0, idWeightString.length, 3), function(e,i,ls){ 
                                                        parsedIdWeights.push({
                                                            'id': idWeightString.substring(e,e+2),
                                                            'weight': idWeightString.substring(e+2,e+3)
                                                        });});
        parsedIdWeights.forEach(function(d) {
                  d.id = d.id;
                  d.weight = +d.weight;
                  d.name = presidents[d.id];
                });
        return parsedIdWeights;
    };


    var testIWS = '412433441264164423012403031';
   
    var chartDiv = d3.select('#sotu-chart');
 
    var width = parseInt(chartDiv.style("width")),
        height = parseInt(chartDiv.style("height")),
        radius = Math.min(width, height) / 2,
        pieInnerRadius = radius - 30,
        pieOuterRadius = radius - 10,
        pictureRadius = radius - 40;
                        
    var color_classes = [];
    _.each( _.keys(presidents), 
           function(e, i, ls) { 
             color_classes.push('q' + i + '-' + _.keys(presidents).length); 
                });

    var color = d3.scale.ordinal()
            .range(color_classes)
            .domain(_.keys(presidents));

    var arc = d3.svg.arc()
            .outerRadius(pieInnerRadius)
                .innerRadius(pieOuterRadius);

    var pie = d3.layout.pie()
            .sort(function(a,b){ return d3.ascending(a.id, b.id);})
                .value(function(d) { return d.weight; });

    var svg = d3.select("#sotu-chart").append("svg")
                .attr("width", width)
                .attr("height", height);

    var defs = svg.append("defs");
                
    var clipPath = svg.append("clipPath")
           .attr("id", "clipCircle")
           .append("circle")
           .attr("r", pictureRadius)
           .attr("cx", 60)
           .attr("cy", 60);

    var prezPicture = svg.append("g") 
                .attr("transform", "translate(" + ((width / 2) - pictureRadius) + "," + ((height / 2) - pictureRadius) + ")")
                .append("image")
                .attr("width", function(){ return pictureRadius * 2;})
                .attr("height", function(){ return pictureRadius * 2;})
                .attr("clip-path", "url(#clipCircle)");
    
    var updatePicture = function(id) { prezPicture.attr("xlink:href", "static/"+id+".jpg"); };

    function key(d) {
      return d.data.id;
    }

    function type(d) {
      d.weight = +d.weight;
      return d;
    }

    function findNeighborArc(i, data0, data1, key) {
      var d;
      return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
          : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
          : null;
    }

    // Find the element in data0 that joins the highest preceding element in data1.
    function findPreceding(i, data0, data1, key) {
      var m = data0.length;
      while (--i >= 0) {
        var k = key(data1[i]);
        for (var j = 0; j < m; ++j) {
          if (key(data0[j]) === k) return data0[j];
        }
      }
    }

    // Find the element in data0 that joins the lowest following element in data1.
    function findFollowing(i, data0, data1, key) {
      var n = data1.length, m = data0.length;
      while (++i < n) {
        var k = key(data1[i]);
        for (var j = 0; j < m; ++j) {
          if (key(data0[j]) === k) return data0[j];
        }
      }
    }

    function arcTween(d) {
      var i = d3.interpolate(this._current, d);
      this._current = i(0);
      return function(t) { return arc(i(t)); };
    }

    var donutChart = svg.append("g")
                .classed("prezColors", true)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
   
    var path = donutChart.selectAll("path"); 


    dispatch.on("generate", function (id_weight_string) {
        
        var new_data = parseIdWeightString(id_weight_string);

        console.log(new_data);

        testvar = new_data;
         
        var firstPrez = _.max(new_data, function(d){ return d.weight; });

        updatePicture(firstPrez.id);        
        
        var data0 = path.data(),
            data1 = pie(new_data);

        path = path.data(data1, key);

        path.enter().append("path")
            .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
            .attr("class", function(d){ return color(d.data.id);})
          .append("title")
            .text(function(d) { return d.data.id; });

        path.exit()
            .datum(function(d, i) { return findNeighborArc(i, data1, data0, key) || d; })
          .transition()
            .duration(750)
            .attrTween("d", arcTween)
            .remove();

        path.transition()
            .duration(750)
            .attrTween("d", arcTween);
      });

        
        

$(function (){
    dispatch.generate(testIWS);
});
