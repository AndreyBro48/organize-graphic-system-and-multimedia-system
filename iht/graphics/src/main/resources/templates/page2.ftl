<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="/lab2/style.css" type="text/css"/>
        <script src="/lab2/script.js"></script>
    </head>    
    <body>
        <main>
            <nav>
                <label class="but" for="inputImageElement" >Открыть картинку</label>
                <input style="display: none;" type="file" id="inputImageElement" accept="image/*" onchange="handleFile(this.files)"/>
                <span class="but" onclick="setCanny()">Оператор Canny</span>
                
                <span class="but" style="margin-top: 100px;" id="FitWidth" onclick="saveImage()">Сохранить</span>
            </nav>
            <section>
                <div id="ImageConteyner">	
                    <canvas id="canvas" width="400px" height="400px"></canvas>
                </div>
            </section>
        </main>
            <!-- vertex shader -->
    <script id="2d-vertex-shader" type="x-shader/x-vertex">
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
        }
    </script>
    <!-- fragment shader -->
    <script id="2d-fragment-shader" type="x-shader/x-fragment">
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
            }
        </script>
    </body>
</html>