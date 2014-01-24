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

    var testIWS = '410433441264164423012400031';
    
    var width = 200,
        height = 200,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
            .range(["#BD2D28", "#42A5B3", "#5C8100", "#E2BA22", "#8E6C8A", "#E58429", "#0F8C79", "#D15A86", "#6B99A1", "#6BBBA1"])
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
                .attr("class", "arc");

        arcs.append("path")
              .attr("d", arc)
              .style("fill", function(d) { return color(d.data.id); });

        /*
        arcs.append("text")
              .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .style("text-anchor", "middle")
              .text(function(d) { return d.data.age; });
        */
    };

    drawChart(testIWS);
