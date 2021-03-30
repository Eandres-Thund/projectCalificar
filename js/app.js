/****************************************/
/*************** Variables **************/
/****************************************/
let icono; //Se iguala con el icon del destructuring en mostrarClima(datos)
let imgsrc; //Se usa para almacenar la ubicacion de las imagenes en iconWeather()
let descripcion; //Se usa para describir el clima en iconWeather()

let nombDia; //Se usa para almacenar el dia traducido en la funcion translate()
let nombMes; //Se usa para almacenar el mes traducido en la funcion translate()

/****************************************/
/*************** Selectores *************/
/****************************************/
const formulario = document.querySelector('#formulario'); //Selecciona el fomulario completo.
const mainPage = document.querySelector('#clima'); //Selecciona el contenedor ppal de la pagina.
const viewResultado = document.querySelector('#resultado'); //Selecciona el espacio donde se mostrara el resultado de la obtencion del clima

/****************************************/
/**************** Evento ****************/
/****************************************/
window.addEventListener('load', () =>{ //Espera a que la pagina html este realmente cargada.
    formulario.addEventListener('submit', buscarClima); //Al enviar el formulario el contenido del formulario.
});

/****************************************/
/************** Funciones ***************/
/****************************************/

//Funcion para el evento de buscar el clima
function buscarClima(evt){
    evt.preventDefault(); //Evita elefecto burbuja y siempre llamar al usar los valores del contenido de un formulario.
    //console.log("Buscando clima.."); //Probamos si sale msj, al presionar el submmit del formulario.

    //Validar la info almacenada en los campos de "Escriba la ciudad" y "Seleccione pais"
    const ciudad = document.querySelector('#ciudad').value; //Selecciona y guarda los valores ingresados por el fomulario con id ciudad.
    const pais = document.querySelector('#pais').value; //Selecciona y guarda los valores ingresados por el fomulario con id pais.

    //console.log(ciudad); //Muestra los valores almacenados por el fomulario con id ciudad.
    //console.log(pais); //Muestra los valores almacenados por el fomulario con id pais.

    //Condicion de alerta cuando no ingresan ningun valor
    if(ciudad === '' || pais === ''){
        mostrarError("Ambos campos se deben diligenciar");
        return;
    };

    //Condicion de alerta cuando ingresan numeros en ciudad
    if(ciudad >= 0 || ciudad < 0){
        delete ciudad;
        mostrarError("Ingreso numeros en el campo de Ciudad");
        return;
    };

    //Se llama la funcion que accede a la API de OpenWeather
    consultarAPIClima(ciudad,pais);

    //Se llama la funcion que accede a la API de IPGeolocation
    consultarIpGeolocation(ciudad,pais);

};

//Funcion para mostrar el mensaje de alerta
function mostrarError(msj){
    //console.log(msj); //Se uso para mostrar que al no ingresar ninguna informacion mostraba msj en clg.

    //Se crea un selector,el cual va a contener una cualquier clase que se haya añadido a la alerta.
    const bandNoShowAgainAlert = document.querySelector('.alerta');

    if(!bandNoShowAgainAlert){ //Gracias a este condicional solo se envia una vez el mensaje de alerta

        //Crear alerta con scripting para que aparezca en el html.
        const alerta = document.createElement('div');

        alerta.classList.add('alerta', 'alerta-danger', 'max-w-md', 'mx-auto', 'text-center');
                                //Se añaden clases del mainEstilos.css y tailwind.css
        
        alerta.innerHTML = `
            <strong class= "font-bold"> Error!! </strong>
            <span class= "block"> ${msj} </span>
        `; //Creamos codigo html

        mainPage.appendChild(alerta); //Añadimos como hijo el div al container ppal para visualizar en el html.

        //Eliminar el msj, es decir la alerta, despues de cierto tiempo.
        setTimeout(()=>{
            alerta.remove(); //Eliminamos todas las clases que se añadieron en alerta.
        },5000); //A los 5 segundos.

    };
    
};  

