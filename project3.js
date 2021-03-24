
var gl;

function webGLStart() {
	var canvas = document.getElementById("webGLcanvas");

	// leave enough room on the bottom of the canvas for the controls
	canvas.width = window.innerWidth - 30;
	canvas.height = window.innerHeight - 30;
	
	// create the GL viewport
	initGL(canvas);

	// load the shaders, buffers, and textures into the GPU
	initShaders();
	initBuffers();
	initTextures();

	// set the background color to opaque black
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// render only pixels in front of the others
	gl.enable(gl.DEPTH_TEST);
	
	// handle mouse inputs with callbacks
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	document.onwheel = handleMouseWheel;

	// handle showing and hiding of planets
	addCheckboxEventListeners();

	// render the scene
	tick();
}

var whiteTexture, sunTexture, mercuryTexture, venusTexture, earthTexture;
var jupiterTexture, saturnTexture, uranusTexture, neptuneTexture, moonTexture;

function initTextures() {
	whiteTexture = gl.createTexture();

	whiteTexture.image = new Image();
	whiteTexture.image.onload = function() {
		handleLoadedTexture(whiteTexture)
	}
	whiteTexture.image.src = "img/white.gif";
	
	sunTexture = gl.createTexture();
	sunTexture.image = new Image();
	sunTexture.image.onload = function() {
		handleLoadedTexture(sunTexture)
	}
	sunTexture.image.src = "img/sun.png";
	
	mercuryTexture = gl.createTexture();
	mercuryTexture.image = new Image();
	mercuryTexture.image.onload = function() {
		handleLoadedTexture(mercuryTexture)
	}
	mercuryTexture.image.src = "img/mercury.png";
	
	venusTexture = gl.createTexture();
	venusTexture.image = new Image();
	venusTexture.image.onload = function() {
		handleLoadedTexture(venusTexture)
	}
	venusTexture.image.src = "img/venus.png";
	
	earthTexture = gl.createTexture();
	earthTexture.image = new Image();
	earthTexture.image.onload = function() {
		handleLoadedTexture(earthTexture)
	}
	earthTexture.image.src = "img/earth.png";
	
	marsTexture = gl.createTexture();
	marsTexture.image = new Image();
	marsTexture.image.onload = function() {
		handleLoadedTexture(marsTexture)
	}
	marsTexture.image.src = "img/mars.png";
	
	jupiterTexture = gl.createTexture();
	jupiterTexture.image = new Image();
	jupiterTexture.image.onload = function() {
		handleLoadedTexture(jupiterTexture)
	}
	jupiterTexture.image.src = "img/jupiter.png";
	
	saturnTexture = gl.createTexture();
	saturnTexture.image = new Image();
	saturnTexture.image.onload = function() {
		handleLoadedTexture(saturnTexture)
	}
	saturnTexture.image.src = "img/saturn.png";
	
	uranusTexture = gl.createTexture();
	uranusTexture.image = new Image();
	uranusTexture.image.onload = function() {
		handleLoadedTexture(uranusTexture)
	}
	uranusTexture.image.src = "img/uranus.png";
	
	neptuneTexture = gl.createTexture();
	neptuneTexture.image = new Image();
	neptuneTexture.image.onload = function() {
		handleLoadedTexture(neptuneTexture)
	}
	neptuneTexture.image.src = "img/neptune.png";

	moonTexture = gl.createTexture();
	moonTexture.image = new Image();
	moonTexture.image.onload = function() {
		handleLoadedTexture(moonTexture)
	}
	moonTexture.image.src = "img/moon.png";
}

function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
		console.error(e);
	}
	
	if (!gl) {
		alert("Could not initialise WebGL");
	}
}

var shaderprogram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	// create the program, then attach and link 
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// check for linker errors.
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	// attach shaderprogram to openGL context.
	gl.useProgram(shaderProgram);

	// position data stored to attribute variable
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

