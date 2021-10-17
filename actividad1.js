
function inicializarDashboard(periodo){
    var svg = d3.select("#svgNacimientosRegistrados"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text("Nacimientos en Ecuador por periodo 2010 - 2020")
        .attr("class", "title")
       
    var x = d3.scaleBand().range([0, width]).padding(0.4),
        y = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

   d3.json ("https://raw.githubusercontent.com/luismolina1993/VisualizacionNacimientosEcuador/main/nacimientosRegistradosEcuador.json").then (function (data){ 
        /*if (error) {
            throw error;
        }*/
        //console.log(error);
        x.domain(data.map(function(d) { return d.periodo; }));
        y.domain([0, d3.max(data, function(d) { return d.nacimientos; })]);

        g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(x))
         .append("text")
         .attr("y", height - 250)
         .attr("x", width - 100)
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text("Periodo");

        g.append("g")
         .call(d3.axisLeft(y).tickFormat(function(d){
             return d;
         }).ticks(10))
         .append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 1)
         .attr("dy", "-5.1em")
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text("Nacimientos Registrados");

        g.selectAll(".bar")
         .data(data)
         .enter().append("rect")
         .attr("class", "bar")
         .on("mouseover", onMouseOver) //Add listener for the mouseover event
         .on("mouseout", onMouseOut)   //Add listener for the mouseout event
         .on("click", onClick)
         .attr("x", function(d) { return x(d.periodo); })
         .attr("y", function(d) { return y(d.nacimientos); })
         .attr("width", x.bandwidth())
         .transition()
         .ease(d3.easeLinear)
         .duration(400)
         .delay(function (d, i) {
             return i * 50;
         })
         .attr("height", function(d) { return height - y(d.nacimientos); });
    });
    
    
    //mouseover event handler function
    function onMouseOver(d, i) {
        d3.select(this).attr('class', 'highlight');
        d3.select(this)
          .transition()     // adds animation
          .duration(400)
          .attr('width', x.bandwidth() + 5)
          .attr("y", function(d) { return y(d.nacimientos) - 10; })
          .attr("height", function(d) { return height - y(d.nacimientos) + 10; });

        g.append("text")
         .attr('class', 'val') 
         .attr('x', function() {
             return x(d.periodo);
         })
         .attr('y', function() {
             return y(d.nacimientos) - 15;
         })
         .text(function() {
             return [ d.nacimientos];  // Value of the text
         });
    }

    //mouseout event handler function
    function onMouseOut(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'bar');
        d3.select(this)
          .transition()     // adds animation
          .duration(400)
          .attr('width', x.bandwidth())
          .attr("y", function(d) { return y(d.nacimientos); })
          .attr("height", function(d) { return height - y(d.nacimientos); });

        d3.selectAll('.val')
          .remove()
    }

    function onClick(d,i){
        dibujarGraficoPorSexo(d.periodo);
        dibujarGraficoPorProvincia(d.periodo)
    }

    
    dibujarGraficoPorSexo(2020);
    dibujarGraficoPorProvincia(2020);
}



function dibujarGraficoPorSexo(periodo){
    d3.select("#svgNacimientosPorSexo").selectAll("*").remove();
    var svgPie = d3.select("#svgNacimientosPorSexo"),
    margin = 200,
    width = svgPie.attr("width"),
    height = svgPie.attr("height"),
        radius = Math.min(width-margin, height-margin) / 2;


    var g = svgPie.append("g")
               .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal(['steelblue','pink']);

    var pie = d3.pie().value(function(d) { 
            return d.nacidos; 
        });

    var path = d3.arc()
                 .outerRadius(radius - 10)
                 .innerRadius(0);

    var label = d3.arc()
                  .outerRadius(radius)
                  .innerRadius(radius - 80);


    d3.json ("https://raw.githubusercontent.com/luismolina1993/VisualizacionNacimientosEcuador/main/nacimientosRegistradosEcuadorPorSexo.json").then (function (dataPie){ 

        dataPie=dataPie.filter(function (entry) {
        return entry.periodo === periodo;
        });

        var arc = g.selectAll(".arc")
                   .data(pie(dataPie))
                   .enter().append("g")
                   .attr("class", "arc");


        arc.append("path")
           .attr("d", path)
           .attr("fill", function(d) { return color(d.data.sexo); });


        arc.append("text")
           .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
            })
          
           .text(function(d) { return d.data.sexo+": "+  d.data.nacidos; });
           
        });

        svgPie.append("g")
           .attr("transform", "translate(" + (width / 2 - 200) + "," + 20 + ")")
           .append("text")
           .attr("x", 0)
           .attr("y", 30)
           .attr("font-size", "24px")
           .text("Nacimientos registrados por sexo "+ periodo)
           .attr("class", "title")
}

