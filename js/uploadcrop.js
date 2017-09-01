var closeDragDrop = document.getElementById("closeDragDrop");
closeDragDrop.addEventListener("click", function () {
    parent.closeDragDropFrame();
});
var $uploadCrop;
//odraditi file upload
var fileselect = document.getElementById("croppiefile");

fileselect.addEventListener("change", FileSelectHandler, false);
fileselect.addEventListener("dragover", FileDragHover, false);
fileselect.addEventListener("dragleave", FileDragHover, false);
fileselect.addEventListener("drop", FileSelectHandler, false);


function FileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function FileSelectHandler(e) {
    FileDragHover(e);
    var file = e.target.files[0] || e.dataTransfer.files[0];
    if (ValidateInputFileExtension(file.type))
        return;

    //prvo prikazati croppie a onaj drugi ugasiti 
    document.getElementById("drop").style.display = 'none';
    let cropcontent = document.getElementById("croppie-content")
    cropcontent.style.display = "block";
    cropcontent.style.opacity = "1";

    croppiePreperImg(file);
}

function ValidateInputFileExtension(extension) {
    if (!(extension == 'image/jpg' || extension == 'image/jpeg' || extension == 'image/png' || extension == 'image/gif')) {
        return true;
    }
    return false;
}


function croppiePreperImg(file) {
    let url = window.URL.createObjectURL(file);
    document.getElementById("croppieImg").setAttribute("src", url);
    croppieFunction();
}

function croppieFunction() {
    $uploadCrop = new Croppie(document.getElementById("croppieImg"), {
        enableExif: true,
        viewport: {
            width: 256,
            height: 256,
            type: 'circle'
        }
    });
}



function imgReadyToSend() {
    $uploadCrop.result('blob').then(function (blob) {
        parent.UploadProfilePicture(blob);
    });
}

function imgPreview() {
    $uploadCrop.result('blob').then(function (blob) {
        let url = window.URL.createObjectURL(blob);
        popupImage(url);
    });
}

function popupImage(img) {
    let content = "<div class='popup'>" +
        "<div class='overlay'></div>" +
        "<div class='imagePopup'>" +
        "<img src='" + img + "'/>" +
        "<button onclick='closeImgPopup();'>OK</button>" +
        "</div>" +
        "</div>";
    document.getElementById("popupContainer").innerHTML = content;
}

function popupSuccessImage(img) {
    let content = "<div class='popup'>" +
        "<div class='overlay'></div>" +
        "<div class='imagePopup'>" +
        "<h2>SUCCESS!</h2>" +
        "<img src='" + img + "'/>" +
        "<button onclick='closeSuccessImage();'>COOL</button>" +
        "</div>" +
        "</div>";
    document.getElementById("popupContainer").innerHTML = content;
}

function closeImgPopup() {
    document.getElementById("popupContainer").innerHTML = "";
}

function closeSuccessImage() {
    closeImgPopup();
    parent.closeDragDropFrame();
}

function addLoader() {
    let loader = document.getElementById("loader")
    loader.innerHTML = "<img src='images/app/Spinner.svg'>";
    loader.style.pointerEvents = 'auto';
}

function removeLoader() {
    let loader = document.getElementById("loader")
    loader.innerHTML = "";
    loader.style.pointerEvents = 'none';
}

function uploadCropSuccess() {
    removeLoader();
    $uploadCrop.result('blob').then(function (blob) {
        let url = window.URL.createObjectURL(blob);
        popupSuccessImage(url);
        parent.ReplaceProfilePictureWithUploadedOne(url);
    });
}