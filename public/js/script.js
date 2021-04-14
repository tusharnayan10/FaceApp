const video = document.getElementById('video');
const snap = document.getElementById('snap');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('./dist/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./dist/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./dist/models') //heavier/accurate version of tiny face detector
]).then(startVideo)

function startVideo() {
    document.body.append('Load Data - ')
    // Open Camera
    navigator.getUserMedia(
        { video:{} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    // video.src = '../videos/speech.mp4'
    recognizeFaces()
    console.log('Opening Camera')
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    // console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)

    snap.addEventListener("click", async () => {
        console.log('Playing')
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = { width: video.width, height: video.height, }
        faceapi.matchDimensions(canvas, displaySize)

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            console.log("Canvas");

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            results.forEach( (result, i) => {
                console.log("Box");
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                console.log("Result = " +result.toString());
                drawBox.draw(canvas)
                console.log("Done")
            });
        }, 200)
    })

}


function loadLabeledImages() {
    // const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
    const labels = ['Tushar Nayan', 'Abdul Baist', 'Nikunj Baid'] // for WebCam
    return Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            for(let i=1; i<=2; i++) {
                const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                // console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            }
            document.body.append(label+' Faces | ')
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}