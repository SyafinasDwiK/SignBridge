from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os
import google.generativeai as genai

from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

chat_model = genai.GenerativeModel(
    model_name="gemini-3.1-flash-lite",
    system_instruction="""
Kamu adalah AI Assistant SignBridge.

Jawablah menggunakan Bahasa Indonesia yang ramah, jelas, dan mudah dipahami.

Aturan:

- Jangan gunakan Markdown.
- Jangan gunakan ** atau ##.
- Jangan gunakan tabel.
- Maksimal 150 kata.
- Gunakan bahasa sederhana.
- Gunakan emoji seperlunya.
- Jawaban harus terlihat seperti percakapan chat.

Fokus membantu pengguna mengenai:
- Bahasa Isyarat Indonesia (BISINDO)
- Cara menggunakan SignBridge
- Fitur deteksi bahasa isyarat
- Artificial Intelligence pada SignBridge
- Edukasi mengenai komunitas Tuli

Jika pengguna bertanya di luar topik tersebut,
jawablah dengan sopan bahwa kamu adalah AI Assistant SignBridge
dan fokus membantu mengenai BISINDO serta penggunaan aplikasi.

Berikan jawaban yang ringkas namun informatif.
"""
)

model = joblib.load("model/bisindo_model_4.pkl")

@app.route("/")
def home():
    return "SignBridge berjalan!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    landmarks = data["landmarks"]

    x = np.array(landmarks).reshape(1, -1)

    probabilities = model.predict_proba(x)[0]

    prediction = model.classes_[np.argmax(probabilities)]

    confidence = float(np.max(probabilities))

    return jsonify({
        "prediction": prediction,
        "confidence": confidence
    })

@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        question = data["message"]

        response = chat_model.generate_content(question)

        return jsonify({
            "answer": response.text
        })

    except Exception as e:

        return jsonify({
            "answer": f"Terjadi kesalahan: {str(e)}"
        })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
