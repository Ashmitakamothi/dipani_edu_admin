import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
} from "lucide-react";

// Quill Editor Component
const QuillEditor = ({
  value,
  onChange,
  placeholder = "Start typing...",
  height = "250px",
  toolbar = "full",
  className = "",
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Quill
  useEffect(() => {
    if (!editorRef.current) return;

    // Import Quill dynamically (in real app, you'd import normally)
    const initializeQuill = () => {
      const editor = editorRef.current;

      // Make it contentEditable
      editor.contentEditable = true;
      editor.innerHTML = value || "";

      // Add event listeners
      const handleInput = () => {
        onChange(editor.innerHTML);
      };

      const handleKeyDown = (e) => {
        // Handle Tab key for code blocks
        if (e.key === 'Tab') {
          e.preventDefault();
          document.execCommand('insertText', false, '    ');
        }
      };

      editor.addEventListener("input", handleInput);
      editor.addEventListener("paste", handleInput);
      editor.addEventListener("keydown", handleKeyDown);

      return () => {
        editor.removeEventListener("input", handleInput);
        editor.removeEventListener("paste", handleInput);
        editor.removeEventListener("keydown", handleKeyDown);
      };
    };

    const cleanup = initializeQuill();
    return cleanup;
  }, []);

  // Update content when value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      // Force update
      setTimeout(() => {
        onChange(editorRef.current.innerHTML);
      }, 10);
    }
  };

  const handleHeading = (level) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      
      // Get the current element containing the selection
      let currentElement = range.commonAncestorContainer;
      if (currentElement.nodeType === Node.TEXT_NODE) {
        currentElement = currentElement.parentElement;
      }
      
      // Ensure we're within the editor
      while (currentElement && currentElement !== editorRef.current && !['H1', 'H2', 'H3', 'P', 'DIV'].includes(currentElement.tagName)) {
        currentElement = currentElement.parentElement;
      }
      
      // Check if we're already in a heading or paragraph of the same level
      const isCurrentHeading = currentElement && (currentElement.tagName === `H${level}` || (level === 0 && currentElement.tagName === 'P')) && currentElement.parentElement === editorRef.current;
      
      if (isCurrentHeading) {
        // Convert to paragraph if heading, or do nothing if already P
        const p = document.createElement('p');
        p.innerHTML = currentElement.innerHTML;
        currentElement.parentNode.replaceChild(p, currentElement);
        
        // Update cursor position
        const newRange = document.createRange();
        newRange.selectNodeContents(p);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Apply heading or paragraph within the editor
        const newElement = level === 0 ? document.createElement('p') : document.createElement('h' + level);
        if (currentElement && ['H1', 'H2', 'H3', 'P', 'DIV'].includes(currentElement.tagName) && currentElement.parentElement === editorRef.current) {
          newElement.innerHTML = currentElement.innerHTML;
          currentElement.parentNode.replaceChild(newElement, currentElement);
        } else {
          const selectedText = range.toString() || (level === 0 ? 'Paragraph' : 'Heading ' + level);
          newElement.textContent = selectedText;
          if (range.toString()) range.deleteContents();
          range.insertNode(newElement);
          range.setStartAfter(newElement);
          range.collapse(true);
        }
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleList = (type) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Try the standard way first
      const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
      document.execCommand(command, false, null);
      
      // If that doesn't work, create manually
      setTimeout(() => {
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }, 10);
    }
  };

  const handleQuote = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'Quote text here';
      
      // Create blockquote element
      const blockquote = document.createElement('blockquote');
      blockquote.style.borderLeft = '4px solid #ccc';
      blockquote.style.paddingLeft = '16px';
      blockquote.style.margin = '16px 0';
      blockquote.style.fontStyle = 'italic';
      blockquote.textContent = selectedText;
      
      if (range.toString()) {
        range.deleteContents();
      }
      range.insertNode(blockquote);
      range.setStartAfter(blockquote);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const handleCodeBlock = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'Code goes here';
      
      // Create code block element
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      pre.style.backgroundColor = '#f5f5f5';
      pre.style.padding = '12px';
      pre.style.borderRadius = '4px';
      pre.style.fontFamily = 'monospace';
      pre.style.overflow = 'auto';
      pre.style.margin = '16px 0';
      
      code.textContent = selectedText;
      pre.appendChild(code);
      
      if (range.toString()) {
        range.deleteContents();
      }
      range.insertNode(pre);
      range.setStartAfter(pre);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const insertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString() || 'Link text';
    const url = prompt("Enter URL:");
    
    if (url && /^https?:\/\/[^\s]+$/.test(url)) {
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = url;
        link.textContent = selectedText;
        link.style.color = '#007bff';
        link.style.textDecoration = 'underline';
        
        range.deleteContents();
        range.insertNode(link);
        range.setStartAfter(link);
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
        
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    } else if (url) {
      alert("Please enter a valid URL");
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '16px 0';
        
        range.insertNode(img);
        range.setStartAfter(img);
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
        
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    } else if (url) {
      alert("Please enter a valid image URL");
    }
  };

  const getToolbarConfig = () => {
    const fullToolbar = [
      { icon: Bold, command: "bold", title: "Bold" },
      { icon: Italic, command: "italic", title: "Italic" },
      { icon: Underline, command: "underline", title: "Underline" },
      { divider: true },
      {
        icon: Heading1,
        command: "custom",
        action: () => handleHeading(1),
        title: "Heading 1",
      },
      {
        icon: Heading2,
        command: "custom",
        action: () => handleHeading(2),
        title: "Heading 2",
      },
      {
        icon: Heading3,
        command: "custom",
        action: () => handleHeading(3),
        title: "Heading 3",
      },
      {
        // Custom icon for Paragraph (using a "P" character as icon)
        icon: (props) => <span {...props} style={{ fontWeight: 500, fontSize: "14px" }}>P</span>,
        command: "custom",
        action: () => handleHeading(0), // Use 0 to represent paragraph
        title: "Paragraph",
      },
      { divider: true },
      { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
      { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
      { icon: AlignRight, command: "justifyRight", title: "Align Right" },
      { divider: true },
      { icon: List, command: "custom", action: () => handleList('ul'), title: "Bullet List" },
      {
        icon: ListOrdered,
        command: "custom",
        action: () => handleList('ol'),
        title: "Numbered List",
      },
      {
        icon: Quote,
        command: "custom",
        action: handleQuote,
        title: "Quote",
      },
      { divider: true },
      {
        icon: Link,
        command: "custom",
        action: insertLink,
        title: "Insert Link",
      },
      {
        icon: Image,
        command: "custom",
        action: insertImage,
        title: "Insert Image",
      },
      { icon: Code, command: "custom", action: handleCodeBlock, title: "Code Block" },
    ];

    const basicToolbar = [
      { icon: Bold, command: "bold", title: "Bold" },
      { icon: Italic, command: "italic", title: "Italic" },
      { icon: Underline, command: "underline", title: "Underline" },
      { divider: true },
      { icon: List, command: "custom", action: () => handleList('ul'), title: "Bullet List" },
      {
        icon: ListOrdered,
        command: "custom",
        action: () => handleList('ol'),
        title: "Numbered List",
      },
      { divider: true },
      {
        icon: Link,
        command: "custom",
        action: insertLink,
        title: "Insert Link",
      },
    ];

    return toolbar === "basic" ? basicToolbar : fullToolbar;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const editorHeight = isFullscreen ? "calc(100vh - 200px)" : height;

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-white " : ""
      } ${className}`}
    >
      <style>
        {`
          /* Ensure list markers are visible in the editor */
          [contenteditable] ol, [contenteditable] ul {
            padding-left: 40px !important;
            margin: 16px 0 !important;
          }
          
          [contenteditable] ol li, [contenteditable] ul li {
            list-style: inherit !important;
            margin: 4px 0 !important;
          }
          
          [contenteditable] ol {
            list-style-type: decimal !important;
          }
          
          [contenteditable] ol li::marker {
            font-size: 0.9em !important;
          }
          
          [contenteditable] ul {
            list-style-type: disc !important;
          }
          
          /* Ensure headings are properly styled */
          [contenteditable] h1 {
            font-size: 2em !important;
            font-weight: bold !important;
            margin: 16px 0 !important;
          }
          
          [contenteditable] h2 {
            font-size: 1.5em !important;
            font-weight: bold !important;
            margin: 14px 0 !important;
          }
          
          [contenteditable] h3 {
            font-size: 1.25em !important;
            font-weight: bold !important;
            margin: 12px 0 !important;
          }
          
          [contenteditable] blockquote {
            border-left: 4px solid #ccc !important;
            padding-left: 16px !important;
            margin: 16px 0 !important;
            font-style: italic !important;
          }
          
          [contenteditable] pre {
            background-color: #f5f5f5 !important;
            padding: 12px !important;
            border-radius: 4px !important;
            font-family: monospace !important;
            overflow: auto !important;
            margin: 16px 0 !important;
          }
        `}
      </style>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white dark:bg-white/[0.03] shadow-lg">
        {/* Toolbar */}
        <div className="border-b bg-gray-50 dark:bg-white/[0.05] p-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {getToolbarConfig().map((button, index) => {
              if (button.divider) {
                return (
                  <div key={index} className="w-px h-6 bg-gray-200 mx-1" />
                );
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    button.action
                      ? button.action()
                      : execCommand(button.command, button.value)
                  }
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/40 transition-colors duration-200 group"
                  title={button.title}
                >
                  <button.icon className="w-4 h-4 text-gray-600 group-hover:text-gray-800 dark:text-white/90 " />
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/40 transition-colors duration-200"
              title="Toggle Preview"
            >
              {isPreview ? (
                <EyeOff className="w-4 h-4 text-gray-600  dark:text-white/90" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600 dark:text-white/90" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/40 transition-colors duration-200"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-gray-600 dark:text-white/90" />
              ) : (
                <Maximize className="w-4 h-4 text-gray-600 dark:text-white/90 " />
              )}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        {isPreview ? (
          <div
            className="p-6 prose max-w-none bg-gray-50 dark:bg-white/[0.03] overflow-y-auto"
            style={{ height: editorHeight }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            className="p-6 outline-none prose max-w-none bg-white dark:bg-white/[0.03] dark:text-white/90 text-black dark:placeholder:text-white/60 placeholder:text-black/80 overflow-y-auto focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            style={{ 
              height: editorHeight,
            }}
            suppressContentEditableWarning={true}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <Minimize className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuillEditor;