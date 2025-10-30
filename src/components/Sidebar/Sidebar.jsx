import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/AppContext";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const { 
    onSent, 
    PrevPrompts, 
    setRecentPrompts, 
    newChat, 
    loading,
    deletePrompt,
    deleteAllPrompts 
  } = useContext(Context);

  const loadPrompt = async (prompt) => {
    setRecentPrompts(prompt);
    await onSent(prompt);
  };

  const handleNewChat = () => {
    newChat();
  };

  const handleDeletePrompt = (e, index) => {
    e.stopPropagation();
    deletePrompt(index);
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all chat history?")) {
      deleteAllPrompts();
    }
  };

  return (
    <div className="sidebar">
      <div className="top">
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu"
          src={assets.menu_icon}
          alt="Menu"
        />
        
        <div onClick={handleNewChat} className="new-chat">
          <img src={assets.plus_icon} alt="New Chat" />
          {extended ? <p>New Chat</p> : null}
        </div>

        {extended ? (
          <div className="recent">
            <div className="recent-header">
              <p className="recent-title">Recent</p>
            </div>
            
            {PrevPrompts && PrevPrompts.length > 0 ? (
              <>
                <div className="recent-list">
                  {PrevPrompts.map((item, index) => {
                    return (
                      <div 
                        key={index}
                        className="recent-entry"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => !loading && loadPrompt(item)}
                        style={{ 
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.5 : 1
                        }}
                        title={item}
                      >
                        <img src={assets.message_icon} alt="" />
                        <p>{item.slice(0, 18)}{item.length > 18 ? "..." : ""}</p>
                        
                        {/* ✅ Delete button - shows on hover */}
                        {hoveredIndex === index && (
                          <button
                            onClick={(e) => handleDeletePrompt(e, index)}
                            className="delete-btn"
                            title="Delete chat"
                          >
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* ✅ Clear all button at bottom */}
                <div className="clear-all-wrapper">
                  <button onClick={handleDeleteAll} className="clear-all-btn">
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Clear conversations
                  </button>
                </div>
              </>
            ) : (
              <div className="no-recent">
                No recent conversations
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>

        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="" />
          {extended ? <p>Activity</p> : null}
        </div>

        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;