function dibujarGraficoPorProvincia(periodo){
    d3.select("#svgNacimientosPorProvincia").selectAll("*").remove();
    var svg = d3.select("#svgNacimientosPorProvincia"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text("Nacimientos registrados por provincia en "+periodo)
        .attr("class", "title")
       
    var x = d3.scaleBand().range([0, width]).padding(0.4),
        y = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

   d3.json ("https://raw.githubusercontent.com/luismolina1993/VisualizacionNacimientosEcuador/main/nacimientosRegistradosEcuadorPorProvincia.json").then (function (dataChart){ 
        dataChart=dataChart.filter(function (entry) {
            return entry.periodo === periodo;
        });
       
        console.log(dataChart);
       
        dataChart.sort(function (a, b) {
            if (a.nacidos > b.nacidos) {
                return -1;
              }
              if (a.nacidos < b.nacidos) {
                return 1;
              }
              // a must be equal to b
              return 0;
        });
       
        
        x.domain(dataChart.map(function(d) { return d.provincia; }));
        y.domain([0, d3.max(dataChart, function(d) { return d.nacidos; })]);

       var ejeXProvincia= g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(x));
        
        ejeXProvincia.selectAll("text")
            .attr("y", 0)
            .attr("x", 15)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
       
       /*ejeXProvincia.append("text")
         .attr("y", height - 250)
         .attr("x", width - 100)
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text("Provincias");*/

        g.append("g")
         .call(d3.axisLeft(y).tickFormat(function(d){
             return d;
         }).ticks(10))
         .append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 1)
         .attr("dy", "-5.1em")
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text("Nacimientos Registrados");

        
        var escalaColorP = d3.scaleLinear()
        .domain(d3.extent(dataChart, d => d.nacidos)) 
        .range(["lightblue", "steelblue"]);
       
        g.selectAll(".bar")
         .data(dataChart)
         .enter().append("rect")
         .attr("class", "barP")
         .on("mouseover", onMouseOverProvincia) 
         .on("mouseout", onMouseOutProvincia)   
         .attr("x", function(d) { return x(d.provincia); })
         .attr("y", function(d) { return y(d.nacidos); })
         .attr ("fill",function(d) { return escalaColorP(d.nacidos); })
         .attr("width", x.bandwidth())
         .transition()
         .ease(d3.easeLinear)
         .duration(400)
         .delay(function (d, i) {
             return i * 50;
         })
         .attr("height", function(d) { return height - y(d.nacidos); });
       
    });
    
    function onMouseOverProvincia(d, i) {
    d3.select(this).attr('class', 'highlight');
    d3.select(this)
      .transition()     // adds animation
      .duration(400)
      .attr('width', x.bandwidth() + 5)
      .attr("y", function(d) { return y(d.nacidos) - 10; })
      .attr("height", function(d) { return height - y(d.nacidos) + 10; });

    g.append("text")
     .attr('class', 'val') 
     .attr('x', function() {
         return x(d.provincia);
     })
     .attr('y', function() {
         return y(d.nacidos) - 15;
     })
     .text(function() {
         return [ d.nacidos];  // Value of the text
     });
}

    //mouseout event handler function
    function onMouseOutProvincia(d, i) {
        // use the text label class to remove label on mouseout
        d3.select(this).attr('class', 'barD');
        d3.select(this)
          .transition()     // adds animation
          .duration(400)
          .attr('width', x.bandwidth())
          .attr("y", function(d) { return y(d.nacidos); })
          .attr("height", function(d) { return height - y(d.nacidos); });

        d3.selectAll('.val')
          .remove()
    }
}


inicializarDashboard(2020);

