import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image, Wand2, Palette, Box, Sparkles, Settings, Play, Download, Eye, Trash2, RefreshCw, ChevronDown, MessageCircle } from 'lucide-react';

// Import workflow panels
import ImageGeneration from './workflow-panels/ImageGeneration';
import ImageVariations from './workflow-panels/ImageVariations';
import SketchToImage from './workflow-panels/SketchToImage';
import Inpainting from './workflow-panels/Inpainting';
import ThreeDGeneration from './workflow-panels/ThreeDGeneration';
import CanvasSketch from './workflow-panels/CanvasSketch';

// Import Drawing Canvas
import DrawingCanvas from './DrawingCanvas';

// Import workflow JSONs
import {
  readySketch2ImageWorkflow,
  inpaintImageWorkflow,
  imageVariationsWorkflow,
  imageGenWorkflow,
  canvasSketchWorkflow,
  threeDGenWorkflow
} from '../workflows';

// Import API functions
import {
  uploadImageToComfyUI,
  queuePromptInComfyUI,
  getExecutionHistory,
  getComfyUIImageUrl,
  getComfyUIObjectInfo
} from '../api/comfyApi';
import { PROMPT_CONTEXTS } from './workflow-panels/promptContexts';
import FeedbackChatbot from './FeedbackChatbot';

