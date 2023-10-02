// 1. Import necessary modules and libraries
import { OpenAI } from 'langchain/llms';
import { RetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 2. Load environment variables
dotenv.config();

// 3. Set up input data and paths
const folderPath = "./data2chart";  // Assuming all your txt files are in a "texts" folder

const article =`Article #32596 - 1.5 PEM fan harness damage
Description
Damage to the electrical harness or fuse supplying the PEM fan is causing DFC pole fan alerts.
Steps to Test
1. Component activate the PEM fan using MTS and check for fan operation.
2. Measure voltage at RHC 9 pins 1 & 2 (+ / - ).
3. Check the PEM fan fuse.
4. Inspect the fan harness. Check for corrosion, shorts to power/ground, etc between RHC 9 (PEM fan) and
RHC 12 (PEM logic).
Steps to Fix
Replace fuse or repair harness. If confirmed to be a problem internal to the PEM (not serviceable) then replace the
PEM.
`
const request = `SOURCE: """ ${article}""" please generate DIAGRAM code.`;
const VECTOR_STORE_PATH = `data2chart.index`;  // Name the vector store based on the whole folder


// 4. Define the main function handleEmbeddings
export const handleEmbeddings = async () => {
  // 5. Initialize the OpenAI model with an empty configuration object
  const model = new OpenAI({});

  // 6. Check if the vector store file exists
  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // 6.1. If the vector store file exists, load it into memory
    console.log('Vector Exists..');
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  } else {
    // 6.2. If the vector store file doesn't exist, create it
    // 6.2.1. Read the input text file
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.txt'));
    // 6.2.2. Read all the files and store their contents in an array
    let allTexts = [];
    for (let file of files) {
        let content = fs.readFileSync(`${folderPath}/${file}`, 'utf8');
        allTexts.push(content);
    }
    // 6.2.3. Create a RecursiveCharacterTextSplitter with a specified chunk size
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    // 6.2.4. Split the input texts into documents
    const docs = await textSplitter.createDocuments(allTexts);  // Process all texts

     // 6.2.5. Create a new vector store from the documents using OpenAIEmbeddings
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

     // 6.2.6. Save the vector store to a file
    await vectorStore.save(VECTOR_STORE_PATH);
  }

  // 7. Create a RetrievalQAChain by passing the initialized OpenAI model and the vector store retriever
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  // 8. Call the RetrievalQAChain with the input question, and store the result in the 'res' variable
  const res = await chain.call({
    query: request,
  });
  

  // 9. Log the result to the console
  console.log({ res });

  //10 Save to Output.txt
  let cleanedText = res.text.split('\n').join(' ');

  // Save the cleaned text to output1_.txt
  fs.writeFileSync('output1.txt', cleanedText);  

};

// 10. Execute the main function runWithEmbeddings
handleEmbeddings();
