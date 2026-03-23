export interface Quote {
  quote: string;
  author: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
