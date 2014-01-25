// DONUT CHART

    var parseIdWeightString = function(idWeightString){
        var parsedIdWeights = [];
        _.each( _.range(0, idWeightString.length, 3), function(e,i,ls){ 
                                                        parsedIdWeights.push({
                                                            'id': idWeightString.substring(e,e+2),
                                                            'weight': idWeightString.substring(e+2,e+3)
                                                        });});
        return parsedIdWeights;
    };

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
            .sort(function(a, b) { return b.weight - a.weight; })
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
//"url(#pattern-"+id+")"
    var donutChart = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    

    var drawChart = function (idWeightString) {
        data = parseIdWeightString(idWeightString);
        
        var picturePatterns = defs.selectAll("pattern")
                 .data(data)
                 .enter()
                 .append("pattern")
                 .attr("id", function(d){ return "pattern-"+d.id; })
                 .attr("patternunits", "userSpaceOnUse")
                 .attr("x",0)
                 .attr("y",0)
                 .attr("width", pictureRadius * 2)
                 .attr("height", pictureRadius * 2)
                 .append("image")
                 .attr("x",0)
                 .attr("y",0)
                 .attr("width", pictureRadius * 2)
                 .attr("height", pictureRadius * 2)
                 .attr("xlink:href",function(d){ return "static/"+d.id+".jpg"; });


        firstPrez = d3.max(data, function(d){ d.weight; });

        console.log(data);

        data.forEach(function(d) {
                  d.id = d.id;
                  d.weight = +d.weight;
                  d.name = presidents[d.id];
                });

        var arcs = donutChart.selectAll(".arc")
                .data(pie(data))
                .enter().append("g")
                .classed("arc", true)
                .classed("prezColors", true);

        arcs.append("path")
              .attr("d", arc)
              //.style("fill", "#F45832");
              .attr("class", function(d,i) { return color(d.data.id);});

        /*
        arcs.append("text")
              .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .style("text-anchor", "middle")
              .text(function(d) { return d.data.age; });
        */
    };

        
        

$(function (){
    drawChart(testIWS);
    updatePicture("44");
});