const ComfyUIWrapper = () => {
  const [activeWorkflow, setActiveWorkflow] = useState('image-gen');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null); // For general preview and canvas init
  const [uploadedImageFile, setUploadedImageFile] = useState(null); // For direct file uploads not needing canvas processing
  const [generatedImages, setGeneratedImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  // General Generation Settings
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(7);
  const [seed, setSeed] = useState(-1);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [samplerName, setSamplerName] = useState('euler');
  const [scheduler, setScheduler] = useState('normal');

  // Advanced Parameters
  const [denoiseStrength, setDenoiseStrength] = useState(1.0);
  // const [clipSkip, setClipSkip] = useState(-1); // Conceptual
  // const [selectedVaeName, setSelectedVaeName] = useState(''); // Conceptual

  // ControlNet Specific Settings
  const [controlNetStrength, setControlNetStrength] = useState(0.9);

  // Preprocessor Specific Settings
  const [preprocessorResolution, setPreprocessorResolution] = useState(1024);


  // Canvas Specifics
  const [drawnSketchDataUrl, setDrawnSketchDataUrl] = useState(null); // For 'canvas-sketch' output
  const [originalImageForInpaintDataUrl, setOriginalImageForInpaintDataUrl] = useState(null); // For 'inpaint' original image
  const [drawnMaskForInpaintDataUrl, setDrawnMaskForInpaintDataUrl] = useState(null); // For 'inpaint' drawn mask

  // Model Selection
  const [availableModels, setAvailableModels] = useState({
    checkpoints: [],
    controlnets: [],
    vaes: [], // Added for VAE selection
  });
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('');
  const [selectedControlNet, setSelectedControlNet] = useState('');

  const fileInputRef = useRef(null);

  const workflows = [
    { id: 'image-gen', name: 'Génération d\'Image', icon: Image, color: 'bg-blue-500' },
    { id: 'image-variations', name: 'Variations d\'Image', icon: RefreshCw, color: 'bg-green-500' },
    { id: 'sketch-to-image', name: 'Esquisse vers Image', icon: Palette, color: 'bg-purple-500' },
    { id: 'inpaint', name: 'Inpainting (Retouche)', icon: Wand2, color: 'bg-orange-500' },
    { id: '3d-gen', name: 'Génération 3D', icon: Box, color: 'bg-red-500' },
    { id: 'canvas-sketch', name: 'Canvas (Dessin Libre)', icon: Sparkles, color: 'bg-pink-500' }
  ];

  const defaultSamplers = [
    'euler', 'euler_ancestral', 'heun', 'dpm_2', 'dpm_2_ancestral', 'lms', 'dpmpp_2s_a',
    'dpmpp_sde', 'dpmpp_sde_gpu', 'dpmpp_2m', 'dpmpp_2m_sde', 'dpmpp_2m_sde_gpu',
    'dpmpp_3m_sde', 'dpmpp_3m_sde_gpu', 'ddim', 'uni_pc', 'uni_pc_bh2'
  ];
  const defaultSchedulers = [
    'normal', 'karras', 'exponential', 'sgm_uniform', 'simple', 'ddim_uniform'
  ];

  useEffect(() => {
    const fetchModelsAndInfo = async () => {
      const info = await getComfyUIObjectInfo();
      if (info) {
        const ckptLoaderInfo = info['CheckpointLoaderSimple'] || info['ImageOnlyCheckpointLoader'];
        if (ckptLoaderInfo?.input.required.ckpt_name) {
          setAvailableModels(prev => ({ ...prev, checkpoints: ckptLoaderInfo.input.required.ckpt_name[0] }));
          if (ckptLoaderInfo.input.required.ckpt_name[0].length > 0) {
            setSelectedCheckpoint(ckptLoaderInfo.input.required.ckpt_name[0][0]);
          }
        }
        const cnLoaderInfo = info['ControlNetLoader'];
        if (cnLoaderInfo?.input.required.control_net_name) {
          setAvailableModels(prev => ({ ...prev, controlnets: cnLoaderInfo.input.required.control_net_name[0] }));
          if (cnLoaderInfo.input.required.control_net_name[0].length > 0) {
            setSelectedControlNet(cnLoaderInfo.input.required.control_net_name[0][0]);
          }
        }
        const vaeLoaderInfo = info['VAELoader'];
        if (vaeLoaderInfo?.input?.required?.vae_name) {
          // Fix the syntax error in the spread operation
          setAvailableModels(prev => ({
            ...prev,
            vae: vaeLoaderInfo.input.required.vae_name[0]
          }));
        }
      }
    };
    fetchModelsAndInfo();
  }, []);

  useEffect(() => {
    setUploadedImagePreview(null);
    setUploadedImageFile(null);
    setDrawnSketchDataUrl(null);
    setOriginalImageForInpaintDataUrl(null);
    setDrawnMaskForInpaintDataUrl(null);
    setPrompt('');
    setNegativePrompt('');
    if (activeWorkflow === 'image-gen' || activeWorkflow === 'inpaint') { setWidth(512); setHeight(512); }
    else if (['sketch-to-image', 'canvas-sketch', 'image-variations'].includes(activeWorkflow)) { setWidth(1024); setHeight(1024); }
    else if (activeWorkflow === '3d-gen') { setWidth(1024); setHeight(1024); } // Adjusted default for 3D from 3072
  }, [activeWorkflow]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setUploadedImagePreview(dataUrl); // Used by canvas as initialImage or general preview
        if (activeWorkflow === 'inpaint') {
            setOriginalImageForInpaintDataUrl(dataUrl); // Store the original for inpainting
            setDrawnMaskForInpaintDataUrl(null); // Clear any previously drawn mask
        } else if (!['canvas-sketch'].includes(activeWorkflow)) {
            // For workflows like sketch-to-image or image-variations that take a direct upload
            setUploadedImageFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrawingComplete = (data) => { // data is an object: { sketch: '...' } or { original: '...', mask: '...' }
    if (activeWorkflow === 'inpaint') {
      if (data && data.original && data.mask) {
        setOriginalImageForInpaintDataUrl(data.original); // This is the base image, might be same as uploadedImagePreview
        setDrawnMaskForInpaintDataUrl(data.mask);         // This is the B&W mask
        console.log("Inpaint: Original and Mask DataURLs captured from canvas.");
      } else {
        console.error("Inpaint drawing data malformed:", data);
      }
    } else if (activeWorkflow === 'canvas-sketch') {
      if (data && data.sketch) {
        setDrawnSketchDataUrl(data.sketch); // This is the user's free-form sketch
        console.log("Canvas Sketch: Sketch DataURL captured.");
      } else {
        console.error("Canvas sketch drawing data malformed:", data);
      }
    }
  };

  const dataURLtoFile = async (dataurl, filename) => {
    if (!dataurl) throw new Error("dataURLtoFile: dataurl is null or undefined");
    const res = await fetch(dataurl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
  };

  const [showFeedback, setShowFeedback] = useState(false);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState('');

  const handleGenerate = async () => {
    setIsProcessing(true);
    setGeneratedImages([]);
    let workflowJson = {};
    let uploadSubdir = 'input';

    try {
      setLastGeneratedPrompt(prompt); // Save the prompt before generation
      switch (activeWorkflow) {
        case 'image-gen': workflowJson = JSON.parse(JSON.stringify(imageGenWorkflow)); break;
        case 'image-variations': workflowJson = JSON.parse(JSON.stringify(imageVariationsWorkflow)); break;
        case 'sketch-to-image': workflowJson = JSON.parse(JSON.stringify(readySketch2ImageWorkflow)); break;
        case 'inpaint': workflowJson = JSON.parse(JSON.stringify(inpaintImageWorkflow)); break;
        case '3d-gen': workflowJson = JSON.parse(JSON.stringify(threeDGenWorkflow)); break;
        case 'canvas-sketch': workflowJson = JSON.parse(JSON.stringify(canvasSketchWorkflow)); break;
        default: throw new Error('Unknown workflow selected');
      }

      // Image handling logic
      if (activeWorkflow === 'inpaint') {
        if (!originalImageForInpaintDataUrl || !drawnMaskForInpaintDataUrl) {
          throw new Error("Pour l'inpainting, veuillez télécharger une image ET dessiner un masque.");
        }
        const originalFile = await dataURLtoFile(originalImageForInpaintDataUrl, `inpaint_original_${Date.now()}.png`);
        const uploadedOriginalName = await uploadImageToComfyUI(originalFile, uploadSubdir);
        workflowJson["20"].inputs.image = uploadedOriginalName;
        console.log("Uploaded original image for inpaint:", uploadedOriginalName);

        const maskFile = await dataURLtoFile(drawnMaskForInpaintDataUrl, `inpaint_mask_${Date.now()}.png`);
        const uploadedMaskName = await uploadImageToComfyUI(maskFile, uploadSubdir);
        workflowJson["25"].inputs.image = uploadedMaskName;
        console.log("Uploaded mask image for inpaint:", uploadedMaskName);

      } else if (activeWorkflow === 'canvas-sketch') {
        if (!drawnSketchDataUrl) {
          throw new Error("Pour le Canvas (Dessin Libre), veuillez dessiner une esquisse.");
        }
        const sketchFile = await dataURLtoFile(drawnSketchDataUrl, `canvas_sketch_${Date.now()}.png`);
        const uploadedSketchName = await uploadImageToComfyUI(sketchFile, uploadSubdir);
        workflowJson["178"].inputs.image = uploadedSketchName;
        console.log("Uploaded canvas sketch:", uploadedSketchName);

      } else { // For 'image-variations', 'sketch-to-image' (direct upload), '3d-gen'
        const requiresDirectUpload = ['image-variations', 'sketch-to-image', '3d-gen'].includes(activeWorkflow);
        if (requiresDirectUpload) {
          if (!uploadedImageFile) { // This comes from the <input type="file">
            throw new Error(`Veuillez télécharger une image pour le workflow "${workflows.find(w => w.id === activeWorkflow).name}".`);
          }
          const uploadedComfyFileName = await uploadImageToComfyUI(uploadedImageFile, uploadSubdir);
          console.log(`Uploaded input image to ComfyUI: ${uploadedComfyFileName}`);
          if (activeWorkflow === 'image-variations') workflowJson["3"].inputs.image = uploadedComfyFileName;
          else if (activeWorkflow === 'sketch-to-image') workflowJson["8"].inputs.image = uploadedComfyFileName;
          else if (activeWorkflow === '3d-gen') workflowJson["56"].inputs.image = uploadedComfyFileName;
        }
      }

      // Inject prompts and settings
      const currentSeed = seed === -1 ? Math.floor(Math.random() * 1000000000000000) : seed; // Max seed value for ComfyUI
      const workflowNodeMap = {
        'image-gen': { sampler: "3", checkpoint: "10", positive: "6", negative: "7", widthNode: "5", heightNode: "5" },
        'image-variations': { sampler: "8", checkpoint: "15", positive: "1", negative: "16", widthNode: "5", heightNode: "5" }, // Node 5 is ImageResize
        'sketch-to-image': { sampler: "15", checkpoint: "10", positive: "5", negative: "9", widthNode: "6", heightNode: "6", controlNetApply: "13", preprocessor: "19" },
        'inpaint': { sampler: "3", checkpoint: "29", positive: "6", negative: "7" }, // Width/height derived from input image for inpaint
        '3d-gen': { sampler: "3", checkpoint: "54", widthNode: "66", heightNode: "66" }, // Node 66 is EmptyLatentHunyuan3Dv2
        'canvas-sketch': { sampler: "158", checkpoint: "177", positive: "159", negative: "160", widthNode: "179", heightNode: "179", controlNetApply: "167", preprocessor: "165" }
      };
      const map = workflowNodeMap[activeWorkflow];

      if (map.sampler) {
        workflowJson[map.sampler].inputs.seed = currentSeed;
        workflowJson[map.sampler].inputs.steps = steps;
        workflowJson[map.sampler].inputs.cfg = cfg;
        workflowJson[map.sampler].inputs.sampler_name = samplerName;
        workflowJson[map.sampler].inputs.scheduler = scheduler;
        if (workflowJson[map.sampler].inputs.hasOwnProperty('denoise')) {
            workflowJson[map.sampler].inputs.denoise = denoiseStrength;
        }
      }
      if (map.positive) workflowJson[map.positive].inputs.text = prompt;
      if (map.negative) workflowJson[map.negative].inputs.text = negativePrompt || "text, watermark, blurry, low quality, bad anatomy";
      if (map.checkpoint && selectedCheckpoint) {
        workflowJson[map.checkpoint].inputs.ckpt_name = selectedCheckpoint;
      }
      if (map.widthNode && map.heightNode && activeWorkflow !== 'inpaint') {
        if (activeWorkflow === '3d-gen') workflowJson[map.widthNode].inputs.resolution = width; // Node 66 has 'resolution'
        else if (activeWorkflow === 'image-variations') { // Node 5 ImageResize
            workflowJson[map.widthNode].inputs.resize_width = width;
            workflowJson[map.heightNode].inputs.resize_height = height;
        } else { // Standard EmptyLatentImage or EmptySD3LatentImage
            workflowJson[map.widthNode].inputs.width = width;
            workflowJson[map.heightNode].inputs.height = height;
        }
      }
      if (map.controlNetApply) {
        workflowJson[map.controlNetApply].inputs.strength = controlNetStrength;
        if (selectedControlNet) {
            if (activeWorkflow === 'sketch-to-image' && workflowJson["11"]) workflowJson["11"].inputs.control_net_name = selectedControlNet;
            else if (activeWorkflow === 'canvas-sketch' && workflowJson["168"]) workflowJson["168"].inputs.control_net_name = selectedControlNet;
        }
      }
      if (map.preprocessor) { // For AIO_Preprocessor nodes
        workflowJson[map.preprocessor].inputs.resolution = preprocessorResolution;
      }

      // Queue and poll
      const promptId = await queuePromptInComfyUI(workflowJson);
      console.log('Prompt queued with ID:', promptId);
      let history;
      let attempts = 0;
      const maxAttempts = 120;
      const pollInterval = 2000;
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        const currentHistory = await getExecutionHistory(promptId);
        console.log(`Poll attempt ${attempts + 1} for prompt ID ${promptId}:`, currentHistory);
        if (currentHistory && currentHistory.status && currentHistory.status.completed === true) {
          history = currentHistory;
          console.log("ComfyUI Job History (successful poll, job completed):", history);
          break;
        }
        attempts++;
      }
      if (!history || !history.status || history.status.completed !== true) {
        console.error('Final history state after polling attempts:', history);
        throw new Error('Le job ComfyUI ne s\'est pas terminé correctement. Vérifiez la console ComfyUI.');
      }

      // Extract outputs
      const outputs = history.outputs;
      const newGeneratedOutputs = [];
      let outputNodeId = null;
      let is3DOutput = false;
      switch (activeWorkflow) {
          case 'image-gen': outputNodeId = "9"; break;
          case 'image-variations': outputNodeId = "11"; break;
          case 'sketch-to-image': outputNodeId = "16"; break;
          case 'inpaint': outputNodeId = "9"; break;
          case '3d-gen': outputNodeId = "67"; is3DOutput = true; break;
          case 'canvas-sketch': outputNodeId = "162"; break;
      }
      console.log("Checking outputs for node:", outputNodeId, "Outputs object for node:", outputs?.[outputNodeId]);

      if (outputNodeId && outputs && outputs[outputNodeId]) {
          if (is3DOutput && outputs[outputNodeId].filename) {
              const glbUrl = getComfyUIImageUrl(outputs[outputNodeId].filename, 'output', 'output');
              newGeneratedOutputs.push({ id: Date.now(), url: glbUrl, workflow: activeWorkflow, prompt: prompt, is3D: true, filename: outputs[outputNodeId].filename });
          } else if (outputs[outputNodeId].images) {
              outputs[outputNodeId].images.forEach(img => {
                  const imageUrl = getComfyUIImageUrl(img.filename, img.subfolder || '', img.type);
                  console.log("Constructed Image URL:", imageUrl);
                  newGeneratedOutputs.push({ id: `${img.filename}-${Date.now()}`, url: imageUrl, workflow: activeWorkflow, prompt: prompt });
              });
          } else {
             console.warn(`Output node ${outputNodeId} did not contain expected 'filename' (for 3D) or 'images' key. Actual output:`, outputs[outputNodeId]);
          }
      } else {
        console.warn(`Output node ID ${outputNodeId} not found in history outputs or history.outputs is undefined. Full history:`, history);
      }
      if (newGeneratedOutputs.length === 0 && history?.status?.completed === true) { // only alert if job actually completed
        alert('Génération terminée, mais aucune sortie n\'a été affichée. Vérifiez les logs de ComfyUI.');
      }
      setGeneratedImages(newGeneratedOutputs);
      setShowFeedback(true); // Show feedback after successful generation

    } catch (error) {
      console.error('Generation failed:', error);
      alert(`Échec de la génération: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (id) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const downloadImage = (url, is3D = false, filename = null) => {
    const link = document.createElement('a');
    link.href = url;
    if (is3D && filename) link.download = filename;
    else {
      const urlParts = url.split('/');
      const defaultFilename = urlParts[urlParts.length - 1].split('?')[0];
      link.download = defaultFilename || `comfyui-output-${Date.now()}.png`;
    }
    link.click();
  };

  const getWorkflowComponent = () => {
    const commonProps = {
      prompt, setPrompt, negativePrompt, setNegativePrompt,
      uploadedImage: uploadedImagePreview, handleImageUpload, fileInputRef,
      drawingCanvas: DrawingCanvas,
      onDrawingComplete: handleDrawingComplete,
      initialImage: uploadedImagePreview, // Used by DrawingCanvas to show base image
      width, height, showFeedback, setShowFeedback
    };
    switch (activeWorkflow) {
      case 'image-gen': return <ImageGeneration {...commonProps} />;
      case 'image-variations': return <ImageVariations {...commonProps} />;
      case 'sketch-to-image': return <SketchToImage {...commonProps} />;
      case 'inpaint': return <Inpainting {...commonProps} />;
      case '3d-gen': return <ThreeDGeneration {...commonProps} />;
      case 'canvas-sketch': return <CanvasSketch {...commonProps} />;
      default: return <ImageGeneration {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-gray-200">
      <div className="container mx-auto px-2 sm:px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ComfyUI Studio
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">Workflows de Génération d'Images IA Professionnels</p>
        </div>

        {/* Workflow Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 mb-8">
          {workflows.map((workflow) => {
            const IconComponent = workflow.icon;
            return (
              <button
                key={workflow.id}
                onClick={() => setActiveWorkflow(workflow.id)}
                className={`p-3 sm:p-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  activeWorkflow === workflow.id
                    ? `${workflow.color} shadow-lg shadow-purple-500/25 text-white`
                    : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm font-medium text-center">{workflow.name}</p>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-purple-400" />
                Contrôles
              </h3>
              {getWorkflowComponent()}
              
              <details className="mt-6 bg-gray-700/30 rounded-xl overflow-hidden group">
                <summary className="flex justify-between items-center px-4 py-3 cursor-pointer text-white font-semibold text-lg hover:bg-gray-700/50 transition-colors">
                  Paramètres Avancés
                  <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-4 space-y-4 border-t border-gray-700/50">
                  {/* Resolution - exclude for inpaint if its size is derived */}
                  {activeWorkflow !== 'inpaint' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Résolution: {width}x{height}</label>
                      <div className="flex space-x-2 sm:space-x-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-400 mb-1">Largeur</label>
                          <input
                            type="range" min="256" max={activeWorkflow === '3d-gen' ? "2048" : "2048"} step="64" value={width} // Adjusted 3D max
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <input
                            type="number" min="256" max={activeWorkflow === '3d-gen' ? "2048" : "2048"} step="64" value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-400 mb-1">Hauteur</label>
                          <input
                            type="range" min="256" max={activeWorkflow === '3d-gen' ? "2048" : "2048"} step="64" value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <input
                            type="number" min="256" max={activeWorkflow === '3d-gen' ? "2048" : "2048"} step="64" value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Modèle Checkpoint</label>
                    <select value={selectedCheckpoint} onChange={(e) => setSelectedCheckpoint(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
                      {availableModels.checkpoints.length > 0 ? availableModels.checkpoints.map(model => (<option key={model} value={model}>{model}</option>)) : <option disabled>Chargement...</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sampler</label>
                    <select value={samplerName} onChange={(e) => setSamplerName(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
                      {defaultSamplers.map(sampler => (<option key={sampler} value={sampler}>{sampler}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Scheduler</label>
                    <select value={scheduler} onChange={(e) => setScheduler(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
                      {defaultSchedulers.map(sch => (<option key={sch} value={sch}>{sch}</option>))}
                    </select>
                  </div>
                   {(activeWorkflow === 'image-variations' || activeWorkflow === 'inpaint') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Force Denoise: {denoiseStrength.toFixed(2)}</label>
                        <input
                        type="range" min="0.01" max="1" step="0.01" value={denoiseStrength}
                        onChange={(e) => setDenoiseStrength(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>
                   )}
                  {(activeWorkflow === 'sketch-to-image' || activeWorkflow === 'canvas-sketch') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Modèle ControlNet</label>
                        <select value={selectedControlNet} onChange={(e) => setSelectedControlNet(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none">
                          {availableModels.controlnets.length > 0 ? availableModels.controlnets.map(model => (<option key={model} value={model}>{model}</option>)) : <option disabled>Chargement...</option>}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Force ControlNet: {controlNetStrength.toFixed(2)}</label>
                        <input type="range" min="0" max="1" step="0.05" value={controlNetStrength} onChange={(e) => setControlNetStrength(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Résolution Préprocesseur: {preprocessorResolution}</label>
                        <input type="number" min="256" max="2048" step="64" value={preprocessorResolution} onChange={(e) => setPreprocessorResolution(Number(e.target.value))} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"/>
                      </div>
                    </>
                  )}
                   <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Steps: {steps}</label>
                      <input type="range" min="1" max="150" value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Échelle CFG: {cfg}</label>
                      <input type="range" min="1" max="30" step="0.5" value={cfg} onChange={(e) => setCfg(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Seed</label>
                      <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} placeholder="Aléatoire (-1)" className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"/>
                    </div>
                </div>
              </details>
              <button onClick={handleGenerate} disabled={isProcessing} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center">
                {isProcessing ? (<><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Traitement...</>) : (<><Play className="w-5 h-5 mr-2" />Générer</>)}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50 min-h-[400px]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-green-400" />
                Images Générées ({generatedImages.length})
              </h3>
              {isProcessing && generatedImages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 animate-pulse">
                  <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 animate-spin text-purple-400" />
                  <p className="text-md sm:text-lg">Génération en cours, veuillez patienter...</p>
                  <p className="text-xs sm:text-sm">Cela peut prendre quelques instants.</p>
                </div>
              ) : generatedImages.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-md sm:text-lg text-gray-400">Aucune image générée pour l'instant</p>
                  <p className="text-xs sm:text-sm text-gray-500">Configurez et cliquez sur "Générer"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300">
                        {image.is3D ? (
                            <div className="w-full h-48 sm:h-64 flex flex-col items-center justify-center bg-gray-900 rounded-lg mb-4 text-gray-400 p-4">
                                <Box className="w-12 h-12 sm:w-16 sm:h-16 mr-2" />
                                <span>Modèle 3D Généré</span>
                                <a href={image.url} download={image.filename} className="mt-2 text-blue-400 hover:text-blue-200 underline text-sm">Télécharger .glb</a>
                            </div>
                        ) : (
                            <img
                            src={image.url}
                            alt="Generated"
                            className="w-full h-48 sm:h-64 object-contain rounded-lg mb-4 bg-gray-900" // Added bg for images with transparency
                            onError={(e) => {
                                console.error("Error loading image from URL:", e.target.src, e);
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/256/333333/FFFFFF?text=Erreur+Chargement";
                            }}
                            />
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-gray-300 truncate">{image.prompt || 'Pas de prompt'}</p>
                            <p className="text-xs text-gray-500 capitalize">{image.workflow.replace('-', ' ')}</p>
                          </div>
                          <div className="flex space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                            <button onClick={() => downloadImage(image.url, image.is3D, image.filename)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button onClick={() => removeImage(image.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section - Shown after image generation */}
        {generatedImages.length > 0 && showFeedback && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-yellow-400" />
              Feedback
            </h3>
            <FeedbackChatbot
              lastPrompt={lastGeneratedPrompt}
              context={PROMPT_CONTEXTS[activeWorkflow].feedback}
              onRefined={(positive, negative) => {
                setPrompt(positive);
                setNegativePrompt(negative);
                setShowFeedback(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComfyUIWrapper;