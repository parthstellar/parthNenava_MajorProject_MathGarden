const BACKGROUND_COLOR = '#000000';
const LINE_COLOR = '#BCFF00';
const LINE_WIDTH = 15;


var currentX = 0;
var currentY = 0;
var previousX = 0;
var previousY = 0;
var canvas;
var context;

function prepareCanvas() {

    console.log('preparing Canvas');
    canvas = document.getElementById('my-canvas');
    context = canvas.getContext('2d');

    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_WIDTH;
    context.lineJoin = 'round'

    var isDrawing = false;


    document.addEventListener('mousedown', function (event) {

        isDrawing = true;
        currentX = event.clientX - canvas.offsetLeft;
        currentY = event.clientY - canvas.offsetTop;

    })

    document.addEventListener('mousemove', function (event) {


        if (isDrawing == true) {
            previousX = currentX;
            previousY = currentY;
            currentX = event.clientX - canvas.offsetLeft;
            currentY = event.clientY - canvas.offsetTop;

            draw();

        }

    })

    document.addEventListener('mouseup', function (event) {

        isDrawing = false;
    })

    canvas.addEventListener('mouseleave', function (event) {

        isDrawing = false;

    })

    // Touch Events
    canvas.addEventListener('touchstart', function (event) {

        isDrawing = true;
        currentX = event.touches[0].clientX - canvas.offsetLeft;
        currentY = event.touches[0].clientY - canvas.offsetTop;

    });

    canvas.addEventListener('touchmove', function (event) {


        if (isDrawing == true) {
            previousX = currentX;
            previousY = currentY;
            currentX = event.touches[0].clientX - canvas.offsetLeft;
            currentY = event.touches[0].clientY - canvas.offsetTop;

            draw();

        }

    });

    canvas.addEventListener('touchend', function (event) {

        isDrawing = false;
    });

    canvas.addEventListener('touchcancel', function (event) {

        isDrawing = false;

    });



}

function draw() {
    context.beginPath();
    context.moveTo(previousX, previousY);
    context.lineTo(currentX, currentY);
    context.closePath();
    context.stroke();
}

function clearCanvas() {

    canvas.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    currentX = 0;
    currentY = 0;
    previousX = 0;
    previousY = 0;
}