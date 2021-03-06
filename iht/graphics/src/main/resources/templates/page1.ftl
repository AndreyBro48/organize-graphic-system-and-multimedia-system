<!DOCTYPE HTML>
<html>
<head>
        <link rel="stylesheet" href="/lab1/style.css" type="text/css"/>
        <script src="/lab1/script.js"></script>
    </head>    
    <body>
        
        <main>
            <nav>
                <label class="but" for="inputImageElement" >Открыть картинку</label>
                <input style="display: none;" type="file" id="inputImageElement" accept="image/*" onchange="handleFile(this.files)"/>
                <span class="but" onclick="setFilter(TypeFilter.GRAY)">Сделать серым</span>
                <span class="but" onclick="setFilter(TypeFilter.NEGATIVE)">Негатив</span>
                <span class="but" onclick="setFilter(TypeFilter.BRIGH)">Ярче</span>
                <span class="but" onclick="setFilter(TypeFilter.DARK)">Темнее</span>
                
                <span class="but" style="margin-top: 100px;" id="FitWidth" onclick="saveImage()">Сохранить</span>
            </nav>
            <section>
                <div id="ImageConteyner">	
                    <canvas id="canvasElement" width="400px" height="400px"></canvas>
                </div>
            </section>
        </main>
    </body>
</html>