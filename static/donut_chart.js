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
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
            .range(_.range(_.keys(presidents).length))
            .domain(_.keys(presidents));

    var arc = d3.svg.arc()
            .outerRadius(radius - 10)
                .innerRadius(radius - 30);

    var pie = d3.layout.pie()
            .sort(function(a, b) { return b.weight - a.weight; })
                .value(function(d) { return d.weight; });

    var svg = d3.select("#sotu-chart").append("svg")
                .attr("width", width)
                .attr("height", height);

    var donutChart = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    

    var drawChart = function (idWeightString) {

        data = parseIdWeightString(idWeightString);

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
              .attr("class", function(d,i) { return "q"+color(d.data.id)+"-10";});

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
});
