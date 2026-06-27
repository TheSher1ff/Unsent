import { useState } from "react";
import { useMessages } from "@/hooks/use-messages";
import { MessageCard } from "@/components/MessageCard";
import { Header } from "@/components/Header";
import { ComposeModal } from "@/components/ComposeModal";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_TRIGGER = "//admin";

export default function Home() {
  const [search, setSearch] = useState("");
  const [cleared, setCleared] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: messages, isLoading, error } = useMessages(search);

  function handleSearch(value: string) {
    if (value.startsWith(ADMIN_TRIGGER)) {
      const pwd = value.replace(ADMIN_TRIGGER, "").trim();

      if (pwd === import.meta.env.ADMIN_KEY) {
        setIsAdmin(true);
        setSearch("");
        return;
      }

      alert("Wrong password");
      return;
    }

    setSearch(value);
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      {/* FIXED: Transformed bg-texture into a layout-filling underlay 
        that won't shift out of frame during scrolls
      */}
      <div className="bg-texture fixed inset-0 z-0 pointer-events-none" />

      {/* Header handles z-40 context internally */}
      <Header onSearch={handleSearch} />

      <div className="h-32 md:h-40" />

      {/* Elevated content safely above the fixed background underlay using z-10 */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* WIPE VISUAL DECK */}
        {isAdmin && !isLoading && !error && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setCleared(true)}
              className="text-sm px-4 py-2 rounded-full bg-destructive text-destructive-foreground hover:opacity-90 transition"
            >
              Wipe Deck
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground animate-pulse">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="font-display text-xl">Retrieving memories...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-destructive">
            <p className="font-display text-2xl">Something went wrong.</p>
            <p className="font-sans mt-2 opacity-70">
              Please try refreshing the page.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {cleared ? (
              <motion.div
                key="cleared"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 text-center bg-transparent"
              >
                <p className="font-display text-3xl text-muted-foreground">
                  The deck is silent.
                </p>
                <p className="mt-4 text-muted-foreground/60">
                  Refresh the page to restore memories.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0.5 bg-border border border-border overflow-hidden"
              >
                {messages?.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-32 text-center bg-transparent"
                  >
                    <p className="font-display text-3xl text-muted-foreground">
                      No messages found.
                    </p>
                    <p className="mt-4 text-muted-foreground/60">
                      Be the first to speak into the silence.
                    </p>
                  </motion.div>
                ) : (
                  messages?.map((message, index) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      index={index}
                      isAdmin={isAdmin}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <ComposeModal />
    </div>
  );
}
