// DONUT CHART

    var parseIdWeightString = function(idWeightString){
        var parsedIdWeights = [];
        _.each( _.range(0, idWeightString.length, 3), function(e,i,ls){ 
                                                        parsedIdWeights.push({
                                                            'id': a.substring(e,e+2),
                                                            'weight': a.substring(e+2,e+3)
                                                        });});
        return parsedIdWeights;
    };
    
    var width = 200,
        height = 200,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
            .range(["#BD2D28", "#42A5B3", "#5C8100", "#E2BA22", "#8E6C8A", "#E58429", "#0F8C79", "#D15A86", "#6B99A1", "#6BBBA1"]);


    var arc = d3.svg.arc()
            .outerRadius(radius - 10)
                .innerRadius(radius - 70);

    var pie = d3.layout.pie()
            .sort(null)
                .value(function(d) { return d.population; });

    var svg = d3.select("body").append("svg")
            .attr("width", width)
                .attr("height", height)
                  .append("g")
                      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var drawChart = function (id_weight_string) {

        

          data.forEach(function(d) {
                  d.population = +d.population;
                    });

            var g = svg.selectAll(".arc")
              .data(pie(data))
            .enter().append("g")
              .attr("class", "arc");

      g.append("path")
              .attr("d", arc)
              .style("fill", function(d) { return color(d.data.age); });

      g.append("text")
              .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .style("text-anchor", "middle")
              .text(function(d) { return d.data.age; });
    };

