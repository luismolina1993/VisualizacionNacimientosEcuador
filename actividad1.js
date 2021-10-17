


/* Esta función realiza la inicialización del dashboard */
function inicializarDashboard(periodo){
    
    /* Se inicializan las variables para la primera gráfica: Nacimientos registrados por periodo */
    var svg = d3.select("#svgNacimientosRegistrados"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    /* Se coloca el título del gráfico */
    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text("Nacimientos en Ecuador por periodo 2010 - 2020")
        .attr("class", "title")
    
    
    /* Se establecen las escalas para las X (periodos) y las Y (nacimientos registrados) */
    var x = d3.scaleBand().range([0, width]).padding(0.4),
        y = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

   /* Se realiza la lectura del primer dataset que se encuentra en formato json */    
   d3.json ("https://raw.githubusercontent.com/luismolina1993/VisualizacionNacimientosEcuador/main/nacimientosRegistradosEcuador.json").then (function (data){ 
        
        /* Se establecen los dominios de los datos */
        x.domain(data.map(function(d) { return d.periodo; }));
        y.domain([0, d3.max(data, function(d) { return d.nacimientos; })]);
        
        /* Se agrega el eje X */
        g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(x))
         .append("text")
         .attr("y", height - 250)
         .attr("x", width - 100)
         .attr("text-anchor", "end")
         .attr("stroke", "black")
         .text("Periodo");
        
        /* Se agrega el eje Y */
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

        /* Se establecen ciertos parámetros a las barras que se visualizarán en el gráfico
        Además de tres eventos: 
        onMouseOver, cuando se pase el cursor del mouse por encima de la barra.
        onMouseOut, cuando el cursor del mouse salga de la barra.
        onClick, cuando se pulse click en una de las barras
        
        Además se configura animación al pintarse el gráfico a través del uso de transition, duration y delay
        */
        g.selectAll(".bar")
         .data(data)
         .enter().append("rect")
         .attr("class", "bar")
         .on("mouseover", onMouseOver) 
         .on("mouseout", onMouseOut)   
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
    
    
    /* Función definida para cuando se mueva el cursor por encima de una barra 
    Al dispararse este evento, le cambia el estilo a la barra cambiandole de color, adicional muestra la cantidad de nacimientos que representa cada barra.
    
    */
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

    /* Función definida para cuando se salga el cursor de una barra 
    Al dispararse este evento, vuelve al estado y estilo original de la barra.
    */
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
    
    /* En este evento onClick lo que se realiza es disparar las funciones que grafican las otras dos visualizaciones del dashboard de acuerdo al periodo donde se haya dado click en el primer gráfico */
    function onClick(d,i){
        dibujarGraficoPorSexo(d.periodo);
        dibujarGraficoPorProvincia(d.periodo)
    }

    
    /* Como parte de la inicialización del dashboard se dibujan por defecto:
    Los nacimientos por sexo en Ecuador del 2020.
    Los nacimientos por provincia en Ecuador del 2020
    */
    
    dibujarGraficoPorSexo(periodo);
    dibujarGraficoPorProvincia(periodo);
}


/* Función que realiza el dibujado del gráfico de Pie para mostrar los nacimientos en Ecuador por sexo en un año determinado  */
function dibujarGraficoPorSexo(periodo){
    
    /* Previo a dibujar cualquier gráfica dentro del SVG, se remueve cualquier elemento que se encuentren actualmente con el objetivo de que las gráficas no queden sobre puestas una encima de otra */
    d3.select("#svgNacimientosPorSexo").selectAll("*").remove();
    
    /* Se inicializan los parámetros del gráfico como el alto, ancho y el radio */
    var svgPie = d3.select("#svgNacimientosPorSexo"),
    margin = 200,
    width = svgPie.attr("width"),
    height = svgPie.attr("height"),
    radius = Math.min(width-margin, height-margin) / 2;


    var g = svgPie.append("g")
               .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    /* Se establece una escala ordinal para la gestión de los colores */
    var color = d3.scaleOrdinal(['steelblue','pink']);

    
    /* Se define el gráfico del pie y cuales son los valores que pintara (nacimientos)*/
    var pie = d3.pie().value(function(d) { 
            return d.nacidos; 
        });

    var path = d3.arc()
     .outerRadius(radius - 10)
     .innerRadius(0);

    var label = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius - 80);

    /* Se realiza la lectura del segundo dataset en formato json */
    d3.json ("https://raw.githubusercontent.com/luismolina1993/VisualizacionNacimientosEcuador/main/nacimientosRegistradosEcuadorPorSexo.json").then (function (dataPie){ 
        
        /* Posterior a obtener el dataset se usa la opción filter para realizar un filtrado del periodo que haya seleccionado el usuario al dar click en la barra */
        dataPie=dataPie.filter(function (entry) {
        return entry.periodo === periodo;
        });

        
        /* Se envian los datos ya filtrados al gráfico de PIE */
        var arc = g.selectAll(".arc")
                   .data(pie(dataPie))
                   .enter().append("g")
                   .attr("class", "arc");

        /* se establece el color y el path del gráfico */
        arc.append("path")
           .attr("d", path)
           .attr("fill", function(d) { return color(d.data.sexo); });

        /* Se configuran las leyendas que se visualizarán en cada slice del gráfico */
        arc.append("text")
           .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
            })
          
           .text(function(d) { return d.data.sexo+": "+  d.data.nacidos; });
           
        });

        /* Se coloca un título personalizado en el gráfico de acuerdo al periodo seleccionado */
        svgPie.append("g")
           .attr("transform", "translate(" + (width / 2 - 200) + "," + 20 + ")")
           .append("text")
           .attr("x", 0)
           .attr("y", 30)
           .attr("font-size", "24px")
           .text("Nacimientos registrados por sexo "+ periodo)
           .attr("class", "title")
}