function getShader(gl, id) {

	// load the shader code by its ID, as assigned in the script element (e.g. "shader-fs" or "shader-vs")
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var k = shaderScript.firstChild;
	var str = "";
	// while firstChild exists
	while (k) {
		// if the firstChild is a TEXT type document
		if (k.nodeType == 3) {
			// append the text to str.
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	// now we have the type and the code, and we provide it to openGL as such, then compile the shader code
	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	// if the compilation of the shader code fails, report the error and return nothing, since the shader failed to compile
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	
	// if there were no errors in compilation, return the compiled shader.
	return shader;
}

var vertexPositionBuffers = {};
var textureCoordBuffers = {};
var orbitPositionBuffers = {};
var orbitTextureCoordBuffers = {};


// we will generate the geometry with this function
function initBuffers() {
	///
	/// Sphere: The Sun
	///
	var radius = 2, slices = 48, stacks = 16;
	var vertices = generateSphereVertices(radius, slices, stacks);
	
	sunPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sunPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	sunPositionBuffer.itemSize = 3;
	sunPositionBuffer.numItems = stacks * slices * 2;

	var textureCoords = generateTextureCoords(slices, stacks);
	
	sunTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sunTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	sunTextureCoordBuffer.itemSize = 2;
	sunTextureCoordBuffer.numItems = stacks * (slices + 1) * 2;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	initPlanetAndOrbitBuffer(mercuryProps);
	initPlanetAndOrbitBuffer(venusProps);
	initPlanetAndOrbitBuffer(earthProps);
	initPlanetAndOrbitBuffer(marsProps);
	initPlanetAndOrbitBuffer(jupiterProps);
	initPlanetAndOrbitBuffer(saturnProps);
	initPlanetAndOrbitBuffer(uranusProps);
	initPlanetAndOrbitBuffer(neptuneProps);
	
	initPlanetAndOrbitBuffer(moonProps);
}

function initPlanetAndOrbitBuffer(planetProps) {
	var radius = planetProps.radius;
	var slices = planetProps.slices;
	var stacks = planetProps.stacks;
	var planetName = planetProps.name;

	///
	/// Sphere: Planet
	///
	vertices = generateSphereVertices(radius, slices, stacks);
	
	vertexPositionBuffers[planetName] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffers[planetName]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	vertexPositionBuffers[planetName].itemSize = 3;
	vertexPositionBuffers[planetName].numItems = stacks * slices * 2;

	textureCoords = generateTextureCoords(slices, stacks);
	
	textureCoordBuffers[planetName] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffers[planetName]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	textureCoordBuffers[planetName].itemSize = 2;
	textureCoordBuffers[planetName].numItems = stacks * (slices + 1) * 2;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	///
	/// Line Loop: Planet's orbit
	///
	var orbitalValues = generateOrbitLineVertices(planetProps);
	
	orbitPositionBuffers[planetName] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, orbitPositionBuffers[planetName]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(orbitalValues.vertices), gl.STATIC_DRAW);
	orbitPositionBuffers[planetName].itemSize = 3;
	orbitPositionBuffers[planetName].numItems = orbitalValues.numItems;
	
	orbitTextureCoordBuffers[planetName] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, orbitTextureCoordBuffers[planetName]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(orbitalValues.textureCoords), gl.STATIC_DRAW);
	orbitTextureCoordBuffers[planetName].itemSize = 2;
	orbitTextureCoordBuffers[planetName].numItems = orbitalValues.numItems;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// model view matrix from the GL matrix library
var mvMatrix = mat4.create();

// perspective matrix
var pMatrix = mat4.create();

var sceneDepth = -40.0;

// this object describes the Sun (position, rotation)
var sunProps = {
	x: 0, y: 0, z: 0,
	rotation: 0, rotationSpeed: 5
};

var mercuryProps = {
	name: 'mercury',
	x: 0, y: 0, z: 0,
	radius: 0.5, slices: 24, stacks: 12,
	rotation: 0, rotationSpeed: 15,
	orbitalPeriodDivisor: 15,
	orbitalRadius: 3,
	orbitalInclination: 24,
	orbitalEccentricity: 0.206,
	visible: true
};

var venusProps = {
	name: 'venus',
	x: 0, y: 0, z: 0,
	radius: 0.80, slices: 36, stacks: 12,
	rotation: 0, rotationSpeed: 15,
	orbitalPeriodDivisor: 30,
	orbitalRadius: 5,
	orbitalInclination: 10,
	orbitalEccentricity: 0.007,
	visible: true
};

var earthProps = {
	name: 'earth',
	x: 0, y: 0, z: 0,
	radius: 0.85, slices: 36, stacks: 12,
	rotation: 0, rotationSpeed: 20,
	orbitalPeriodDivisor: 50,
	orbitalRadius: 8,
	orbitalInclination: 8,
	orbitalEccentricity: 0.017,
	visible: true
};

var marsProps = {
	name: 'mars',
	x: 0, y: 0, z: 0,
	radius: 0.55, slices: 24, stacks: 12,
	rotation: 0, rotationSpeed: 20,
	orbitalPeriodDivisor: 75,
	orbitalRadius: 11,
	orbitalInclination: 8,
	orbitalEccentricity: 0.093,
	visible: true
};

var jupiterProps = {
	name: 'jupiter',
	x: 0, y: 0, z: 0,
	radius: 1.5, slices: 48, stacks: 24,
	rotation: 90, rotationSpeed: 20,
	orbitalPeriodDivisor: 100,
	orbitalRadius: 14,
	orbitalInclination: 2,
	orbitalEccentricity: 0.048,
	visible: true
};

var saturnProps = {
	name: 'saturn',
	x: 0, y: 0, z: 0,
	radius: 1.25, slices: 48, stacks: 24,
	rotation: 0, rotationSpeed: 25,
	orbitalPeriodDivisor: 150,
	orbitalRadius: 18,
	orbitalInclination: 5,
	orbitalEccentricity: 0,
	visible: true
};

var uranusProps = {
	name: 'uranus',
	x: 0, y: 0, z: 0,
	radius: 0.90, slices: 48, stacks: 24,
	rotation: 0, rotationSpeed: 30,
	orbitalPeriodDivisor: 200,
	orbitalRadius: 21,
	orbitalInclination: 6,
	orbitalEccentricity: 0.053,
	visible: true
};

var neptuneProps = {
	name: 'neptune',
	x: 0, y: 0, z: 0,
	radius: 0.85, slices: 36, stacks: 24,
	rotation: 0, rotationSpeed: 30,
	orbitalPeriodDivisor: 250,
	orbitalRadius: 24,
	orbitalInclination: 4,
	orbitalEccentricity: 0.010,
	visible: true
};

var moonProps = {
	name: 'moon',
	x: 0, y: 0, z: 0,
	radius: 0.3, slices: 24, stacks: 12,
	rotation: 0, rotationSpeed: 20,
	orbitalPeriodDivisor: 20,
	orbitalRadius: 1.5,
	orbitalEccentricity: 0,
	visible: true
};

// DOM elements for the checkboxes which control if the planet is drawn
var mercuryCheckbox, venusCheckbox, earthCheckbox, marsCheckbox;
var jupiterCheckbox, saturnCheckbox, uranusCheckbox, neptuneCheckbox;

function addCheckboxEventListeners() {
	// add event listeners to form fields so we can run a callback on change
	mercuryCheckbox = document.getElementById('drawMercury');
	mercuryCheckbox.addEventListener('change', function() {
		mercuryProps.visible = this.checked;
	});
	
	venusCheckbox = document.getElementById('drawVenus');
	venusCheckbox.addEventListener('change', function() {
		venusProps.visible = this.checked;
	});
	
	earthCheckbox = document.getElementById('drawEarth');
	earthCheckbox.addEventListener('change', function() {
		earthProps.visible = this.checked;
	});
	
	marsCheckbox = document.getElementById('drawMars');
	marsCheckbox.addEventListener('change', function() {
		marsProps.visible = this.checked;
	});
	
	jupiterCheckbox = document.getElementById('drawJupiter');
	jupiterCheckbox.addEventListener('change', function() {
		jupiterProps.visible = this.checked;
	});
	
	saturnCheckbox = document.getElementById('drawSaturn');
	saturnCheckbox.addEventListener('change', function() {
		saturnProps.visible = this.checked;
	});
	
	uranusCheckbox = document.getElementById('drawUranus');
	uranusCheckbox.addEventListener('change', function() {
		uranusProps.visible = this.checked;
	});
	
	neptuneCheckbox = document.getElementById('drawNeptune');
	neptuneCheckbox.addEventListener('change', function() {
		neptuneProps.visible = this.checked;
	});

	moonCheckbox = document.getElementById('drawMoon');
	moonCheckbox.addEventListener('change', function() {
		moonProps.visible = this.checked;
	});
}

var lastTime = 0;

// compute altered variables for animation
function animate() {
	var currentTime = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = currentTime - lastTime;
		// if the window is hidden for a long time, the elapsed time will be a large number
		// this prevents the sphere from leaving the frame
		if (elapsed > 100) {
			elapsed = 100;
		}

		// update the rotation of the Sun and planets
		sunProps.rotation += (sunProps.rotationSpeed * elapsed) / 1000.0;
		
		updateRevolution(mercuryProps, elapsed, currentTime);
		updateRevolution(venusProps, elapsed, currentTime);
		updateRevolution(earthProps, elapsed, currentTime);
		updateRevolution(marsProps, elapsed, currentTime);
		updateRevolution(jupiterProps, elapsed, currentTime);
		updateRevolution(saturnProps, elapsed, currentTime);
		updateRevolution(uranusProps, elapsed, currentTime);
		updateRevolution(neptuneProps, elapsed, currentTime);
		updateRevolution(moonProps, elapsed, currentTime);
	}
	lastTime = currentTime;
}

