var cannyVertexShader = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
    
uniform vec2 u_resolution;
    
varying vec2 v_texCoord;
    
void main() {
    vec2 a = a_position / u_resolution;
    vec2 b = a * 2.0;
    vec2 clipSpace = b - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_texCoord = a_texCoord;
}`
const cannyFragmentShader = `
precision highp float; 
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform int u_state;

varying vec2 v_texCoord;

const float PI = 3.141592653589793238462643383279502884197169;
const mat3 X_COMPONENT_MATRIX = mat3(
    1., 0., -1.,
    2., 0., -2.,
    1., 0., -1.
);

const mat3 Y_COMPONENT_MATRIX = mat3(
    1., 2., 1.,
    0., 0., 0.,
    -1., -2., -1.
);    

vec2 onePixel;
float Q;

float mid(vec4 pix){
    return (pix.r + pix.g + pix.b) / 3.;
}

float round(float A){
    if(mod(A, 1.) < .5){
        return floor(A);
    }
    else{
        return ceil(A);
    }
}

float convoluteMatrices(mat3 A, mat3 B){
    return dot(A[0], B[0]) + dot(A[1], B[1]) + dot(A[2], B[2]);
}

float grayScale(){
    vec4 pix = texture2D(u_image, v_texCoord + onePixel * vec2(0, 0));
    return dot(pix.rgb, vec3(0.299, 0.587, 0.114));
}

float gaussianBlur(){
vec4 colorSum =
    texture2D(u_image, v_texCoord + onePixel * vec2(-2, -2)) * 2. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-2, -1)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-2, 0)) * 5. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-2, 1)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-2, 2)) * 2. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, -2)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * 9. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, 0)) * 12. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, 1)) * 9. +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, 2)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, -2)) * 5. +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, -1)) * 12. +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)) * 15. +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, 1)) * 12. +
    texture2D(u_image, v_texCoord + onePixel * vec2(0, 2)) * 5. +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, -2)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, -1)) * 9. +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, 0)) * 12. +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, 1)) * 9. +
    texture2D(u_image, v_texCoord + onePixel * vec2(1, 2)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(2, -2)) * 2. +
    texture2D(u_image, v_texCoord + onePixel * vec2(2, -1)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(2, 0)) * 5. +
    texture2D(u_image, v_texCoord + onePixel * vec2(2, 1)) * 4. +
    texture2D(u_image, v_texCoord + onePixel * vec2(2, 2)) * 2.;

    return mid(colorSum / 159.);
}

float calcG(float x, float y, int S){
    mat3 imgMat = mat3(0.);
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            imgMat[i][j] = mid(texture2D(u_image, v_texCoord + onePixel * vec2(j-int(x), i-int(y))));
        }
    }
    float gradX = convoluteMatrices(X_COMPONENT_MATRIX, imgMat);
    float gradY = convoluteMatrices(Y_COMPONENT_MATRIX, imgMat);
    float G = sqrt(gradX * gradX + gradY * gradY);
    if(S == 1)
        if(G != 0.0){
            Q = round(atan(gradX, gradY)/(PI/4.))*(PI/4.)-(PI/2.);
        }
        else{
            Q = -10.5;
        }
    return G;
}

float nonMaximumSuppression(float Q, float T){                
    if(Q == -10.5) return 0.;
    float dx = sign(cos(Q));
    float dy = -sign(sin(Q));
    float TH = calcG(dx, dy, 0);
    float TL = calcG(-dx, -dy, 0);
    if(TH <= T && T >= TL) return T; else return 0.; 
}

float gradient(){
    float G = calcG(0., 0., 1);
    return nonMaximumSuppression(Q, G);
}

float dThreshold(float down, float up){
    float pix = mid(texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)));
    if (pix >= up) return 1.;
    if (pix <= down) return 0.;
    return .5;
}

float hysteresis(float low, float high){
    int x = 0, y = 0, p = 0, count = 0;
    float k = mid(texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)));

    if(k != 0.){
        if(k >= high) return k;
        for (int i = -1; i < 2; i++) {
            for (int j = -1; j < 2; j++) {
                if(i != 0 && j != 0 ){
                    p = 0;
                    for(int s = 0; s < 15000; s++){
                        x += j;
                        y += i;
                        if(y < 0 || x < 0 || x >= int(u_textureSize.x) || y >= int(u_textureSize.y)) break;
                        k = mid(texture2D(u_image, v_texCoord + onePixel * vec2(x, y)));
                        if(k <= low) break;
                        p++;
                    }
                    if(p >= 1) count++;
                }
            }
        }
        if(count >= 1) return 1.;
    }
    else{
        return 0.;
    }
}

void main() {
    onePixel = vec2(1.) / u_textureSize;
    float result;
    //Простая отрисовка
    if (u_state == 0){
        vec4 pix = texture2D(u_image, v_texCoord + onePixel * vec2(0, 0));
        gl_FragColor = vec4(pix);
        return;
    }
    // Обесцвечивание
    if(u_state == 1){
        result = grayScale();
    }
    // Сглаживание
    if(u_state == 2){
        result = gaussianBlur();
    }
    // Поиск градиентов и подавление не-максимумов
    if(u_state == 3){
        result = gradient();
    }
    // Двойная пороговая фильтрация
    if(u_state == 4){
        result = dThreshold(.5, .6);
    }
    // Трассировка области неоднозначности
    if(u_state == 5){
        result = hysteresis(.5, 0.75);
    }

    gl_FragColor = vec4(vec3(result), 1.);
}`
//время в мс, за которое кадр успевает преобразоваться оператором Canny
var timeToResult = 1000
var gl, stateLocation, program

function init(canvasWebGl, width, height, ctx2d){
    gl = canvasWebGl.getContext("webgl", { preserveDrawingBuffer: true }) || canvasWebGl.getContext("experimental-webgl", { preserveDrawingBuffer: true });
    canvasWebGl.width = width;
    canvasWebGl.height = height;

    console.log(`w=${canvasWebGl.width}; h=${canvasWebGl.height}`)
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, cannyVertexShader);
    gl.compileShader(vs);

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, cannyFragmentShader);
    gl.compileShader(fs);

    program = gl.createProgram();
    gl.attachShader(program, fs);
    gl.attachShader(program, vs);
    gl.linkProgram(program);
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

    var img = ctx.getImageData(0, 0, canvasVideo.width, canvasVideo.height) 
    renderOnWebGl(img, canvasWebGl) 
}

function canny(canvas2d, ctx2d, canvasWebGl){
    draw(0, new Date().getTime())
}

function renderOnWebGl(image, canvas){
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
}

function draw(n, startTime) {
    var imageSrc
    if (n == 0){
        imageSrc = "canvasVideo"
    } else {
        imageSrc = "canvasCanny"
    }
    if (n > 3) {
        var resultImage = new Image();
        resultImage.onload = function(){
            ctxCanvasResult.drawImage(resultImage, 0, 0, canvasVideo.width, canvasVideo.height)
            timeToResult = new Date().getTime() - startTime
        }
        resultImage.src = document.getElementById(imageSrc).toDataURL();
        return;
    }
    var image = new Image();
    image.onload = function () {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        return draw(n + 1, startTime);
    }
    gl.uniform1i(stateLocation, n);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    image.src = document.getElementById(imageSrc).toDataURL();
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