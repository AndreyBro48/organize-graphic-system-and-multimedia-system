var ctx
const TypeFilter = {
    GRAY: 1,
    NEGATIVE: 2,
    BRIGH: 3,
    DARK: 4
}

function saveImage(){
    const aElement = document.createElement('a')
    aElement.setAttribute('download', "image.png")
    aElement.href = canvasElement.toDataURL("image/png")
    aElement.click()
}

function setGrayImageData(imageData){
    for (i = 0; i < imageData.data.length; i += 4){
        let rgb = [imageData.data[i], imageData.data[i+1], imageData.data[i+2]]
        let avg = (rgb[0] + rgb[1] + rgb[2]) / 3
        imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = avg
    }
    return imageData
}

function setNegativeImageData(imageData){
    for (i = 0; i < imageData.data.length; i += 4){
        let newRGB = [255 - imageData.data[i], 255 - imageData.data[i+1], 255 - imageData.data[i+2]]
        imageData.data[i] = newRGB[0]
        imageData.data[i+1] = newRGB[1]
        imageData.data[i+2] = newRGB[2]
    }
    return imageData
}

function setBrighterImageData(imageData){
    for (i = 0; i < imageData.data.length; i += 4){
        imageData.data[i] += 10
        imageData.data[i+1] += 10
        imageData.data[i+2] += 10
    }
    return imageData
}

function setDarkerImageData(imageData){
    for (i = 0; i < imageData.data.length; i += 4){
        imageData.data[i] -= 10
        imageData.data[i+1] -= 10
        imageData.data[i+2] -= 10
    }
    return imageData
}

function setFilter(type){
    var imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)
    var resultImageData
    switch (type){
        case TypeFilter.GRAY: resultImageData = setGrayImageData(imageData); break
        case TypeFilter.NEGATIVE: resultImageData = setNegativeImageData(imageData); break;
        case TypeFilter.BRIGH: resultImageData = setBrighterImageData(imageData); break;
        case TypeFilter.DARK: resultImageData = setDarkerImageData(imageData); break;
    }
    ctx.putImageData(resultImageData, 0, 0, 0, 0, resultImageData.width, resultImageData.height);	
}

function handleFile(files){
    if (files.length > 0){
        var file = files[0]
        var reader = new FileReader()
        reader.readAsDataURL(file)
        var img = new Image()
        ctx = canvasElement.getContext("2d")
        img.onload = function() {
            canvasElement.width = img.width
            canvasElement.height = img.height
            ctx.drawImage(img, 0, 0);
        }
        img.src = URL.createObjectURL(file);       
    } else {
        alert("Выберите файл")
    }
}