function updateRevolution(planetProps, elapsed, currentTime) {
	planetProps.rotation += (planetProps.rotationSpeed * elapsed) / 1000.0;
	angle = degToRad(currentTime / planetProps.orbitalPeriodDivisor);
	planetProps.x = Math.cos(angle) * planetProps.orbitalRadius * (1 + planetProps.orbitalEccentricity);
	planetProps.y = Math.sin(angle) * planetProps.orbitalRadius;
}

function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// generate a perspective matrix with y-axis Field of View = 45, and near/far clipping planes at 0.1 and 500
	mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0);

	///
	/// Sphere: The Sun
	///
	mat4.identity(mvMatrix);
	translateScene(mvMatrix, mouseRotMatrix, sceneDepth, 0);

	mat4.translate(mvMatrix, mvMatrix, [sunProps.x, sunProps.y, sunProps.z]);
	mat4.rotate(mvMatrix, mvMatrix, degToRad(sunProps.rotation), [1.0, 1.0, 1.0]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sunPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sunPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, sunTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sunTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, sunTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, sunTextureCoordBuffer.numItems);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	drawPlanetAndOrbit(mercuryProps, mercuryTexture);
	drawPlanetAndOrbit(venusProps, venusTexture);
	drawPlanetAndOrbit(earthProps, earthTexture);
	drawPlanetAndOrbit(marsProps, marsTexture);
	drawPlanetAndOrbit(jupiterProps, jupiterTexture);
	drawPlanetAndOrbit(saturnProps, saturnTexture);
	drawPlanetAndOrbit(uranusProps, uranusTexture);
	drawPlanetAndOrbit(neptuneProps, neptuneTexture);
	
	drawMoonAndOrbit(earthProps, moonProps, moonTexture);
}

