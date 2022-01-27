var model;

// async meaning its running in the background ,and thats why we have to await as we are waiting for our model to get loaded
async function loadModel() {
    model = await tf.loadGraphModel('TFJS/model.json');
}

function predictImage() {

    console.log('Pprocessing...');
    //Reading Image
    let img = cv.imread(canvas);

    //Convertingimage into black and white and 1 color channel
    cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY, 0);

    //Increasing contrast so that pixels above 175 becomes white(255)
    cv.threshold(img, img, 175, 255, cv.THRESH_BINARY);

    //Finding contours or i say boundries of our image
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(img, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    
    //Getting Rectangle boundry with help of contours
    let cnt = contours.get(0);
    let rect = cv.boundingRect(cnt);

    //croping Image with that rectangle calculated above
    img = img.roi(rect);

    //Calculating new size
    var height = img.rows;
    var width = img.cols;

    if (height > width){

        height = 20;
        const scaleFactor = img.rows/height;
        width = Math.round(img.cols / scaleFactor);

    }else{

        width = 20;
        const scaleFactor = img.cols/width;
        height = Math.round(img.rows / scaleFactor);
    }

    //Resizing the cropped image
    let newSize = new cv.Size(width, height);
    cv.resize(img, img, newSize, 0, 0, cv.INTER_AREA);

    const LEFT = Math.ceil(4 + (20 - width)/2);
    const RIGHT = Math.floor(4 + (20 - width)/2);
    const TOP = Math.ceil( 4 + (20 - height)/2);
    const BOTTOM = Math.floor(4 + (20 - height)/2);

    // OR(both are same)
    // const LEFT = Math.ceil( 14 - (width/2))
    // const RIGHT = Math.floor(14 - (width/2))
    // const TOP = Math.ceil(14 - (height/2))
    // const BOTTOM = Math.floor(14 - (height/2))

    //Adding the padding(Using border function of opencv )
    const BLACK = new cv.Scalar(0, 0, 0, 0);   //R,G,B,Alpha(tranparency)
    cv.copyMakeBorder(img, img, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    //Calculating coordinates of Center Of Mass
    cv.findContours(img, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);    
    //Moments are nothing but the weighted avg (first momement of probability density function)
    const Moments = cv.moments(cnt, false);  //false bacause its not a binary image
    const cx = Moments.m10/Moments.m00;      //m00 is mass of image as whole or area
    const cy = Moments.m01/Moments.m00;      //m10 , m01 is the mass along the horizontal and vertical axis

    //Shifting the Centre of MAss to the center
    X_SHIFT = Math.round(img.cols/2.0 - cx);    //its nothing but 14 - cx
    Y_SHIFT = Math.round(img.rows/2.0 - cy);

    newSize = new cv.Size(img.rows, img.cols);
    const M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    cv.warpAffine(img, img, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    //NORMALISING: Getting pixel array and converting it into float value between 1 and 0
    let pixelValues = img.data;
    pixelValues = Float32Array.from(pixelValues);
    pixelValues = pixelValues.map(function myFunction(item) {
        return item / 255.0;
      } )
    console.log('SCALED ARRAY:' + pixelValues);

    //Creating Tensor and Making Predictions
    const X = tf.tensor([pixelValues]);
    console.log('Shape of Tensor:' + X.shape);
    console.log('Datatype of Tesnor' + X.dtype);

    const result = model.predict(X);
    result.print();
    
    // console.log(tf.memory());

    const output = result.dataSync()[0];

    // testing purpose
    // const outputCanvas = document.createElement('CANVAS');
    // cv.imshow(outputCanvas, img);
    // document.body.appendChild(outputCanvas);

    //Cleanup
    contours.delete(),
    img.delete();
    cnt.delete();
    hierarchy.delete();

    //Disposing  Result tensor To Free Up Memory
    X.dispose();
    result.dispose();

    return output;

}