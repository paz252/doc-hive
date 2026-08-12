import { useCallback, useEffect, useState } from "react";

import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import ChatWindow from "../Chat/ChatWindow";

import "./AppLayout.css";

export default function AppLayout({
  mode,
  onToggleTheme,
}) {
  const [allDocumentsSelected, setAllDocumentsSelected] =
    useState(false);

  const [selectedDocumentIds, setSelectedDocumentIds] =
    useState([]);

  const [documents, setDocuments] = useState([]);

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
    },
    []
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

  return (
    <div className="app-layout">
      <Navbar
        mode={mode}
        onToggleTheme={onToggleTheme}
      />

      <div className="app-content">
        <Sidebar
          allDocumentsSelected={
            allDocumentsSelected
          }
          selectedDocumentIds={
            selectedDocumentIds
          }
          onContextChange={
            handleContextChange
          }
          onDocumentsChange={
            handleDocumentsChange
          }
        />

        <main className="main-area">
          <ChatWindow
            documentIds={documentIds}
            documents={documents}
            selectedDocuments={
              selectedDocuments
            }
            allDocumentsSelected={
              allDocumentsSelected
            }
            onContextChange={
              handleContextChange
            }
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}
