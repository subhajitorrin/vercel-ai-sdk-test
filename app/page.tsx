"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "ai/react";

export default function AIChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat Interface</h1>
      <ScrollArea
        id="chat-scroll"
        className="flex-grow mb-4 border rounded-md p-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-10 border-b ${
              message.role !== "user" ? "text-red-700" : ""
            }`}
          >
            {message.role === "user" ? "User: " : "AI: "}
            {message.content}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Type your message here..."
          className="flex-grow"
          name="prompt"
          value={input}
          onChange={handleInputChange}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
