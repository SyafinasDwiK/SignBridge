const canvas=document.getElementById("outputCanvas");
const ctx=canvas.getContext("2d");
const video = document.getElementById("webcam");
const startButton = document.getElementById("startCamera");
const statusText = document.getElementById("status");

let camera = null;

startButton.addEventListener("click", async () => {

    if(camera){
        camera.stop();

        camera = null;

        startButton.textContent = "Mulai Kamera";
        statusText.textContent = "Kamera dimatikan.";

        return;
    }

    camera = new Camera(video, {

        onFrame: async () => {

            await hands.send({
                image: video
            });

        },

        width:640,
        height:640

    });

    camera.start();

    startButton.textContent = "Matikan Kamera";
    statusText.textContent = "Kamera aktif.";

});

// =========================
// MediaPipe Hands
// =========================
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

function onResults(results){

    // Samakan ukuran canvas dengan video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar video ke canvas
    ctx.drawImage(
        results.image,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Kosongkan landmark
    window.latestLandmarks = [];

    // Jika ada tangan
    if (results.multiHandLandmarks) {

        const detectedHands = results.multiHandLandmarks.slice(0, 2);

        for (const hand of detectedHands) {

            drawConnectors(ctx, hand, HAND_CONNECTIONS, {
                color: "#FFEAD3",
                lineWidth: 3
            });

            drawLandmarks(ctx, hand, {
                color: "#D25353",
                radius: 4
            });

            for (const lm of hand) {
                window.latestLandmarks.push(lm.x);
                window.latestLandmarks.push(lm.y);
                window.latestLandmarks.push(lm.z);
            }
        }

        // Padding sampai 126 fitur
        while (window.latestLandmarks.length < 126) {
            window.latestLandmarks.push(0);
        }

        // Kirim ke Flask hanya jika ada tangan
        sendPrediction();


    } else {

        // Tidak ada tangan
        document.getElementById("prediction").innerText = "-";
        document.getElementById("confidence").innerText = "0%";

    }
}