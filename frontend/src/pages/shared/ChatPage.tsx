import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { chatService } from '@/services/chatService';
import type { ChatMessage, ChatResponse } from '@/types';
import { formatTime } from '@/utils';

let messageIdCounter = 0;
const newId = () => String(++messageIdCounter);

const WELCOME: ChatMessage = {
  id: newId(),
  role: 'assistant',
  content:
    "Hello! I'm your AI appointment assistant. I can help you:\n\n• Book a new appointment\n• Cancel an appointment\n• Reschedule an appointment\n• View your appointments\n• Check available slots\n\nWhat would you like to do?",
  timestamp: new Date(),
  quickReplies: ['Book an appointment', 'View my appointments', 'Cancel an appointment', 'Check availability'],
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res: ChatResponse = await chatService.sendMessage({ message: text.trim(), sessionId });
      setSessionId(res.sessionId);

      const botMsg: ChatMessage = {
        id: newId(),
        role: 'assistant',
        content: res.message,
        timestamp: new Date(),
        quickReplies: res.quickReplies,
        appointmentDetails: res.appointmentDetails,
        suggestedSlots: res.suggestedSlots,
        requiresConfirmation: res.requiresConfirmation,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" /> AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">Your intelligent appointment booking assistant</p>
      </div>

      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardHeader className="border-b py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Appointment Assistant · Online
          </CardTitle>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>

                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.quickReplies.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => send(qr)}
                        disabled={sending}
                        className="rounded-full border border-primary text-primary text-xs px-3 py-1 hover:bg-primary/10 transition-colors"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-muted-foreground px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex gap-2 items-center">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <LoadingSpinner className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1"
            aria-label="Chat message"
          />
          <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || sending} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
