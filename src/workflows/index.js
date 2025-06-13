// src/workflows/index.js

// Note: I've updated width/height in EmptyLatentImage/EmptySD3LatentImage
// to be directly configurable, simplifying removal of FluxResolutionNode links for now.
// For KSampler, seed, steps, cfg will be dynamic.
// Prompt and Negative Prompt will be dynamic.
// Image paths (for LoadImage) will be dynamic.
// Sampler name and scheduler will be dynamic.
// ControlNet strength will be dynamic where applicable.

export const readySketch2ImageWorkflow = {
  "1": { "inputs": { "images": ["19", 0] }, "class_type": "PreviewImage", "_meta": { "title": "Preview Image from Preprocessor" } },
  "5": { "inputs": { "text": "", "clip": ["10", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "6": { "inputs": { "width": 1024, "height": 1024, "batch_size": 1 }, "class_type": "EmptySD3LatentImage", "_meta": { "title": "EmptySD3LatentImage" } },
  "7": { "inputs": { "text": "1024 x 1024", "anything": ["21", 2] }, "class_type": "easy showAnything", "_meta": { "title": "Preview Resolution" } },
  "8": { "inputs": { "image": "" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "9": { "inputs": { "text": "ugly", "clip": ["10", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "10": { "inputs": { "ckpt_name": "Juggernaut_X_RunDiffusion.safetensors" }, "class_type": "CheckpointLoaderSimple", "_meta": { "title": "Load Checkpoint" } },
  "11": { "inputs": { "control_net_name": "diffusion_pytorch_model_promax.safetensors" }, "class_type": "ControlNetLoader", "_meta": { "title": "Load ControlNet Model" } },
  "13": { "inputs": { "strength": 0.9, "start_percent": 0, "end_percent": 0.8, "positive": ["5", 0], "negative": ["9", 0], "control_net": ["11", 0], "image": ["19", 0], "vae": ["10", 2] }, "class_type": "ControlNetApplyAdvanced", "_meta": { "title": "Apply ControlNet" } },
  "15": { "inputs": { "seed": 0, "steps": 30, "cfg": 7, "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": 1, "model": ["10", 0], "positive": ["13", 0], "negative": ["13", 1], "latent_image": ["6", 0] }, "class_type": "KSampler", "_meta": { "title": "KSampler" } },
  "16": { "inputs": { "filename_prefix": "Img", "images": ["17", 0] }, "class_type": "SaveImage", "_meta": { "title": "Save Final Image" } },
  "17": { "inputs": { "samples": ["15", 0], "vae": ["10", 2] }, "class_type": "VAEDecode", "_meta": { "title": "VAE Decode" } },
  "18": { "inputs": { "rgthree_comparer": { "images": [{ "name": "A", "selected": true, "url": "/api/view?filename=rgthree.compare._temp_fckdk_00011_.png&type=temp&subfolder=&rand=0.6309255808750684" }, { "name": "B", "selected": true, "url": "/api/view?filename=rgthree.compare._temp_fckdk_00012_.png&type=temp&subfolder=&rand=0.9802034688525154" }] }, "image_a": ["8", 0], "image_b": ["17", 0] }, "class_type": "Image Comparer (rgthree)", "_meta": { "title": "Image Comparer (rgthree)" } },
  "19": { "inputs": { "preprocessor": "CannyEdgePreprocessor", "resolution": 1024, "image": ["8", 0] }, "class_type": "AIO_Preprocessor", "_meta": { "title": "AIO Aux Preprocessor" } },
  "21": { "inputs": { "megapixel": "1.0", "aspect_ratio": "1:1 (Perfect Square)", "divisible_by": false, "custom_ratio": "1:1", "custom_aspect_ratio": "1:1" }, "class_type": "FluxResolutionNode", "_meta": { "title": "SDXL Resolution Calculator" } }
};

export const inpaintImageWorkflow = {
  "3": { "inputs": { "seed": 0, "steps": 20, "cfg": 8, "sampler_name": "uni_pc_bh2", "scheduler": "normal", "denoise": 1, "model": ["29", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["26", 0] }, "class_type": "KSampler", "_meta": { "title": "KSampler" } },
  "6": { "inputs": { "text": "", "clip": ["29", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "7": { "inputs": { "text": "watermark, text\n", "clip": ["29", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "8": { "inputs": { "samples": ["3", 0], "vae": ["29", 2] }, "class_type": "VAEDecode", "_meta": { "title": "VAE Decode" } },
  "9": { "inputs": { "filename_prefix": "ComfyUI_Inpainted", "images": ["8", 0] }, "class_type": "SaveImage", "_meta": { "title": "Save Image" } },
  
  // Node 20 loads the ORIGINAL image (to be inpainted)
  "20": { "inputs": { "image": "" }, "class_type": "LoadImage", "_meta": { "title": "Load Original Image" } },
  
  // NEW Node 25: Loads the MASK image (drawn by user)
  "25": { "inputs": { "image": "" }, "class_type": "LoadImage", "_meta": { "title": "Load Mask Image" } },

  "26": { 
    "inputs": { 
      "grow_mask_by": 6, 
      "pixels": ["20", 0],  // Takes pixels from the ORIGINAL image (node 20)
      "vae": ["29", 2], 
      "mask": ["25", 1]     // Takes mask from the MASK image (node 25, output 1 is the mask channel)
    }, 
    "class_type": "VAEEncodeForInpaint", 
    "_meta": { "title": "VAE Encode (for Inpainting)" } 
  },
  "29": { "inputs": { "ckpt_name": "dreamshaper_8Inpainting.safetensors" }, "class_type": "CheckpointLoaderSimple", "_meta": { "title": "Load Checkpoint" } }
};
export const imageVariationsWorkflow = {
  "1": { "inputs": { "text": "", "clip": ["15", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "3": { "inputs": { "image": "" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "5": { "inputs": { "mode": "resize", "supersample": "true", "resampling": "lanczos", "rescale_factor": 2, "resize_width": 1024, "resize_height": 1024, "image": ["3", 0] }, "class_type": "Image Resize", "_meta": { "title": "Image Resize" } },
  "6": { "inputs": { "text": "1024 x 1024", "anything": ["17", 2] }, "class_type": "easy showAnything", "_meta": { "title": "Preview Resolution" } },
  "7": { "inputs": { "pixels": ["5", 0], "vae": ["15", 2] }, "class_type": "VAEEncode", "_meta": { "title": "VAE Encode" } },
  "8": { "inputs": { "seed": 0, "steps": 30, "cfg": 7, "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": 0.5, "model": ["15", 0], "positive": ["1", 0], "negative": ["16", 0], "latent_image": ["7", 0] }, "class_type": "KSampler", "_meta": { "title": "KSampler" } },
  "10": { "inputs": { "samples": ["8", 0], "vae": ["15", 2] }, "class_type": "VAEDecode", "_meta": { "title": "VAE Decode" } },
  "11": { "inputs": { "filename_prefix": "Variation", "images": ["10", 0] }, "class_type": "SaveImage", "_meta": { "title": "Save Image Variation" } },
  "12": { "inputs": { "rgthree_comparer": { "images": [{ "name": "A", "selected": true, "url": "/api/view?filename=rgthree.compare._temp_qixsn_00001_.png&type=temp&subfolder=&rand=0.8182943630137971" }, { "name": "B", "selected": true, "url": "/api/view?filename=rgthree.compare._temp_qixsn_00002_.png&type=temp&subfolder=&rand=0.7995144152097862" }] }, "image_a": ["5", 0], "image_b": ["10", 0] }, "class_type": "Image Comparer (rgthree)", "_meta": { "title": "Image Comparer (rgthree)" } },
  "15": { "inputs": { "ckpt_name": "SDXL/sd_xl_base_1.0.safetensors" }, "class_type": "CheckpointLoaderSimple", "_meta": { "title": "Load Checkpoint" } },
  "16": { "inputs": { "text": "ugly", "clip": ["15", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "17": { "inputs": { "megapixel": "1.0", "aspect_ratio": "1:1 (Perfect Square)", "divisible_by": "64", "custom_ratio": "1:1", "custom_aspect_ratio": "1:1" }, "class_type": "FluxResolutionNode", "_meta": { "title": "Flux Resolution Calc" } }
};

export const imageGenWorkflow = {
  "3": { "inputs": { "seed": 0, "steps": 20, "cfg": 8, "sampler_name": "euler", "scheduler": "normal", "denoise": 1, "model": ["10", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0] }, "class_type": "KSampler", "_meta": { "title": "KSampler" } },
  "4": { "inputs": { "ckpt_name": "dreamshaper_8Inpainting.safetensors" }, "class_type": "CheckpointLoaderSimple", "_meta": { "title": "Load Checkpoint" } },
  "5": { "inputs": { "width": 512, "height": 512, "batch_size": 1 }, "class_type": "EmptyLatentImage", "_meta": { "title": "Empty Latent Image" } },
  "6": { "inputs": { "text": "", "clip": ["10", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "7": { "inputs": { "text": "text, watermark", "clip": ["10", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "8": { "inputs": { "samples": ["3", 0], "vae": ["10", 2] }, "class_type": "VAEDecode", "_meta": { "title": "VAE Decode" } },
  "9": { "inputs": { "filename_prefix": "ComfyUI", "images": ["8", 0] }, "class_type": "SaveImage", "_meta": { "title": "Save Image" } },
  "10": { "inputs": { "ckpt_name": "productDesign_eddiemauro20.safetensors" }, "class_type": "CheckpointLoaderSimple", "_meta": { "title": "Load Checkpoint" } }
};

export const canvasSketchWorkflow = {
  "158": { "inputs": { "seed": 0, "steps": 30, "cfg": 7, "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": 1, "model": ["177", 0], "positive": ["167", 0], "negative": ["167", 1], "latent_image": ["179", 0] }, "class_type": "KSampler", "_meta": { "title": "KSampler" } },
  "159": { "inputs": { "text": "", "clip": ["177", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "160": { "inputs": { "text": "ugly", "clip": ["177", 1] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "161": { "inputs": { "samples": ["158", 0], "vae": ["177", 2] }, "class_type": "VAEDecode", "_meta": { "title": "VAE Decode" } },
  "162": { "inputs": { "filename_prefix": "Img", "images": ["161", 0] }, "class_type": "SaveImage", "_meta": { "title": "Save Final Image" } },
  "165": { "inputs": { "preprocessor": "CannyEdgePreprocessor", "resolution": 1024, "image": ["178", 0] }, "class_type": "AIO_Preprocessor", "_meta": { "title": "AIO Aux Preprocessor" } },
  "166": { "inputs": { "images": ["165", 0] }, "class_type": "PreviewImage", "_meta": { "title": "Preview Image from Preprocessor" } },
  "167": { "inputs": { "strength": 0.9, "start_percent": 0, "end_percent": 0.6, "positive": ["159", 0], "negative": ["160", 0], "control_net": ["168", 0], "image": ["165", 0], "vae": ["177", 2] }, "class_type": "ControlNetApplyAdvanced", "_meta": { "title": "Apply ControlNet" } },
  "168": { "inputs": { "control_net_name": "diffusion_pytorch_model_promax.safetensors" }, "class_type": "ControlNetLoader", "_meta": { "title": "Load ControlNet Model" } },
  "176": { "inputs": { "rgthree_comparer": { "images": [{ "name": "A", "selected": true, "url": "/api/view?filename=rgthree.compare._temp_onpjq_00006_.png&type=temp&subfolder=&rand=0.38609095011897887" }, { "name": "B", "selected": true, "url": "/api/view?filename=rgthree.compare._temp_onpjq_00007_.png&type=temp&subfolder=&rand=0.2029526819075258" }] }, "image_a": ["178", 0], "image_b": ["161", 0] }, "class_type": "Image Comparer (rgthree)", "_meta": { "title": "Image Comparer (rgthree)" } },
  "177": { "inputs": { "ckpt_name": "Juggernaut_X_RunDiffusion.safetensors" }, "class_type": "CheckpointLoaderSimple", "_meta": { "title": "Load Checkpoint" } },
  "178": { "inputs": { "image": "" }, "class_type": "LoadImage", "_meta": { "title": "User Sketch" } }, // Modified
  "179": { "inputs": { "width": 1024, "height": 1024, "batch_size": 1 }, "class_type": "EmptySD3LatentImage", "_meta": { "title": "EmptySD3LatentImage" } },
  "180": { "inputs": { "megapixel": "1.0", "aspect_ratio": "1:1 (Perfect Square)", "divisible_by": false, "custom_ratio": "1:1", "custom_aspect_ratio": "1:1" }, "class_type": "FluxResolutionNode", "_meta": { "title": "SDXL Resolution Calculator" } },
  "181": { "inputs": { "text": "1024 x 1024", "anything": ["180", 2] }, "class_type": "easy showAnything", "_meta": { "title": "Preview Resolution" } }
};

export const threeDGenWorkflow = {
  "3": { "inputs": { "seed": 0, "steps": 20, "cfg": 1, "sampler_name": "euler", "scheduler": "normal", "denoise": 1, "model": ["70", 0], "positive": ["80", 0], "negative": ["80", 1], "latent_image": ["66", 0] }, "class_type": "KSampler", "_meta": { "title": "KSampler" } },
  "51": { "inputs": { "crop": "none", "clip_vision": ["54", 1], "image": ["56", 0] }, "class_type": "CLIPVisionEncode", "_meta": { "title": "CLIP Vision Encode" } },
  "54": { "inputs": { "ckpt_name": "model.fp16.safetensors" }, "class_type": "ImageOnlyCheckpointLoader", "_meta": { "title": "Image Only Checkpoint Loader (img2vid model)" } },
  "56": { "inputs": { "image": "" }, "class_type": "LoadImage", "_meta": { "title": "Load Image" } },
  "61": { "inputs": { "num_chunks": 8000, "octree_resolution": 256, "samples": ["3", 0], "vae": ["54", 2] }, "class_type": "VAEDecodeHunyuan3D", "_meta": { "title": "VAEDecodeHunyuan3D" } },
  "62": { "inputs": { "threshold": 0.6000000000000001, "voxel": ["61", 0] }, "class_type": "VoxelToMeshBasic", "_meta": { "title": "VoxelToMeshBasic" } },
  "66": { "inputs": { "resolution": 3072, "batch_size": 1 }, "class_type": "EmptyLatentHunyuan3Dv2", "_meta": { "title": "EmptyLatentHunyuan3Dv2" } },
  "67": { "inputs": { "filename_prefix": "mesh/ComfyUI", "image": "", "mesh": ["62", 0] }, "class_type": "SaveGLB", "_meta": { "title": "SaveGLB" } },
  "70": { "inputs": { "shift": 1.0000000000000002, "model": ["54", 0] }, "class_type": "ModelSamplingAuraFlow", "_meta": { "title": "ModelSamplingAuraFlow" } },
  "80": { "inputs": { "clip_vision_output": ["51", 0] }, "class_type": "Hunyuan3Dv2Conditioning", "_meta": { "title": "Hunyuan3Dv2Conditioning" } }
};