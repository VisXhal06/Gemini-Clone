import React, { useContext, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import "./Main.css";
import { Context } from "../../context/AppContext";

const Main = () => {
  const {
    input,
    setInput,
    onSent,
    recentPrompts,
    showResult,
    loading,
    resultData,
  } = useContext(Context);

  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const fileInputRef = useRef(null);

  // Available AI models
  const models = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", icon: "⚡" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", icon: "💎" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", icon: "✨" },
  ];

  // Suggestion cards data
  const suggestionCards = [
    {
      text: "Suggest beautiful places to see on an upcoming road trip",
      icon: assets.compass_icon,
    },
    {
      text: "Briefly summarize this concept: urban planning",
      icon: assets.bulb_icon,
    },
    {
      text: "Brainstorm team bonding activities for our work retreat",
      icon: assets.message_icon,
    },
    {
      text: "Improve the readability of the following code",
      icon: assets.code_icon,
    },
  ];

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      type: file.type,
      file: file,
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Handle card click
  const handleCardClick = (text) => {
    setInput(text);
    onSent(text);
  };

  // Send message
  const handleSend = async () => {
    if (input.trim() || uploadedFiles.length > 0) {
      await onSent(input.trim());
      setUploadedFiles([]);
    }
  };

  return (
    <div className="main">
      {/* Top Navigation */}
      <div className="nav">
        <div className="nav-left">
          {/* Model Selector */}
          <div className="model-selector">
            <button
              className="model-btn"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
            >
              <span className="model-icon">
                {models.find((m) => m.id === selectedModel)?.icon}
              </span>
              <span className="model-name">
                {models.find((m) => m.id === selectedModel)?.name}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z" />
              </svg>
            </button>

            {showModelDropdown && (
              <div className="model-dropdown">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`model-option ${
                      selectedModel === model.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                  >
                    <span className="model-icon">{model.icon}</span>
                    <span>{model.name}</span>
                    {selectedModel === model.id && <span className="check">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <img src={assets.user_icon} alt="User" />
      </div>

      {/* Main Container */}
      <div className="main-container">
        {!showResult ? (
          <>
            {/* Welcome Screen */}
            <div className="greet">
              <p>
                <span>Hello, Vishal.</span>
              </p>
              <p>How Can I help you today?</p>
            </div>

            {/* Suggestion Cards */}
            <div className="cards">
              {suggestionCards.map((card, index) => (
                <div
                  key={index}
                  className="card"
                  onClick={() => handleCardClick(card.text)}
                >
                  <p>{card.text}</p>
                  <img src={card.icon} alt="" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Chat Results */}
            <div className="result">
              <div className="result-title">
                <img src={assets.user_icon} alt="" />
                <p>{recentPrompts}</p>
              </div>
              <div className="result-data">
                <img src={assets.gemini_icon} alt="" />
                {loading ? (
                  <div className="loader">
                    <hr />
                    <hr />
                    <hr />
                  </div>
                ) : (
                  <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Input Area */}
        <div className="main-bottom">
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-chip">
                  <span className="file-icon">📎</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{file.size}</span>
                  <button
                    className="file-remove"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Box */}
          <div className="search-box">
            {/* Left side - Action buttons */}
            <div className="search-actions-left">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                style={{ display: "none" }}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              <img
                src={assets.gallery_icon}
                alt="Upload"
                title="Upload image"
                onClick={() => fileInputRef.current?.click()}
              />
            </div>

            {/* Input field */}
            <input
              type="text"
              placeholder="Enter a prompt here"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />

            {/* Right side - Action buttons */}
            <div>
              <img src={assets.mic_icon} alt="Voice" title="Voice input" />
              {input.trim() || uploadedFiles.length > 0 ? (
                <img
                  src={assets.send_icon}
                  alt="Send"
                  title="Send message"
                  onClick={handleSend}
                  className="send-icon-active"
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <img
                  src={assets.send_icon}
                  alt="Send"
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                />
              )}
            </div>
          </div>

          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so
            double-check its responses. Your privacy & Gemini Apps
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;