// handles the moment by moment re-rendering.
function tick(){
	requestAnimFrame(tick);
	drawScene();
	animate();
}

// here we connect the uniform matrices 
function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function generateSphereVertices(sRadius, slices, stacks) {
	var vertices = [];
	for (var t = 0; t < stacks; t++) { // stacks are ELEVATION so they count theta
		var phi1 = (t / stacks) * Math.PI;
		var phi2 = ((t + 1) / stacks) * Math.PI;
		for (p = 0; p < slices + 1; p++) { // slices are ORANGE SLICES so the count azimuth
			var theta = (p / slices) * 2 * Math.PI ; 
			var xVal = sRadius * Math.cos(theta) * Math.sin(phi1);
			var yVal = sRadius * Math.sin(theta) * Math.sin(phi1);
			var zVal = sRadius * Math.cos(phi1);
			vertices = vertices.concat([ xVal, yVal, zVal ]);
			
			xVal = sRadius * Math.cos(theta) * Math.sin(phi2);
			yVal = sRadius * Math.sin(theta) * Math.sin(phi2);
			zVal = sRadius * Math.cos(phi2);
			vertices = vertices.concat([ xVal, yVal, zVal ]);
		}
	}
	
	return vertices;
}

function generateTextureCoords(slices, stacks) {
	var textureCoords = [];
	for (t = 0; t < stacks; t++ )	{
		var phi1 = (t / stacks );
		var phi2 = ((t + 1) / stacks);
		for (p = 0; p < slices + 1; p++) {
			var theta = 1 - (p / slices);
			textureCoords = textureCoords.concat([theta, phi1]);
			textureCoords = textureCoords.concat([theta, phi2]);
		}
	}
	return textureCoords;
}


