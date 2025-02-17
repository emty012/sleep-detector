const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const statusText = document.getElementById('status');
const ctx = canvas.getContext('2d');

let model;

// Load the face detection model
async function loadModel() {
    model = await blazeface.load();
    statusText.innerText = 'Model loaded. Please allow access to your webcam.';
    startWebcam();
}

// Start the webcam
function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            detectSleep();
        })
        .catch(err => {
            statusText.innerText = 'Error accessing webcam: ' + err.message;
        });
}

// Detect sleepiness
async function detectSleep() {
    const predictions = await model.estimateFaces(video, false);

    if (predictions.length > 0) {
        const face = predictions[0];
        const landmarks = face.landmarks;

        // Check if eyes are closed (simple heuristic)
        const leftEye = landmarks[0];
        const rightEye = landmarks[1];
        const eyeDistance = Math.abs(leftEye[1] - rightEye[1]);

        if (eyeDistance < 10) { // Adjust this threshold as needed
            statusText.innerText = 'Sleep detected!';
        } else {
            statusText.innerText = 'Awake';
        }
    } else {
        statusText.innerText = 'No face detected';
    }

    requestAnimationFrame(detectSleep);
}

// Initialize
loadModel();
