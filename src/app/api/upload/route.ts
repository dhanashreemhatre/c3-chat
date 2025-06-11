// import { NextRequest, NextResponse } from "next/server";
// import pdfParse from "pdf-parse";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs/promises";

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get("file") as File;
//   if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

//   // Save file temporarily
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   const tempPath = `/tmp/${uuidv4()}.pdf`;
//   await fs.writeFile(tempPath, buffer);

//   // Extract text from PDF
//   const data = await pdfParse(buffer);
//   const text = data.text;

//   // Chunk text (simple split, improve as needed)
//   const chunkSize = 1000;
//   const chunks = [];
//   for (let i = 0; i < text.length; i += chunkSize) {
//     chunks.push(text.slice(i, i + chunkSize));
//   }

//   // Vectorize and store in Chroma
//   const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! });
//   const vectorStore = await Chroma.fromTexts(
//     chunks,
//     chunks.map((_, i) => ({ chunkIndex: i, fileName: file.name })),
//     embeddings,
//     { collectionName: `file-${uuidv4()}` }
//   );

//   // Clean up temp file
//   await fs.unlink(tempPath);

//   return NextResponse.json({ success: true });
// }