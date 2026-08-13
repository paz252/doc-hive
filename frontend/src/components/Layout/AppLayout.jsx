import { useCallback, useEffect, useState } from "react";

import { Drawer, useMediaQuery, useTheme } from "@mui/material";

import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import ChatWindow from "../Chat/ChatWindow";

import { fetchStorageStats } from "../../api/myResources";

import "./AppLayout.css";

const SIDEBAR_WIDTH = 300;

export default function AppLayout({
  mode,
  onToggleTheme,
}) {
  const theme = useTheme();
  // Below `md`, the sidebar becomes an overlay drawer instead of
  // a permanent flex column — it was eating ~80% of the viewport
  // as a fixed-width flex sibling with no room left for chat.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [allDocumentsSelected, setAllDocumentsSelected] = useState(false);

  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [stats, setStats] = useState({
    doc_count: 0,
    chunk_count: 0,
    total_size_mb: 0,
  });

  /*
   * Sidebar owns document fetching, but AppLayout
   * needs the document objects for the ChatHeader.
   */
  const handleDocumentsChange = useCallback(
    (nextDocuments) => {
      setDocuments(nextDocuments);
    },
    []
  );

  /*
   * Refresh storage stats whenever the document list
   * changes (initial load, upload, or delete) — Sidebar
   * already calls handleDocumentsChange after each of
   * those, so this piggybacks on that signal instead of
   * needing a separate refresh mechanism.
   */
  useEffect(() => {
    fetchStorageStats().then(setStats);
  }, [documents]);

  /*
   * Context selection comes from Sidebar or from
   * ChatHeader's document context dialog.
   *
   * documentIds = [] when All Documents is selected.
   */
  const handleContextChange = useCallback(
    ({
      allDocumentsSelected,
      documentIds,
    }) => {
      setAllDocumentsSelected(
        allDocumentsSelected
      );

      setSelectedDocumentIds(documentIds);

      // Selecting a document from the drawer on mobile should close
      // it afterward — otherwise the user has to manually dismiss the
      // overlay every time before they can see the chat they just set up.
      if (isMobile) {
        setMobileSidebarOpen(false);
      }
    },
    [isMobile]
  );

  /*
   * Documents currently included in chat context.
   */
  const selectedDocuments = allDocumentsSelected
    ? documents
    : documents.filter((document) =>
      selectedDocumentIds.includes(document.id)
    );

  /*
   * Backend representation:
   *
   * All Documents -> []
   * Selected docs -> ["id1", "id2"]
   */
  const documentIds = allDocumentsSelected
    ? []
    : selectedDocumentIds;

  const sidebarContent = (
    <Sidebar
      allDocumentsSelected={allDocumentsSelected}
      selectedDocumentIds={selectedDocumentIds}
      onContextChange={handleContextChange}
      onDocumentsChange={handleDocumentsChange}
    />
  );

  return (
    <div className="app-layout">
      <Navbar
        mode={mode}
        onToggleTheme={onToggleTheme}
        stats={stats}
        storageLimitMB={500}
        showMenuButton={isMobile}
        onMenuClick={() => setMobileSidebarOpen(true)}
      />

      <div className="app-content">
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
            ModalProps={{ keepMounted: true }} // better perf on reopen
            sx={{
              "& .MuiDrawer-paper": {
                width: "min(85vw, 320px)",
                boxSizing: "border-box",
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: SIDEBAR_WIDTH,
                boxSizing: "border-box",
                position: "relative", // stays in normal flex flow, not fixed
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        )}

        <main className="main-area">
          <ChatWindow
            documentIds={documentIds}
            documents={documents}
            selectedDocuments={selectedDocuments}
            allDocumentsSelected={allDocumentsSelected}
            onContextChange={handleContextChange}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}