// Add play, pause functionality to buttons.

var video1 = document.getElementById("myVideo1");
var btn1 = document.getElementById("myBtn1");

var video2 = document.getElementById("myVideo2");
var btn2 = document.getElementById("myBtn2");

var video3 = document.getElementById("myVideo3");
var btn3 = document.getElementById("myBtn3");

var video4 = document.getElementById("myVideo4");
var btn4 = document.getElementById("myBtn4");

var video5 = document.getElementById("myVideo5");
var btn5 = document.getElementById("myBtn5");


function toggleVideo1() {
    if (video1.paused) {
        video1.play();
        btn1.innerHTML = "Pause";
    } else {
        video1.pause();
        btn1.innerHTML = "Play";
    }
}

function toggleVideo2() {
    if (video2.paused) {
        video2.play();
        btn2.innerHTML = "Pause";
    } else {
        video2.pause();
        btn2.innerHTML = "Play";
    }
}

function toggleVideo3() {
    if (video3.paused) {
        video3.play();
        btn3.innerHTML = "Pause";
    } else {
        video3.pause();
        btn3.innerHTML = "Play";
    }
}

function toggleVideo4() {
    if (video4.paused) {
        video4.play();
        btn4.innerHTML = "Pause";
    } else {
        video4.pause();
        btn4.innerHTML = "Play";
    }
}

function toggleVideo5() {
    if (video5.paused) {
        video5.play();
        btn5.innerHTML = "Pause";
    } else {
        video5.pause();
        btn5.innerHTML = "Play";
    }
}