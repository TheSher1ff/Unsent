import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Send, Loader2, Image } from "lucide-react"; // Added Image icon
import { useCreateMessage } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const EMOTIONS = [
  { color: "#FFB7B2", label: "Blush", class: "bg-[#FFB7B2]" },
  { color: "#B2E2F2", label: "Sky", class: "bg-[#B2E2F2]" },
  { color: "#B2F2BB", label: "Mint", class: "bg-[#B2F2BB]" },
  { color: "#FDFD96", label: "Butter", class: "bg-[#FDFD96]" },
  { color: "#D1B2F2", label: "Lavender", class: "bg-[#D1B2F2]" },
  { color: "#FFD6A5", label: "Peach", class: "bg-[#FFD6A5]" },
];

export function ComposeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(EMOTIONS[5]); // Default to Empty (Black)
  const [toName, setToName] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // <-- Added state for imageUrl
  
  const createMessage = useCreateMessage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toName.trim() || !content.trim()) return;

    try {
      // Included imageUrl in the mutation payload
      await createMessage.mutateAsync({
        toName,
        content,
        color: selectedColor.color,
        imageUrl: imageUrl.trim() || null, // Sends null if empty string
      });
      
      toast({
        title: "Sent into the void",
        description: "Your message has been released.",
      });
      
      setIsOpen(false);
      // Reset form
      setToName("");
      setContent("");
      setImageUrl(""); // <-- Reset imageUrl state
      setSelectedColor(EMOTIONS[5]);
    } catch (error) {
      toast({
        title: "Failed to send",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 bg-sky-300 text-white z-40 border-4 border-white"
        >
          <PenLine className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden border-8 border-white sm:max-w-xl transition-colors duration-500 h-[650px] flex flex-col shadow-xl rounded-[2rem]", // slightly increased height for layout comfort
        selectedColor.class
      )}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full relative z-10">
          <div className="flex-1 p-8 flex flex-col justify-center gap-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="text-black/60 text-sm font-medium uppercase tracking-widest mb-2 block">
                  To Whom?
                </label>
                <Input
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="Name..."
                  className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 text-4xl font-display text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-black h-auto py-2"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-black/60 text-sm font-medium uppercase tracking-widest mb-2 block">
                  Your Message
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your unsent message here..."
                  className="bg-transparent border-none resize-none px-0 text-xl font-sans text-black placeholder:text-black/30 focus-visible:ring-0 min-h-[150px]"
                  maxLength={500}
                />
              </div>

              {/* Added Image URL Input Field */}
              <div>
                <label className="text-black/60 text-sm font-medium uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Image className="h-4 w-4" /> Image URL (Optional)
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-transparent border-0 border-b border-black/20 rounded-none px-0 text-base font-sans text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-black h-auto py-1"
                />
              </div>
            </motion.div>
          </div>
          <div className="p-6 bg-white border-t border-black/10 flex items-center justify-between">
            <div className="flex gap-3 flex-wrap max-w-[60%]">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.color}
                  type="button"
                  onClick={() => setSelectedColor(emotion)}
                  className={cn(
                    "w-8 h-8 rounded-full border-4 transition-all duration-300 shadow-sm", // adjusted size down to w-8/h-8 to avoid crowding
                    emotion.class,
                    selectedColor.color === emotion.color 
                      ? "border-white scale-110 shadow-md" 
                      : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                  )}
                  title={emotion.label}
                />
              ))}
            </div>
            <Button 
              type="submit" 
              disabled={createMessage.isPending || !toName || !content}
              className="bg-white text-sky-400 hover:bg-sky-50 rounded-full px-10 h-12 font-bold shadow-md transition-all active:scale-95"
            >
              {createMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {createMessage.isPending ? "Sending..." : "Release"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
