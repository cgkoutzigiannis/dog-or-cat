var i = 0
images = ["dog.jpg", "cat3.jpg", "dog2.jpg", "cat.jpg", "cat2.jpg"]

changeImage();
setInterval(changeImage, 9000);

function changeImage() {
    animalImgBg = document.querySelector(".animal-photos-bg");
    animalImgBg.style.backgroundImage = "url(../../static/resources/" + images[++i%images.length] + ")";
}