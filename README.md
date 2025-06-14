# Generative AI Design Studio: ComfyUI + LLM for Enhanced Product Design

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
<!-- Assuming you will add an MIT LICENSE file -->

A collaborative Human-AI framework leveraging the power of ComfyUI for modular generative AI workflows and Large Language Models (LLMs) for intuitive prompt engineering and iterative design refinement. This project aims to accelerate concept exploration and visual prototyping in industrial product design.

<p align="center">
  <img src="docs/images/application-interface.jpeg" alt="Generative AI Design Studio Interface" width="700"/>
  <br/><em>Main interface of the Generative AI Design Studio.</em>
</p>

## Overview

The Generative AI Design Studio provides a user-friendly React interface to interact with complex ComfyUI workflows, augmented by an LLM-powered assistant (via a Node.js backend). Designers can:

*   Select from various pre-defined ComfyUI workflows tailored for design tasks such as Text-to-Image, Image Variations, Sketch-to-Image, Inpainting, 3D Generation, and Canvas-based Sketching.
*   Use a `PromptChatbot` to get LLM assistance (Mistral, Llama 3 via Ollama) in generating initial effective prompts.
*   Utilize a `FeedbackChatbot` to refine prompts iteratively based on AI-generated outputs.
*   Upload images, draw sketches on an interactive canvas, and provide masks for inpainting.
*   Generate diverse visual concepts, variations, 2D-to-3D models (GLB), and more, with dynamic control over ComfyUI parameters.

This project focuses on making advanced generative AI more accessible and controllable for designers, fostering a symbiotic relationship between human creativity and AI capabilities.

<p align="center">
  <img src="docs/images/example-result.png" alt="Example Generated Result" width="500"/>
  <br/><em>Example of a design concept generated using the studio.</em>
</p>

## ✨ Features

*   **Modular Workflow System:** Integrates 6 distinct ComfyUI workflows:
    1.  **Génération d'Image (Image Generation):** Creates images from text prompts.
    2.  **Variations d'Image (Image Variations):** Explores alternatives based on an existing image.
    3.  **Esquisse vers Image (Sketch to Image - Upload):** Realizes uploaded sketches using ControlNet.
    4.  **Inpainting (Retouche):** Selectively modifies image regions using masks.
    5.  **Génération 3D (3D Generation):** Generates 3D models (GLB) from 2D reference images.
    6.  **Canvas (Dessin Libre - Canvas Sketch):** Transforms free-form canvas drawings into images using ControlNet.
*   **LLM-Powered Prompt Assistance:**
    *   **PromptChatbot:** Helps generate effective initial prompts from natural language ideas using Ollama-served LLMs.
    *   **FeedbackChatbot:** Translates qualitative design feedback into refined positive/negative prompts for iterative generation.
*   **Interactive Drawing Canvas (`DrawingCanvas.jsx`):** For creating sketches or masks directly within the application, with tools like pen, eraser, brush size, and color picker.
*   **Dynamic Parameter Control (`ComfyUIWrapper.jsx`):** Adjust common ComfyUI settings:
    *   Steps, CFG Scale, Seed
    *   Resolution (Width, Height), Denoise Strength
    *   Sampler Name, Scheduler
    *   ControlNet Strength, Preprocessor Resolution
*   **Model Selection:** Choose from available Checkpoint and ControlNet models detected from your ComfyUI instance.
*   **Image & 3D Model Management:** View generated outputs, download images, and download 3D GLB files.

## 🏗️ System Architecture

The application comprises three main components: a React frontend for user interaction, a Node.js backend serving as an LLM proxy, and a ComfyUI instance for generative AI tasks.

<p align="center">
  <img src="docs/images/system-architecture.png" alt="System Architecture Diagram" width="600"/>
  <br/><em>High-level architecture showing the interaction between Frontend, Backend (LLM Proxy), and ComfyUI.</em>
</p>

## 🛠️ Tech Stack

*   **Frontend:** React (v18+), Tailwind CSS, Lucide Icons, Axios
*   **Backend (LLM Proxy):** Node.js, Express.js, node-fetch, dotenv, cors, body-parser
*   **LLM Engine:** Ollama (running models like Mistral, Llama 3)
*   **Generative AI Engine:** **ComfyUI** (interacted with via its API). ComfyUI allows for building complex image generation pipelines using a node-based interface, as shown below.
    <p align="center">
      <img src="docs/images/comfyui-workflow-example.jpeg" alt="Example ComfyUI Workflow Diagram" width="550"/>
      <br/><em>Example of a node-based workflow in ComfyUI (e.g., a Text-to-Image pipeline).</em>
    </p>
*   **Workflow Definitions:** ComfyUI JSON API format (stored in `frontend/src/workflows/`)

