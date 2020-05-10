function handleFile(files) {
    file = files[0];
    if (file == undefined || file == null) return;
    reader = new FileReader();
    reader.onload = function () {
        img = new Image();
        img.onload = function () {
            var canvas = document.getElementById("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            render(img);
        }
        img.src = reader.result;
    }
    reader.readAsDataURL(file);
};

function saveImage() {
    var link = document.createElement("a");
    link.setAttribute("href", document.getElementById("canvas").toDataURL());
    link.setAttribute("download", "");
    link.click();
};

var gl, program, canvas;

// Функция создания шейдера по типу и id источника в структуре DOM
function getShader(type, id) {
    var source = document.getElementById(id).innerHTML;
    // Создаем шейдер по типу
    var shader = gl.createShader(type);
    // Установка источника шейдера
    gl.shaderSource(shader, source);
    // Компилируем шейдер
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Ошибка компиляции шейдера: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
};

window.onload = function () {
    canvas = document.getElementById("canvas");
    try {
        gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }) || canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true });
    }
    catch (e) { }

    if (!gl) {
        alert("Ваш браузер не поддерживает WebGL");
    }

    // Получаем шейдеры
    var fragmentShader = getShader(gl.FRAGMENT_SHADER, '2d-fragment-shader');
    var vertexShader = getShader(gl.VERTEX_SHADER, '2d-vertex-shader');
    // Создаем объект программы шейдеров
    program = gl.createProgram();
    // Прикрепляем к ней шейдеры
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // Связываем программу с контекстом webgl
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Не удалсь установить шейдеры");
    }

    gl.useProgram(program);

    var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    // Координаты текстур для прямоугольника
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
}

var stateLocation 
function render(image) {
    gl.viewport(0, 0, image.width, image.height);
    // Инициалиируем данные вершин
    var positionLocation = gl.getAttribLocation(program, "a_position");

    // Создаем текстуры
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Установка параметров, чтобы можно было отобразить изображение любого размера
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Загрузка изображения в текстуры
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Установка форм
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    stateLocation = gl.getUniformLocation(program, "u_state");

    // Установка разрешения
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Установка размера изображения
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    // Создаем буфер для положения углов прямоугольника 
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Установка прямоугольника такого же размера как изображение 
    setRectangle(gl, 0, 0, image.width, image.height);

    //простая отрисовка изображения
    draw(0)
};

function setCanny() {
    draw(1);
}

function draw(n) {
    if (n > 4) return;
    var image = new Image();
    image.onload = function () {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (n != 0) return draw(n + 1);
    }
    gl.uniform1i(stateLocation, n);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    image.src = document.getElementById("canvas").toDataURL();
};

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);
};