//Esta funcion verifica si los datos concuerdan con el ingresado y seleccionado por el usuario
function consultarAPIClima(ciudad,pais){

    const appID= '034cfc616cddb484c19e94de0e5e731f'; //KeyAPI de openweathermap
    const urlOpenWeather = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad},${pais}&appid=${appID}`;

    //console.log(urlOpenWeather); //Muestra la url que accede al json, que contiene la informacion.

    spinner();

    fetch(urlOpenWeather)
    .then(respuestaWeather => respuestaWeather.json())
    .then(datosWeather => {
        //console.log(datosWeather); se uso para mostrar el error que enviaba al no encontrar la ciudad.

        limpiarHTML(); //Se llama a la funcion limpiarHTML

        if(datosWeather.cod  === "404"){
            mostrarError("Ciudad no encontrada");
            return;
        };

        //Llamamos la funcion mostrar clima
        mostrarClima(datosWeather); 
        
    });
};

//Esta funcion verifica si hay conexion y los datos del API IPGeolocation fueron entregados correctamente
function consultarIpGeolocation (ciudad,pais){
    const appGeoID= '025d2e92e55040dab74487eeecad9005' //KeyAPI de IPGeolocation
    const urlIpGeo= `https://api.ipgeolocation.io/timezone?apiKey=${appGeoID}&location=${ciudad},%20${pais}`;

    //console.log(urlIpGeo); //Muestra la url que accede al json, que contiene la informacion.

    fetch(urlIpGeo)
    .then(respuestaGeo => respuestaGeo.json())
    .then(datosGeo => {

        if(datosGeo.cod === "404"){
            mostrarError("Ciudad no encontrada");
            return;
        };

        //Llamamos la funcion mostrar los datos de la API IPGeolocation
        mostrarIpGeo(datosGeo);
    });

}

//Esta funcion hace destructuring al json que recibe y muestra en el html
function mostrarClima(datos){
                //Realizar un destructuring de 2do nivel     //Realizar un destructuring con arreglos
    const {name, main: {temp, feels_like,temp_min,temp_max}, weather:{0:{icon}}, dt} = datos;
    
    const celsius = kelvinCelsius(temp); // Llamamos a la funcion kelvinCelsius
    const feels = kelvinCelsius(feels_like);
    const tMin = kelvinCelsius(temp_min);
    const tMax = kelvinCelsius(temp_max);
    icono = icon;
    
    //console.log(celsius); //Mostramos en clg la conversion de temperatura de los datos.
    //console.log(feels);
    //console.log(tMin);
    //console.log(tMax);

    iconWeather(); // Se llama la funcion iconWeather

    //Se usa scripting para incluir todos los datos del destructuring
    //Para el name
    const nombreCiudad = document.createElement('div'); //Crea la etiqueta div hijo
    nombreCiudad.innerHTML= `El clima en ${name} es: ` //Guarda lo que se muestra en el html
    nombreCiudad.classList.add('text-4xl', 'mt-5', 'font-bold'); //Anexa clases de tailwind

    //Para temp
    const temperatura = document.createElement('div');
    temperatura.innerHTML= `${celsius} &#8451 `;  // &#8451 =>>> es °C
    temperatura.classList.add('text-6xl', 'font-bold');

    //Para tMin y tMax
    const minMax= document.createElement('div');
    minMax.innerHTML = `min/Max  ${tMin} &#8451 / ${tMax} &#8451 `;  // &#8451 =>>> es °C
    minMax.classList.add('font-bold');

    //Para feels_like
    const sensacion= document.createElement('div');
    sensacion.innerHTML = `Sensacion termica: ${feels} &#8451 `;  // &#8451 =>>> es °C
    sensacion.classList.add('font-bold');

    //Para el icono
    const divImagen = document.createElement('div'); //Creamos el div de la imagen.
    const imagenElemento = document.createElement('img'); //Creamos el elemento img.
    imagenElemento.src = imgsrc; //Segun la imagen se accede a la ubicacin respectiva.

    divImagen.id= "icono";
    divImagen.appendChild(imagenElemento); //Se agrega el elemento img al div.

    //Para la descripcion del clima
    const descripcionClima = document.createElement('div');
    descripcionClima.innerHTML = `Descripcion: ${descripcion}`;
    descripcionClima.classList.add('font-bold', '2xl','mt-6');

       
    //Se crea un div para agrupar los primeros 4 datos
    const divPrimeraCol = document.createElement('div');
    divPrimeraCol.id = "PrimeraColumna"; //Colocar un id en el div
    divPrimeraCol.appendChild(nombreCiudad);  //Agregamos el div hijo al div padre
    divPrimeraCol.appendChild(temperatura);
    divPrimeraCol.appendChild(minMax);
    divPrimeraCol.appendChild(sensacion);

    //se crea un div para agrupar la imagen y la descripcion
    const divSegundaCol = document.createElement('div');
    divSegundaCol.id = "SegundaColumna";
    divSegundaCol.appendChild(divImagen);
    divSegundaCol.appendChild(descripcionClima);
    divImagen.classList.add('mt-6');

    //Se crea el div padre, que a su vez es el div hijo de viewResultado
    const resultadoDiv = document.createElement('div'); //Se crea un segundo div padre para el div hijo
    resultadoDiv.classList.add('text-white', 'text-center', 'fila'); //Anexa clases de tailwind y una del mainEstilos

    //resultadoDiv.appendChild(nombreCiudad);  //Agregamos el div hijo al div padre
    //resultadoDiv.appendChild(temperatura);
    //resultadoDiv.appendChild(minMax);
    //resultadoDiv.appendChild(sensacion);
    //resultadoDiv.appendChild(divImagen);
    //resultadoDiv.appendChild(descripcionClima);

    resultadoDiv.appendChild(divPrimeraCol);
    resultadoDiv.appendChild(divSegundaCol);

    //Se agrega al div padre con id resultado
    viewResultado.appendChild(resultadoDiv); //Mostramos lo almacenado en el div padre

};