function generateOrbitLineVertices(planetProps) {
	var values = {
		vertices: [],
		textureCoords: [],
		numItems: 0
	};
	
	for (var i = 0; i < Math.PI * 2; i += 0.025) {
		var x = Math.cos(i) * planetProps.orbitalRadius * (1 + planetProps.orbitalEccentricity);
		var y = Math.sin(i) * planetProps.orbitalRadius;
		var z = 0;

		values.vertices = values.vertices.concat([ x, y, z ]);
		values.textureCoords = values.textureCoords.concat([ 0, 0 ]);
		values.numItems++;
	}
	
	return values;
}

function drawPlanetAndOrbit(planetProps, planetTexture, ) {
	if (!planetProps.visible) {
		return;
	}
	
	var planetName = planetProps.name;

	///
	/// Sphere: The Planet
	///
	mat4.identity(mvMatrix);
	translateScene(mvMatrix, mouseRotMatrix, sceneDepth, planetProps.orbitalInclination);

	mat4.translate(mvMatrix, mvMatrix, [planetProps.x, planetProps.y, planetProps.z]);
	mat4.rotateZ(mvMatrix, mvMatrix, degToRad(planetProps.rotation));

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffers[planetName]);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffers[planetName].itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffers[planetName]);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, textureCoordBuffers[planetName].itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, planetTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, textureCoordBuffers[planetName].numItems);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	///
	/// Line Loop: Planet's orbit
	///
	mat4.identity(mvMatrix);
	translateScene(mvMatrix, mouseRotMatrix, sceneDepth, planetProps.orbitalInclination);

	// here we load new geometry from the buffer we made.
	gl.bindBuffer(gl.ARRAY_BUFFER, orbitPositionBuffers[planetName]);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, orbitPositionBuffers[planetName].itemSize, gl.FLOAT, false, 0, 0);

	// then we load the colors.
	gl.bindBuffer(gl.ARRAY_BUFFER, orbitTextureCoordBuffers[planetName]);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, orbitTextureCoordBuffers[planetName].itemSize, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
	// set the matrix uniforms (we reset mvMatrix), then we draw
	setMatrixUniforms();
	gl.drawArrays(gl.LINE_LOOP, 0, orbitTextureCoordBuffers[planetName].numItems);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function drawMoonAndOrbit(planetProps, moonProps, moonTexture) {
	if (!planetProps.visible || !moonProps.visible) {
		return;
	}
	
	var moonName = moonProps.name;
	
	///
	/// Sphere: The Moon
	///
	mat4.identity(mvMatrix);
	translateScene(mvMatrix, mouseRotMatrix, sceneDepth, planetProps.orbitalInclination);
	
	// translate to the planet first
	mat4.translate(mvMatrix, mvMatrix, [planetProps.x, planetProps.y, planetProps.z]);

	mat4.translate(mvMatrix, mvMatrix, [moonProps.x, moonProps.y, moonProps.z]);
	mat4.rotateZ(mvMatrix, mvMatrix, degToRad(planetProps.rotation));

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffers[moonName]);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffers[moonName].itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffers[moonName]);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, textureCoordBuffers[moonName].itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, moonTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, textureCoordBuffers[moonName].numItems);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	///
	/// Line Loop: Moon's orbit
	///
	mat4.identity(mvMatrix);
	translateScene(mvMatrix, mouseRotMatrix, sceneDepth, planetProps.orbitalInclination);
	
	// translate to the planet first
	mat4.translate(mvMatrix, mvMatrix, [planetProps.x, planetProps.y, planetProps.z]);

	// here we load new geometry from the buffer we made.
	gl.bindBuffer(gl.ARRAY_BUFFER, orbitPositionBuffers[moonName]);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, orbitPositionBuffers[moonName].itemSize, gl.FLOAT, false, 0, 0);

	// then we load the colors.
	gl.bindBuffer(gl.ARRAY_BUFFER, orbitTextureCoordBuffers[moonName]);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, orbitTextureCoordBuffers[moonName].itemSize, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
	// set the matrix uniforms (we reset mvMatrix), then we draw
	setMatrixUniforms();
	gl.drawArrays(gl.LINE_LOOP, 0, orbitTextureCoordBuffers[moonName].numItems);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function degToRad(degrees) {
	// modified to normalize the angle before converting it
	return (degrees % 360) * Math.PI / 180;
}

