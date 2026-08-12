const { CloudClient } = require("chromadb");

const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE,
});

const COLLECTION_NAME = "pdf_documents";

let collectionPromise = null;

/**
 * Gets (or lazily creates) the single shared Chroma collection
 * used to store chunks from all uploaded PDFs.
 */
function getCollection() {
  if (!collectionPromise) {
    collectionPromise = client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { "hnsw:space": "cosine" },
    });
  }
  return collectionPromise;
}

/**
 * Stores chunk texts + embeddings + metadata into ChromaDB.
 * metadatas[i] should include: { docId, fileName, page }
 */
async function addChunks({ ids, embeddings, documents, metadatas }) {
  const collection = await getCollection();
  await collection.add({ ids, embeddings, documents, metadatas });
}

/**
 * Runs a similarity search against the stored chunks.
 * Optionally filter by docId to search within a single document,
 * or omit to search across all uploaded documents.
 */
async function queryChunks({ queryEmbedding, topK = 5, docId = null }) {
  const collection = await getCollection();
  const where = docId ? { docId } : undefined;

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    where,
  });

  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  return documents.map((text, i) => ({
    text,
    metadata: metadatas[i],
    distance: distances[i],
  }));
}

/**
 * Deletes all chunks belonging to a document.
 */
async function deleteDocument(docId) {
  const collection = await getCollection();
  await collection.delete({ where: { docId } });
}

/**
 * Lists all distinct documents currently stored (by reading metadata).
 */
async function listDocuments() {
  const collection = await getCollection();
  const all = await collection.get({});
  const docsMap = new Map();

  (all.metadatas || []).forEach((meta) => {
    if (meta && meta.docId && !docsMap.has(meta.docId)) {
      docsMap.set(meta.docId, {
        docId: meta.docId,
        fileName: meta.fileName,
        uploadedAt: meta.uploadedAt,
      });
    }
  });

  return Array.from(docsMap.values());
}

module.exports = { addChunks, queryChunks, deleteDocument, listDocuments };
