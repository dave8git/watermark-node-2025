const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
    try {
        const image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const textData = {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }
        image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);
    } catch(error) {
        console.log('Something went terribly wrong... Try again if you dare!');
    }
}

//addTextWatermarkToImage('./test.jpg', './test-with-watermark.jpg', 'Hello world');

const addImageWatermarkToImage = async function (inputFile, outputFile, watermarkFile) {
    try {
        const image = await Jimp.read(inputFile);
        const watermark = await Jimp.read(watermarkFile);
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;
    
        image.composite(watermark, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5,
        });
        await image.quality(100).writeAsync(outputFile);
    } catch(error) {
        console.log('Something went terribly wrong... Try again if you dare!');
    }
   
};

const makeImageBrighter = async function (inputFile, outputFile, brightnessLevel) {
    try {
        const image = await Jimp.read(inputFile);
        image.brightness(brightnessLevel);
        await image.quality(100).writeAsync(outputFile);
    } catch(error) {
        console.log('Something went terribly wrong... Try again if you dare!');
    }
}

//addImageWatermarkToImage('./test.jpg', './test-with-watermark2.jpg', './logo.png');

const prepareOutputFilename = function(name) {
    const [filename, ext] = name.split('.');
    return `${filename}-with-watermark.${ext}`;
}

const startApp = async () => {
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type: 'confirm'
    }]);
    // if answer is no, just quit the app
    if (!answer.start) process.exit();

    // ask about input file and watermark type
    const options = await inquirer.prompt([{
        name: 'inputImage',
        type: 'input',
        message: 'What file do you want to mark?',
        default: 'test.jpg',
    }, {
        name: 'watermarkType',
        type: 'list',
        choices: ['Text watermark', 'Image watermark', 'Make Image Brighter'],
    }
    ])
    if(options.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
            name: 'value',
            type: 'input',
            message: 'Type your watermark text:',
        }]);
        options.watermarkText = text.value;
        console.log('options.watermarkImage', options);
        if(fs.existsSync('./img/'+options.inputImage)) {
            addTextWatermarkToImage('./img/' + options.inputImage, prepareOutputFilename(options.inputImage), options.watermarkText);
        } else {
            console.log('Something went wrong... Try again.');
        }
        
    }
    else if (options.watermarkType === 'Image watermark') {
        const image = await inquirer.prompt([{
            name: 'filename',
            type: 'input',
            message: 'Type your watermark name:',
            default: 'logo.png',
        }]);
        options.watermarkImage = image.filename;
        if(fs.existsSync('./img/'+options.inputImage)) {
            addImageWatermarkToImage('./img/' + options.inputImage, prepareOutputFilename(options.watermarkImage), './img/' + options.watermarkImage);
        } else {
            console.log('Something went wrong... Try again.')
        }
    }
    else if (options.watermarkType === 'Make Image Brighter') {
        console.log('Brighter!');
        const image = await inquirer.prompt([{
            name: 'filename',
            type: 'input',
            default: 'logo.png'
        }]);
        options.brighterImage = image.filename;
        if(fs.existsSync('./img/'+options.brighterImage)) {
            makeImageBrighter('./img/' + options.inputImage, prepareOutputFilename(options.brighterImage), 0.2);
        } else {
            console.log('Something went wrong... Try again.');
        }
    }
}

startApp();