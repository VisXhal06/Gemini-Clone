import { Context } from "./AppContext";
import { generateText } from "../config/gemini";
import { useState, useRef } from "react";

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompts, setRecentPrompts] = useState("");
    const [PrevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    
    // ✅ Model Selection
    const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
    
    // ✅ File/Image Upload
    const [uploadedFiles, setUploadedFiles] = useState([]);
    
    // ✅ Voice/Mic Recording
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    
    const lastRequestTime = useRef(0);
    const MIN_REQUEST_INTERVAL = 2000;
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData(prev => prev + nextWord)
        }, 75 * index)
    }

    // ✅ New Chat function
    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setInput("");
        setRecentPrompts("");
        setResultData("");
        setUploadedFiles([]);
        setAudioBlob(null);
    }

    // ✅ Delete single prompt
    const deletePrompt = (indexToDelete) => {
        setPrevPrompts(prev => prev.filter((_, index) => index !== indexToDelete));
    }

    // ✅ Delete all prompts
    const deleteAllPrompts = () => {
        setPrevPrompts([]);
        newChat();
    }

    // ✅ Handle File Upload
    const handleFileUpload = (files) => {
        const fileArray = Array.from(files);
        const newFiles = fileArray.map((file) => ({
            name: file.name,
            size: (file.size / 1024).toFixed(2) + " KB",
            type: file.type,
            file: file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        }));
        setUploadedFiles([...uploadedFiles, ...newFiles]);
    }

    // ✅ Remove uploaded file
    const removeFile = (index) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        // Revoke URL to prevent memory leaks
        if (uploadedFiles[index].preview) {
            URL.revokeObjectURL(uploadedFiles[index].preview);
        }
        setUploadedFiles(newFiles);
    }

    // ✅ Clear all uploaded files
    const clearAllFiles = () => {
        uploadedFiles.forEach(file => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setUploadedFiles([]);
    }

    // ✅ Start Voice Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    }

    // ✅ Stop Voice Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }

    // ✅ Convert audio to text (you'll need to implement this with a speech-to-text API)
    const transcribeAudio = async (audioBlob) => {
        // Placeholder - implement with your preferred speech-to-text service
        // Example: Google Speech-to-Text, Web Speech API, etc.
        console.log("Transcribing audio...", audioBlob);
        
        // For now, return a placeholder
        return "Voice input transcription would go here";
    }

    // ✅ Convert uploaded files to base64 (for API)
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // ✅ Main Send Function
    const onSent = async (prompt) => {
        const query = prompt !== undefined ? prompt : input.trim();
        
        if (!query && uploadedFiles.length === 0) {
            console.log("Empty query and no files, returning");
            return;
        }

        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.current;
        
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
            setResultData(`⏳ Please wait ${waitTime} seconds before sending another request.`);
            return;
        }

        lastRequestTime.current = now;
        setLoading(true);
        setShowResult(true);
        setResultData("");
        setRecentPrompts(query || "Image analysis");
        
        setPrevPrompts(prev => {
            if (!prev.includes(query) && query) {
                return [query, ...prev];
            }
            return prev;
        });

        try {
            // ✅ Prepare request data
            const requestData = {
                model: selectedModel,
                prompt: query,
            };

            // ✅ Include files if uploaded
            if (uploadedFiles.length > 0) {
                const filesData = await Promise.all(
                    uploadedFiles.map(async (file) => ({
                        name: file.name,
                        type: file.type,
                        data: await fileToBase64(file.file),
                    }))
                );
                requestData.files = filesData;
            }

            const response = await generateText(requestData);
            
            let responseArray = response.split("**");
            let newResponse = "";
            
            for(let i = 0; i < responseArray.length; i++) {
                if(i === 0 || i % 2 !== 1) {
                    newResponse += responseArray[i];
                }
                else {
                    newResponse += "<b>" + responseArray[i] + "</b>";
                }
            }
            
            let newResponse2 = newResponse.split("*").join("</br>");
            let newResponseArray = newResponse2.split(" ");
            
            for(let i = 0; i < newResponseArray.length; i++) {
                const nextWord = newResponseArray[i];
                delayPara(i, nextWord + " ");
            }
            
            setLoading(false);
            setInput("");
            clearAllFiles(); // Clear uploaded files after sending
            
        } catch (error) {
            console.error("Error generating text:", error);
            
            if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
                setResultData("⚠️ Rate limit exceeded. Please wait a few minutes before trying again.");
            } else {
                setResultData("❌ Error generating text. Please try again.");
            }
            
            setLoading(false);
        }
    }

    const contextValue = {
        // Existing states
        PrevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompts,
        recentPrompts,
        showResult,
        setShowResult,
        loading,
        setLoading,
        resultData,
        setResultData,
        input,
        setInput,
        newChat,
        deletePrompt,        
        deleteAllPrompts,
        
        // ✅ Model Selection
        selectedModel,
        setSelectedModel,
        
        // ✅ File Upload
        uploadedFiles,
        setUploadedFiles,
        handleFileUpload,
        removeFile,
        clearAllFiles,
        
        // ✅ Voice Recording
        isRecording,
        setIsRecording,
        audioBlob,
        setAudioBlob,
        startRecording,
        stopRecording,
        transcribeAudio,
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}    
        </Context.Provider>
    )
}

export default ContextProvider;