function translateScene(mvMatrix, mouseRotMatrix, sceneDepth, orbitalInclination) {
	// apply mouse wheel zoom translation
	mat4.translate(mvMatrix, mvMatrix, [0, 0, sceneDepth]);

	// apply mouse rotation
	mat4.multiply(mvMatrix, mvMatrix, mouseRotMatrix);
	
	// apply orbital inclinations to each planet
	var orbitalInclinationMatrix = mat4.create;
	mat4.identity(orbitalInclinationMatrix);
	mat4.rotateZ(orbitalInclinationMatrix, orbitalInclinationMatrix, degToRad(orbitalInclination));
	mat4.multiply(mvMatrix, orbitalInclinationMatrix, mvMatrix);
}

///
/// Mouse functions: Pan, tilt, and zoom with cursor and scroll wheel
///
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

// rotation matrix to hold the effective rotation we want from the mouse
var mouseRotMatrix = mat4.create();
mat4.identity(mouseRotMatrix);

// apply a 110 degree tilt to the scene initially
var initialTilt = mat4.create;
mat4.identity(initialTilt);
mat4.rotateX(initialTilt, initialTilt, degToRad(110));
mat4.multiply(mouseRotMatrix, initialTilt, mouseRotMatrix);

function handleMouseDown(event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
	mouseDown = false;
}

function handleMouseMove(event) {
	if (!mouseDown) { return; }
	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX
	var newRotationMatrix = mat4.create();
	mat4.identity(newRotationMatrix);
	mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaX / 18), [0, 1, 0]);

	var deltaY = newY - lastMouseY;
	mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaY / 18), [1, 0, 0]);

	mat4.multiply(mouseRotMatrix, newRotationMatrix, mouseRotMatrix);
	lastMouseX = newX
	lastMouseY = newY;
}

function handleMouseWheel(event){
	sceneDepth += event.deltaY * -0.025;
}