```markdown
## 📁 Project Structure
```text
.
├── backend/                  # Node.js Express server for LLM proxy
│   ├── node_modules/
│   ├── server.js            # Main backend server logic
│   ├── package.json
│   └── package-lock.json
├── frontend/                # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── api/             # API call functions (comfyApi.js)
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Core UI components
│   │   │   ├── workflow-panels/
│   │   │   ├── ComfyUIWrapper.jsx
│   │   │   ├── DrawingCanvas.jsx
│   │   │   ├── FeedbackChatbot.jsx
│   │   │   └── PromptChatbot.jsx
│   │   ├── workflows/       # ComfyUI JSON workflow templates
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── promptContexts.js
│   │   └── reportWebVitals.js
│   ├── node_modules/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── tailwind.config.js
├── workflows/               # Root-level copy of workflow JSONs
│   ├── 3d-Gen.json
│   └── ...
├── .gitignore
└── README.md                # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

*   **Node.js and npm:** (v18.x or later recommended) - [Download Node.js](https://nodejs.org/)
*   **Python:** (v3.9 - v3.11 recommended) - For ComfyUI.
*   **Git:** For cloning the repository.
*   **ComfyUI:**
    *   Follow the official [ComfyUI installation guide](https://github.com/comfyanonymous/ComfyUI#installing).
    *   **Crucially, start ComfyUI with the `--enable-cors-header` argument** (and `--listen` if on a different IP). Example: `python main.py --enable-cors-header`.
    *   Ensure ComfyUI is accessible via its API (default: `http://127.0.0.1:8188`).
    *   **Download necessary models** into your ComfyUI `models` directory. The specific models are defined within the JSON files in `frontend/src/workflows/` and selected in `ComfyUIWrapper.jsx`. Key models include:
        *   **Checkpoints:** `productDesign_eddiemauro20.safetensors`, `SDXL/sd_xl_base_1.0.safetensors`, `Juggernaut_X_RunDiffusion.safetensors`, `dreamshaper_8Inpainting.safetensors`.
        *   **ControlNet:** `diffusion_pytorch_model_promax.safetensors` (used for Canny/Scribble type effects).
        *   **ImageOnlyCheckpointLoader (for 3D):** `model.fp16.safetensors` (Hunyuan3D based).
        *   Appropriate VAEs if not embedded in checkpoints.
    *   **Install Custom Nodes for ComfyUI:** Some workflows might rely on custom nodes. Based on the JSON files, you may need:
        *   Nodes for Hunyuan3D (e.g., `ImageOnlyCheckpointLoader`, `VAEDecodeHunyuan3D`, `EmptyLatentHunyuan3Dv2`, `Hunyuan3Dv2Conditioning`, `ModelSamplingAuraFlow`).
        *   `AIO_Preprocessor` (used in `Canvas-Sketch.json` and `Ready Sketch 2 image .json`).
        *   `FluxResolutionNode` (used in `Canvas-Sketch.json` and `Image_Variations.json`).
        *   `Image Comparer (rgthree)` (used in several workflows).
        *   `easy showAnything` (used in `Canvas-Sketch.json` and `Image_Variations.json`).
        *   `EmptySD3LatentImage` (used in `Canvas-Sketch.json` and `Ready Sketch 2 image .json`).
        *   Any other nodes specific to the classes found in your workflow JSON files.
*   **Ollama:**
    *   Install Ollama from [ollama.com](https://ollama.com/).
    *   Pull the LLMs used by the backend server (`server.js`):
        ```bash
        ollama pull mistral
        ollama pull llama3
        ```
    *   Ensure Ollama is running and accessible (default: `http://127.0.0.1:11434`).

## 🚀 Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Elhassani-Med01/Generative-Ai.git
    cd Generative-Ai
    ```

2.  **Ensure ComfyUI and Ollama are Running:**
    *   Start your ComfyUI instance (e.g., `python path/to/ComfyUI/main.py --enable-cors-header`). Note its URL.
    *   Ensure Ollama application/service is running.

3.  **Setup Backend Server (LLM Proxy):**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory (`backend/.env`):
    ```env
    OLLAMA_URL=http://127.0.0.1:11434
    ```

4.  **Setup Frontend React Application:**
    ```bash
    cd ../frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory by copying `.env.example` or creating it manually (`frontend/.env`):
    ```env
    REACT_APP_COMFYUI_URL=http://127.0.0.1:8188
    REACT_APP_OLLAMA_PROXY_URL=http://localhost:3001/api
    ```

## ⚙️ Configuration

*   **ComfyUI API URL:** Set in `frontend/.env` via `REACT_APP_COMFYUI_URL`.
*   **LLM Proxy Server URL (Backend):** Set in `frontend/.env` via `REACT_APP_OLLAMA_PROXY_URL`.
*   **Ollama Base URL (for Backend Server):** Set in `backend/.env` via `OLLAMA_URL`.
*   **ComfyUI Workflow JSONs:** Located in `frontend/src/workflows/`. Imported by `ComfyUIWrapper.jsx`.
*   **Default Models/Parameters:** Default settings are in `ComfyUIWrapper.jsx` and the workflow JSONs.
*   **LLM Models in Backend:** The LLM models (`mistral`, `llama3`) are hardcoded in `backend/server.js`. Modify there if you wish to use different Ollama models.

## ▶️ Running the Application

You need to have **four** separate processes running concurrently:

1.  **Start ComfyUI:** Navigate to your ComfyUI directory and run it with necessary flags.
    Example: `python main.py --enable-cors-header`
2.  **Start Ollama:** Ensure the Ollama application/service is running.
3.  **Start the Backend Server (LLM Proxy):**
    Open a new terminal, navigate to the `Generative-Ai/backend` directory:
    ```bash
    npm start
    ```
    (Typically starts on `http://localhost:3001`)
4.  **Start the Frontend React Application:**
    Open another new terminal, navigate to the `Generative-Ai/frontend` directory:
    ```bash
    npm start
    ```
    (Typically opens `http://localhost:3000` in your browser)

Access the application via `http://localhost:3000`.

## 🔄 Core Operational Flow (Project Pipeline)

The application facilitates an iterative design process where the designer collaborates with AI tools. The general pipeline is as follows:

<p align="center">
  <img src="docs/images/project-pipeline.jpeg" alt="Project Pipeline Diagram" width="700"/>
  <br/><em>Visual representation of the iterative design cycle: Designer Input -> LLM Prompting -> ComfyUI Generation -> Evaluation & Feedback.</em>
</p>

1.  **Workflow Selection:** Designer chooses a task (e.g., Text-to-Image, Sketch-to-Image).
2.  **Initial Input:** Designer provides text, uploads an image/sketch, or draws on the canvas.
3.  **LLM-Assisted Prompting:** Interaction with `PromptChatbot` to formulate initial ComfyUI prompts.
4.  **Parameter Configuration:** Setting ComfyUI parameters (models, steps, CFG, etc.).
5.  **ComfyUI Execution:** The frontend sends the complete workflow to ComfyUI for generation.
6.  **Result Evaluation:** Designer reviews the generated image(s) or 3D model.
7.  **Iterative Refinement:** If needed, designer uses `FeedbackChatbot` to provide qualitative feedback, which the LLM translates into refined prompts. The process loops back to step 4 or 5.

## 🎨 Workflow Overview (UI Titles)

The application UI provides access to the following workflows:

1.  **Génération d'Image** (driven by `Image-gen.json`)
2.  **Variations d'Image** (driven by `Image_Variations.json`)
3.  **Esquisse vers Image** (driven by `Ready Sketch 2 image .json`)
4.  **Inpainting (Retouche)** (driven by `inpaint_image.json`)
5.  **Génération 3D** (driven by `3d-Gen.json`)
6.  **Canvas (Dessin Libre)** (driven by `Canvas-Sketch.json`)

## 💡 Troubleshooting

*   **CORS Errors:**
    *   **Frontend to ComfyUI:** Ensure ComfyUI is started with `--enable-cors-header`.
    *   **Frontend to Backend:** The `cors` middleware in `backend/server.js` should handle this for `http://localhost:3000`. If deploying, adjust CORS origins.
*   **API Not Reachable (`fetch failed`, `Network Error`):**
    *   Verify ComfyUI, Ollama, and the backend server are running and on the correct ports specified in `.env` files.
    *   Check for firewall issues.
*   **ComfyUI Errors (in browser console or ComfyUI terminal):**
    *   **Model Not Found:** Ensure all required checkpoints, ControlNets, VAEs, etc., are correctly named and placed in your ComfyUI `models` subdirectories.
    *   **Custom Node Missing:** Install any missing custom nodes for ComfyUI. Check the ComfyUI terminal for specific errors like "Node class not found".
    *   **Input Missing:** An image upload might have failed or a required input to a node is not connected/provided.
*   **Ollama Errors (in backend terminal):**
    *   Ensure Ollama is running and you have pulled the `mistral` and `llama3` models.
    *   `OLLAMA_URL` in `backend/.env` should point to the Ollama server base URL (e.g., `http://127.0.0.1:11434`).
*   **Frontend Issues:**
    *   Check browser developer console for React errors.
    *   Ensure `npm install` completed without errors in the `frontend` directory.

## 🚀 Future Enhancements

*   **Dynamic LLM Model Selection:** Allow users to choose which Ollama model to use via the UI.
*   **Advanced Parameter Control:** Expose more ComfyUI node-specific parameters in the UI.
*   **Workflow Editor/Importer:** Allow users to upload or even visually construct ComfyUI workflows within the app.
*   **User Authentication & Project Storage:** Save user sessions, prompts, and generated assets.
*   **Improved Error Display:** More user-friendly error messages from backend/ComfyUI failures.
*   **Multi-Modal LLM Integration:** Allow LLMs to "see" generated images for more contextual feedback.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
