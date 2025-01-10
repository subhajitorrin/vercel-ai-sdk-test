"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

declare global {
  interface Window {
    webkitSpeechRecognition: unknown;
  }
}

type MessageType = {
  id: string;
  role: "user" | "ai";
  content: string;
};

interface ConversationType {
  id: string;
  messages: MessageType[];
  history: string;
  stage: string;
  feedback: string;
}

export default function AIChatInterface() {
  const [conversation, setConversation] = useState<ConversationType>({
    id: "1",
    messages: [],
    history: "",
    stage: "introduction",
    feedback: ""
  });
  const [currentText, setcurrentText] = useState("");
  const [toggleMic, setToggleMic] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<null | SpeechRecognition>(null);

  async function handleStartRecording() {
    setToggleMic(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onresult = (e) => {
      const { transcript } = e.results[e.results.length - 1][0];
      setTranscript(transcript);
    };
    recognitionRef.current.start();
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  async function handleStopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setToggleMic(false);
    }
  }

  useEffect(() => {
    console.log(conversation);
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentText) return;

    try {
      const newMessage: MessageType = {
        id: uuidv4(),
        role: "user",
        content: currentText
      };

      const updatedMessages = [...conversation.messages, newMessage];

      setConversation((prevConversation) => ({
        ...prevConversation,
        messages: updatedMessages
      }));

      const { data } = await axios.post("/api/chat", {
        messages: updatedMessages,
        history: conversation.history
      });

      const aiResponse: MessageType = {
        id: uuidv4(),
        role: "ai",
        content: data
      };

      console.log(data);
      setConversation((prevConversation) => ({
        ...prevConversation,
        messages: [...prevConversation.messages, aiResponse]
      }));
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // Clear the input field after submitting the message
    setcurrentText("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat Interface</h1>
      <ScrollArea
        id="chat-scroll"
        className="flex-grow mb-4 border rounded-md p-4"
      >
        {conversation &&
          conversation.messages.length > 0 &&
          conversation.messages.map((message) => (
            <div
              key={message?.id}
              className={`mb-10 border-b ${
                message?.role !== "user" ? "text-red-700" : ""
              }`}
            >
              {message?.role === "user" ? "User: " : "AI: "}
              {message?.content}
            </div>
          ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Type your message here..."
          className="flex-grow"
          name="prompt"
          value={currentText}
          onChange={(e) => setcurrentText(e.target.value)}
        />
        <Button type="submit">Send</Button>
        <Button
          onClick={toggleMic ? handleStopRecording : handleStartRecording}
        >
          {toggleMic ? "Stop Mic" : "Start Mic"}
        </Button>
      </form>
      {transcript}
    </div>
  );
}