/* Función que realiza el dibujado del gráfico de Barras ordenados de mayor a menor para mostrar los nacimientos en Ecuador por provincia en un año determinado  */
function dibujarGraficoPorProvincia(periodo){
    /* Previo a dibujar cualquier gráfica dentro del SVG, se remueve cualquier elemento que se encuentren actualmente con el objetivo de que las gráficas no queden sobre puestas una encima de otra */
    d3.select("#svgNacimientosPorProvincia").selectAll("*").remove();
    
    
    /* Se inicializan los parámetros del gráfico como el alto, ancho */
     
    var svg = d3.select("#svgNacimientosPorProvincia"),
        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    
    /* Se coloca un título personalizado en el gráfico de acuerdo al periodo seleccionado */
    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 50)
       .attr("y", 50)
       .attr("font-size", "24px")
       .text("Nacimientos registrados por provincia en "+periodo)
        .attr("class", "title")
    
     /* Se establecen las escalas para las X (provincias) y las Y (nacimientos registrados) */
    var x = d3.scaleBand().range([0, width]).padding(0.4),
        y = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

   /* Se realiza la lectura del tercer dataset que se encuentra en formato json */  
   d3.json ("https://raw.githubusercontent.com/luismolina1993/VisualizacionNacimientosEcuador/main/nacimientosRegistradosEcuadorPorProvincia.json").then (function (dataChart){ 
        
       
       /* Posterior a obtener el dataset se usa la opción filter para realizar un filtrado del periodo que haya seleccionado el usuario al dar click en la barra */
       dataChart=dataChart.filter(function (entry) {
            return entry.periodo === periodo;
        });
       
       /* También se ordena de mayor a menor los datos usando el método sort */
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
       
         /* Se establecen los dominios de los datos */
        x.domain(dataChart.map(function(d) { return d.provincia; }));
        y.domain([0, d3.max(dataChart, function(d) { return d.nacidos; })]);

       /* Se agrega el eje X */
       var ejeXProvincia= g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(x));
        
       /* Se formatea para que las etiquetas del eje X se visualicen de forma vertical */
        ejeXProvincia.selectAll("text")
            .attr("y", 0)
            .attr("x", 15)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
       
        
       /* Se agrega el eje Y */
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

        /* Se define una escala de color */
        var escalaColorP = d3.scaleLinear()
        .domain(d3.extent(dataChart, d => d.nacidos)) 
        .range(["lightblue", "steelblue"]);
       
       
       
        /* Se establecen ciertos parámetros a las barras que se visualizarán en el gráfico
        Además de tres eventos: 
        onMouseOver, cuando se pase el cursor del mouse por encima de la barra.
        onMouseOut, cuando el cursor del mouse salga de la barra.
        Además se configura animación al pintarse el gráfico a través del uso de transition, duration y delay
        
        Se pinta cada barra de acuerdo a la escala de color utilizada.
        
        */
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
    
     /* Función definida para cuando se mueva el cursor por encima de una barra 
    Al dispararse este evento, le cambia el estilo a la barra cambiandole de color, adicional muestra la cantidad de nacimientos que representa cada barra.
    
    */
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

    /* Función definida para cuando se salga el cursor de una barra 
    Al dispararse este evento, vuelve al estado y estilo original de la barra.
    */
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

