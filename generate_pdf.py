import sys
import subprocess

try:
    from fpdf import FPDF
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf"])
    from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=15)
pdf.cell(200, 10, "Welcome to the PDF RAG Chatbot!", ln=1, align='C')
pdf.ln(10)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 8, """This is a sample document created specifically for testing your RAG Chatbot.

About the Chatbot Architecture:
This application is built using a modern full-stack approach. The frontend is powered by React and Vite, providing a fast and responsive user interface. The backend is built with Node.js and Express, handling file uploads and API communication.

How RAG Works Here:
Retrieval-Augmented Generation (RAG) is a technique that gives the AI model access to external knowledge. When a PDF is uploaded, it is broken down into smaller 'chunks' of 500 words each. These chunks are converted into embeddings using Google's generative AI models and stored in ChromaDB, an open-source vector database. 

When you ask a question, your text is also embedded and compared against the chunks in ChromaDB to find the most mathematically similar text. Those relevant chunks are then passed to the Gemini 2.5 Flash model along with your question, ensuring the AI's answer is grounded in this exact document!

Test Questions you can ask:
- What technologies are used for the frontend?
- How large are the chunks that the PDF is broken into?
- Which vector database is being used?
- Can you explain how RAG works based on this text?
""")
pdf.output("c:/Users/BIT/Desktop/pdf-rag-chatbot/sample_document.pdf")