//Esta funcion hace destructuring al json que recibe de la APIGeolocation y muestra en el html
function mostrarIpGeo(dato){
    const{date_time_txt} = dato;

    const FechTiempObtenida = date_time_txt; //Recibe todo el string que se almacena en el json del primer nivel
    const arrayFullData = FechTiempObtenida.split(","); //Separa por el elemento "," y almacena en un arreglo los strings 
    const arrayMontDate = arrayFullData[1].split(" "); //Separa por el elemento " " la segunda posicion del arreglo arrayFullData
    const arrayYearTime= arrayFullData[2].split(" "); //Separa por el elemento " " la ultima posicion del arreglo arrayFullData

    //console.log(arrayFullData); //Muestra -> ["Monday"," March 29"," 2021 14:19:49"]
    //console.log(arrayMontDate); //Muestra -> ["", "March", "29"]
    //console.log(arrayYearTime); //Muestra -> ["", "2021", "14:19:49"]

    translate(arrayFullData[0]); //Se envia el nombre del dia a traduccion
    translate(arrayMontDate[1]); //Se envia el nombre del mes a traduccion

    const parrElementUno = document.createElement('p'); //Se crea un elemento parrafo que va a contener el mensaje de -> Hora local: 55:55:55
    parrElementUno.innerHTML= `Hora local: ${arrayYearTime[2]}`;

    const parrElementDos = document.createElement('p'); //Se crea un elemento parrafo que va a contener el mensaje de -> Fecha local: nombDia, numDia de numbMes del año
    parrElementDos.innerHTML= `Fecha local: ${nombDia}, ${arrayMontDate[2]} de ${nombMes} del ${arrayYearTime[1]}`;

    const horaLocal = document.createElement('div'); //Se crea el div que contiene los parrafos de hora y fecha. Este div va a ser otro hijo del div con id resultado
    horaLocal.appendChild(parrElementUno); //Se agregan hijos al div 
    horaLocal.appendChild(parrElementDos);
    horaLocal.classList.add('mx-8', 'mt-8', 'p-1', 'text-center', 'text-white', 'text-base');
    
    viewResultado.appendChild(horaLocal); //Mostramos lo almacenado en el div padre


};


//Funcion que convierte la temperatura absoluta a celsius
function kelvinCelsius(temperatura){//Convierte Kelvin a Celsius
    return parseInt(temperatura - 273.15); //parseInt, devuelve un entero
};


//Funcion para sobreescribir y no crear nuevos div debajo, al presionar de nuevo el submit
function limpiarHTML(){ 
    while (viewResultado.children[1]){
        viewResultado.removeChild(viewResultado.children[1]);
    };
};


