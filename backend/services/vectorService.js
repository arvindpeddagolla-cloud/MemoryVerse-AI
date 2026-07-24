import { genAI } from '../config/gemini.js';
import dotenv from 'dotenv';

dotenv.config();

// Simple in-memory fallback vector store for demo simulation
let localVectorIndex = [];

export const generateEmbedding = async (text) => {
  if (genAI) {
    try {
      console.log('Generating vector embeddings via Gemini text-embedding-004...');
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Failed to generate embedding with Gemini API:', error.message);
    }
  }

  // Fallback: Generate a pseudo-embedding vector based on word frequencies
  // This maintains structural compatibility (arrays of floats) for testing
  const vectorSize = 384;
  const pseudoVector = new Array(vectorSize).fill(0);
  const words = text.toLowerCase().split(/\W+/);
  
  // Hash words to vector dimensions
  words.forEach(word => {
    if (!word) return;
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % vectorSize;
    pseudoVector[index] += 1;
  });

  // Normalize the pseudo-vector
  const magnitude = Math.sqrt(pseudoVector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vectorSize; i++) {
      pseudoVector[i] = pseudoVector[i] / magnitude;
    }
  }

  return pseudoVector;
};

export const indexDocumentForSearch = async (docId, userId, text, metadata) => {
  const contentToEmbed = `
    Title: ${metadata.title}
    Category: ${metadata.category}
    Organization: ${metadata.organization}
    Skills: ${metadata.skills.join(', ')}
    Technologies: ${metadata.technologies.join(', ')}
    Summary: ${metadata.summary}
    Text: ${text}
  `;

  const embedding = await generateEmbedding(contentToEmbed);

  // Store in our local index for simulation
  localVectorIndex = localVectorIndex.filter(item => item.docId !== docId);
  localVectorIndex.push({
    docId,
    userId,
    embedding,
    metadata
  });

  console.log(`Document ${docId} indexed for semantic search.`);
  return true;
};

export const performSemanticSearch = async (userId, queryText, documentsList) => {
  if (!queryText) return documentsList;

  console.log(`Performing semantic search for query: "${queryText}"`);
  const queryEmbedding = await generateEmbedding(queryText);

  // We perform cosine similarity matching against either:
  // 1. Documents in our localVectorIndex
  // 2. Or, if index is empty, we index the documents list on the fly and perform matching!
  
  // Index on the fly if needed
  const userIndex = localVectorIndex.filter(item => item.userId === userId);
  const itemsToSearch = userIndex.length > 0 ? userIndex : await Promise.all(
    documentsList.map(async (doc) => {
      const content = `${doc.title} ${doc.category} ${doc.organization} ${doc.skills.join(' ')} ${doc.summary}`;
      const emb = await generateEmbedding(content);
      return {
        docId: doc.id,
        userId,
        embedding: emb,
        metadata: doc
      };
    })
  );

  // Calculate cosine similarity
  const scoredDocs = itemsToSearch.map(item => {
    let dotProduct = 0;
    let queryMag = 0;
    let docMag = 0;

    for (let i = 0; i < queryEmbedding.length; i++) {
      dotProduct += queryEmbedding[i] * item.embedding[i];
      queryMag += queryEmbedding[i] * queryEmbedding[i];
      docMag += item.embedding[i] * item.embedding[i];
    }

    const similarity = docMag > 0 && queryMag > 0 
      ? dotProduct / (Math.sqrt(queryMag) * Math.sqrt(docMag)) 
      : 0;

    return {
      docId: item.docId,
      similarity
    };
  });

  // Sort by similarity score descending
  scoredDocs.sort((a, b) => b.similarity - a.similarity);

  // Map back to document objects, filtering out documents with extremely low matching scores
  // If query is very specific, we threshold at 0.05 similarity
  const matchedDocIds = scoredDocs
    .filter(item => item.similarity > 0.05)
    .map(item => item.docId);

  // Return documents in the sorted relevance order
  return matchedDocIds
    .map(id => documentsList.find(d => d.id === id))
    .filter(Boolean);
};
