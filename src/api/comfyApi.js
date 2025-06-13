// src/api/comfyApi.js

const comfyuiBaseUrl = process.env.REACT_APP_COMFYUI_URL || 'http://127.0.0.1:8188';

export async function uploadImageToComfyUI(file, subdir = 'input') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('subdir', subdir);
  formData.append('overwrite', 'true');

  try {
    const response = await fetch(`${comfyuiBaseUrl}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('ComfyUI Upload Response:', data);
    return data.name;
  } catch (error) {
    console.error('Error uploading image to ComfyUI:', error);
    throw error;
  }
}

export async function queuePromptInComfyUI(workflowJson) {
  try {
    const response = await fetch(`${comfyuiBaseUrl}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: workflowJson }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('ComfyUI Queue Response:', data);
    return data.prompt_id;
  } catch (error) {
    console.error('Error queuing prompt in ComfyUI:', error);
    throw error;
  }
}

export async function getExecutionHistory(promptId) {
  try {
    const response = await fetch(`${comfyuiBaseUrl}/history?prompt_id=${promptId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }

    // THIS IS THE KEY CHANGE
    const rawHistoryResponse = await response.json();
    console.log('Raw ComfyUI History API Response:', rawHistoryResponse);

    // The raw response is already the history object keyed by prompt_id.
    // So, we directly access it with promptId.
    const promptSpecificHistory = rawHistoryResponse[promptId];

    // You can keep some defensive checks if you want, but the main error is fixed.
    if (!promptSpecificHistory) {
      // This case means the promptId was not found in the history object yet,
      // which is expected if the job is still running or failed immediately.
      // The polling loop in ComfyUIWrapper will handle retries.
      console.warn(`History for prompt ID '${promptId}' not yet available or failed on server.`);
    }

    return promptSpecificHistory; // This will now correctly return the specific history object

  } catch (error) {
    console.error('Error getting history from ComfyUI:', error);
    throw error; // Re-throw to propagate error to calling function
  }
}

export function getComfyUIImageUrl(filename, subfolder = 'output', type = 'output') {
  return `${comfyuiBaseUrl}/view?filename=${filename}&type=${type}&subfolder=${subfolder}`;
}

export async function getComfyUIObjectInfo() {
  try {
    const response = await fetch(`${comfyuiBaseUrl}/object_info`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ComfyUI object info:', error);
    return null;
  }
}