//Funcion para mostrar la imagen segun el icon enviado en el json
function iconWeather(){

    switch(true){ // segun la informacion que envia icon, seleccionamos una imagen y descripcion.

        case (icono === '01d'):

            descripcion = "soleado";
            imgsrc = "img/soleado.png";

            break;

        case (icono === '01n'):

            descripcion = "Despejado";
            imgsrc = "img/luna.png";
    
            break;

        case (icono === '02d'):

            descripcion = "Parcialmente Nublado";
            imgsrc = "img/parciald.png";
        
            break;
        
        case (icono === '02n'):

            descripcion = "Parcialmente Nublado";
            imgsrc = "img/parcialn.png";
            
            break;

        case (icono === '03d' || icono === '03n' || icono === '04d' || icono === '04n'):

            descripcion = "Nublado";
            imgsrc = "img/totalmentn.png";
               
            break;
        
        case (icono === '09d' || icono === '09n' || icono === '10d' || icono === '10n'):

            descripcion = "Lluvia";
            imgsrc = "img/lluvia.png";
                  
            break;
        
        case (icono === '11d' || icono === '11n'):

            descripcion = "Tormenta Electrica";
            imgsrc = "img/tormenta.png";
                
            break;

        case (icono === '13d' || icono === '13n'):

            descripcion = "Nieve";
            imgsrc = "img/snowf.png";
                    
            break;

        case (icono === '50d' || icono === '50n'):

            descripcion = "Neblina";
            imgsrc = "img/mist.png";
                        
            break;

    };
};


//Funcion para traducir los dias y meses
function translate(diaMes){
    switch (diaMes){

    //Case de dias
        case 'Monday':
            nombDia = "Lunes";
            
            break;
            
        case 'Tuesday':
            nombDia = "Martes";
            
            break;

        case 'Wednesday':
            nombDia = "Miercoles";
                
            break;

        case 'Thursday':
            nombDia = "Jueves";
                    
            break;

        case 'Friday':
            nombDia = "Viernes";
                        
            break;

        case 'Saturday':
            nombDia = "Sabado";
                            
            break;
        
        case 'Sunday':
            nombDia = "Domingo";
                                
            break;

        
    //Case de meses
        case 'January':
            nombMes = "Enero";
            
            break;
            
        case 'February':
            nombMes = "Febrero";
            
            break;

        case 'March':
            nombMes = "Marzo";
                
            break;

        case 'April':
            nombMes = "Abril";
                    
            break;

        case 'May':
            nombMes = "Mayo";
                        
            break;

        case 'June':
            nombMes = "Junio";
                            
            break;
        
        case 'July':
            nombMes = "Julio";
                                
            break;

        case 'August':
            nombMes = "Agosto";
                    
            break;
    
        case 'September':
            nombMes = "Septiembre";
                        
            break;
    
        case 'October':
            nombMes = "Octubre";
                            
            break;
    
        case 'November':
            nombMes = "Noviembre";
                                
            break;
            
        case 'December':
            nombMes = "Diciembre";
                                    
            break;
    };
};

//Esta funcion no es propia la baje de: https://tobiasahlin.com/spinkit/
//hay que añadir 3 cosas el JS -> llamar la funcion, el CSS -> crear las funciones para la recreacion y el HTML ->incluirlo con appchildren en el JS
function spinner (){
    
    limpiarHTML();

    const divSpinner = document.createElement('div');
    divSpinner.classList.add('sk-fading-circle');
    divSpinner.innerHTML = `
    <div class="sk-circle1 sk-circle"></div>
    <div class="sk-circle2 sk-circle"></div>
    <div class="sk-circle3 sk-circle"></div>
    <div class="sk-circle4 sk-circle"></div>
    <div class="sk-circle5 sk-circle"></div>
    <div class="sk-circle6 sk-circle"></div>
    <div class="sk-circle7 sk-circle"></div>
    <div class="sk-circle8 sk-circle"></div>
    <div class="sk-circle9 sk-circle"></div>
    <div class="sk-circle10 sk-circle"></div>
    <div class="sk-circle11 sk-circle"></div>
    <div class="sk-circle12 sk-circle"></div>
    `;

    viewResultado.appendChild(divSpinner);
};