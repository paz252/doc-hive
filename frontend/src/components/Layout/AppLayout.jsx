import { useState } from "react";

import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import ChatWindow from "../Chat/ChatWindow";
import NoDocumentSelected from "../Chat/NoDocumentSelected";

import "./AppLayout.css";

export default function AppLayout({
  mode,
  onToggleTheme,
}) {
  const [selectedDocument, setSelectedDocument] =
    useState(null);

  return (
    <div className="app-layout">
      <Navbar
        mode={mode}
        onToggleTheme={onToggleTheme}
      />

      <div className="app-content">
        <Sidebar
          selectedDocument={selectedDocument}
          onSelectDocument={setSelectedDocument}
        />

        <main className="main-area">
          {selectedDocument ? (
            <ChatWindow
              document={selectedDocument}
            />
          ) : (
            <NoDocumentSelected />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}