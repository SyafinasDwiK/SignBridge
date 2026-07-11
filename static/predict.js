// Menyimpan landmark terbaru
window.latestLandmarks = [];

// Menyimpan hasil prediksi terakhir
let latestPrediction = null;

// Menyimpan waktu prediksi terakhir
let lastPredictionTime = 0;

// Mengirim landmark ke Flask
async function sendPrediction() {

    const now = Date.now();

    // Hanya kirim setiap 200 ms (5x per detik)
    if(now - lastPredictionTime < 200){
        return;
    }

    lastPredictionTime = now;

    try{

        const response = await fetch("/predict",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                landmarks:window.latestLandmarks
            })

        });

        const result = await response.json();

        document.getElementById("prediction").innerText =
        result.prediction;

        document.getElementById("confidence").innerText =
        (result.confidence*100).toFixed(1)+"%";

    }

    catch(error){
        console.error(error);
    }

}