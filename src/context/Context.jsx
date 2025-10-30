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
    
    // ✅ Add throttle control
    const lastRequestTime = useRef(0);
    const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData(prev => prev + nextWord)
        }, 75 * index)
    }

    const onSent = async (prompt) => {
        const query = (prompt ?? input).trim();
        if (!query) return "";

        // ✅ Throttle requests
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
        setRecentPrompts(query);
        setPrevPrompts(prev => [query, ...prev]);
        setResultData("");

        try {
            const response = await generateText({
                model: "gemini-2.0-flash",
                prompt: query
            });
            
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
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}    
        </Context.Provider>
    )
}

export default ContextProvider;