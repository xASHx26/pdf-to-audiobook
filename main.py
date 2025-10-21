from google import genai
from google.genai import types
import pathlib
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from gtts import gTTS
from datetime import datetime, timedelta
import sqlite3

# Token tracking database
TOKEN_DB = "token_usage.db"

def init_token_db():
    """Initialize token tracking database"""
    conn = sqlite3.connect(TOKEN_DB)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS token_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            input_tokens INTEGER DEFAULT 0,
            output_tokens INTEGER DEFAULT 0,
            total_tokens INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def add_tokens(input_tokens=0, output_tokens=0):
    """Add token usage to database"""
    try:
        conn = sqlite3.connect(TOKEN_DB)
        cursor = conn.cursor()
        today = datetime.now().strftime("%Y-%m-%d")
        total = input_tokens + output_tokens
        
        # Check if entry exists for today
        cursor.execute("SELECT id, input_tokens, output_tokens FROM token_usage WHERE date = ?", (today,))
        result = cursor.fetchone()
        
        if result:
            row_id, existing_input, existing_output = result
            cursor.execute("""
                UPDATE token_usage 
                SET input_tokens = ?, output_tokens = ?, total_tokens = ?
                WHERE date = ?
            """, (
                existing_input + input_tokens,
                existing_output + output_tokens,
                existing_input + existing_output + total,
                today
            ))
        else:
            cursor.execute("""
                INSERT INTO token_usage (date, input_tokens, output_tokens, total_tokens)
                VALUES (?, ?, ?, ?)
            """, (today, input_tokens, output_tokens, total))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"⚠️ Error adding tokens: {e}")

def get_token_usage(days=7):
    """Get token usage for the last N days"""
    try:
        conn = sqlite3.connect(TOKEN_DB)
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        cursor.execute("""
            SELECT date, input_tokens, output_tokens, total_tokens
            FROM token_usage
            WHERE date >= ?
            ORDER BY date DESC
        """, (start_date,))
        
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                "date": row[0],
                "input_tokens": row[1],
                "output_tokens": row[2],
                "total_tokens": row[3]
            }
            for row in results
        ]
    except Exception as e:
        print(f"⚠️ Error getting token usage: {e}")
        return []

def get_today_tokens():
    """Get today's token usage"""
    try:
        conn = sqlite3.connect(TOKEN_DB)
        cursor = conn.cursor()
        today = datetime.now().strftime("%Y-%m-%d")
        
        cursor.execute("""
            SELECT input_tokens, output_tokens, total_tokens
            FROM token_usage
            WHERE date = ?
        """, (today,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "date": today,
                "input_tokens": result[0],
                "output_tokens": result[1],
                "total_tokens": result[2]
            }
        else:
            return {
                "date": today,
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0
            }
    except Exception as e:
        print(f"⚠️ Error getting today's tokens: {e}")
        return None

def get_api_key():
    """Read API key from .GITIGNORE file or environment variable"""
    # First try environment variable
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        return api_key
    
    # Then try .GITIGNORE file
    try:
        with open('.GITIGNORE', 'r') as file:
            for line in file:
                line = line.strip()
                if line.startswith('api_key='):
                    # Extract key from api_key="KEY" format
                    key = line.split('api_key=')[1].strip().strip('"').strip("'")
                    return key
        return None
    except FileNotFoundError:
        print("⚠️ .GITIGNORE file not found")
        print("💡 Please copy .env.example to .GITIGNORE and add your Google Gemini API key")
        return None
    except Exception as e:
        print(f"⚠️ Error reading API key: {e}")
        return None

api_key = get_api_key()
if not api_key:
    raise ValueError("❌ API key not found in .GITIGNORE file")

# Initialize token tracking database
init_token_db()

client = genai.Client(api_key=api_key)
app = FastAPI(
    title="PDF to Audio Converter API",
    description="Convert PDF documents to audiobooks using AI",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "PDF to Audio Converter API is running!", "status": "active"}

@app.get("/token_usage/")
async def get_token_usage_endpoint(days: int = 7):
    """Get token usage statistics"""
    try:
        usage_history = get_token_usage(days)
        today_usage = get_today_tokens()
        
        total_tokens_all_time = sum(item["total_tokens"] for item in usage_history)
        
        return JSONResponse(
            content={
                "today": today_usage,
                "history": usage_history,
                "total_all_time": total_tokens_all_time,
                "daily_limit": 1000000,  # Adjust based on your plan
                "limit_remaining": max(0, 1000000 - total_tokens_all_time)
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"❌ Error fetching token usage: {str(e)}"}
        )

@app.post("/uploadfile/")
async def pdf_upload(file: UploadFile):
    if file.content_type != "application/pdf":
        return JSONResponse(
            status_code=400,
            content={"message": "❌ Invalid file type. Please upload a PDF file."}
        )

    file_path = os.path.join("pdf", file.filename)
    file_copy = open(file_path, "wb")
    file_copy.write(file.file.read())
    file_copy.close()
    return JSONResponse(
        content={
            "message": "✅ File uploaded successfully!",
            "filename": file.filename
        }
    )

@app.get("/read_pdf/")
async def read_pdf(file_name: str = None):
    try:
        pdf_files = [os.path.join("pdf", f) for f in os.listdir("pdf") if f.lower().endswith(".pdf")]
        if not pdf_files:
            return JSONResponse(
                status_code=404,
                content={"message": "❌ No PDF files found in the 'pdf' folder."}
            )
        pdf_files.sort(key=os.path.getmtime, reverse=True)
        last_pdf = pdf_files[0]
        file_stat = os.stat(last_pdf)
        file_size = file_stat.st_size

        return JSONResponse(
            content={
                "message": "✅ Last uploaded PDF found successfully!",
                "last_uploaded_pdf": os.path.basename(last_pdf),
                "path": last_pdf,
                "file_size_bytes": file_size,
                "file_size_mb": round(file_size / (1024 * 1024), 2),
                "total_pdf_files": len(pdf_files)
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"❌ Error reading PDF files: {str(e)}"}
        )

@app.get("/analyze_pdf/")
async def analyze_pdf(is_research_paper: bool = None):
    try:
        pdf_info = await read_pdf()

        if hasattr(pdf_info, 'status_code') and pdf_info.status_code != 200:
            return pdf_info

        pdf_data = pdf_info.body.decode() if hasattr(pdf_info, 'body') else None
        if pdf_data:
            pdf_json = json.loads(pdf_data)
            pdf_file_path = pdf_json.get('path')
            filename = pdf_json.get('last_uploaded_pdf')
        else:
            pdf_files = [os.path.join("pdf", f) for f in os.listdir("pdf") if f.lower().endswith(".pdf")]
            if not pdf_files:
                return JSONResponse(
                    status_code=404,
                    content={"message": "❌ No PDF files found to analyze."}
                )
            pdf_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
            pdf_file_path = pdf_files[0]
            filename = os.path.basename(pdf_file_path)

        filepath = pathlib.Path(pdf_file_path)

        prompt = """
        PLEASE ANALYZE THE CONTENT OF THE PDF.
        Determine if this is a research paper or not.
        
        Look for these characteristics of research papers:
        - Abstract section
        - Introduction, methodology, results, conclusion sections
        - References/bibliography
        - Academic writing style
        - Citations and references to other papers
        
        Respond with ONLY:
        - "YES" if it is a research paper
        - "NO" if it is not a research paper
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[
                types.Part.from_bytes(
                    data=filepath.read_bytes(),
                    mime_type='application/pdf',
                ),
                prompt
            ]
        )

        # Track token usage
        if hasattr(response, 'usage_metadata'):
            add_tokens(
                input_tokens=response.usage_metadata.input_tokens,
                output_tokens=response.usage_metadata.output_tokens
            )

        ai_response = response.text.strip().upper()
        is_research_paper = "YES" in ai_response

        return JSONResponse(
            content={
                "message": "✅ PDF analysis completed successfully!",
                "filename": filename,
                "is_research_paper": is_research_paper,
                "ai_response": response.text.strip(),
                "analysis_details": {
                    "file_analyzed": filename,
                    "file_size_mb": round(os.path.getsize(pdf_file_path) / (1024 * 1024), 2)
                }
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"❌ Error analyzing PDF: {str(e)}"}
        )

@app.get("/summarize_pdf/")
async def summarize_pdf():
    try:
        pdf_info = await read_pdf()

        if hasattr(pdf_info, 'status_code') and pdf_info.status_code != 200:
            return pdf_info

        pdf_data = pdf_info.body.decode() if hasattr(pdf_info, 'body') else None
        if pdf_data:
            pdf_json = json.loads(pdf_data)
            pdf_file_path = pdf_json.get('path')
            filename = pdf_json.get('last_uploaded_pdf')
        else:
            pdf_files = [os.path.join("pdf", f) for f in os.listdir("pdf") if f.lower().endswith(".pdf")]
            if not pdf_files:
                return JSONResponse(
                    status_code=404,
                    content={"message": "❌ No PDF files found to summarize."}
                )
            pdf_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
            pdf_file_path = pdf_files[0]
            filename = os.path.basename(pdf_file_path)

        filepath = pathlib.Path(pdf_file_path)

        
        analysis_result = await analyze_pdf()

        
        try:
            if hasattr(analysis_result, 'body') and analysis_result.body:
                body_content = analysis_result.body
                if isinstance(body_content, bytes):
                    body_content = body_content.decode()
                analysis_data = json.loads(body_content)
                is_research_paper = analysis_data.get('is_research_paper', False)
            else:
                response_content = getattr(analysis_result, '_content', None)
                if response_content:
                    if isinstance(response_content, bytes):
                        response_content = response_content.decode()
                    analysis_data = json.loads(response_content)
                    is_research_paper = analysis_data.get('is_research_paper', False)
                else:
                    is_research_paper = False
        except Exception as parse_error:
            print(f"Error parsing analysis result: {parse_error}")
            return JSONResponse(
                status_code=400,
                content={"message": f"❌ PDF validation failed. Not a valid PDF file."}
            )
        
        
        if not is_research_paper:
            return JSONResponse(
                status_code=400,
                content={"message": "❌ PDF is not a valid research paper. Summarization skipped to save tokens."}
            )

        if is_research_paper:
            prompt = """
            PLEASE SUMMARIZE THE CONTENT OF THIS RESEARCH PAPER PDF IN A WAY THAT WOULD SUIT AN AUDIOBOOK.
            The summary should be engaging, clear, and concise, highlighting the key points and findings.
            
            Guidelines for Research Papers:
            - Do not use AI terms like "this is a research paper" or "as an AI model"
            - Summarize like a human would for an audiobook
            - Be straightforward and conversational
            - Explain each point well with clear transitions
            - Explain scientific terms very clearly and simply
            - Use examples where necessary to illustrate complex concepts
            - Cover: background, methodology, key findings, conclusions, and implications
            - Structure it with clear sections and flow
            - Make it engaging for audio listening
            
            Format the summary with clear sections and smooth transitions between ideas.
            """
        else:
            prompt = """
            PLEASE SUMMARIZE THE CONTENT OF THIS PDF DOCUMENT IN A WAY THAT WOULD SUIT AN AUDIOBOOK.
            The summary should be engaging, clear, and concise, highlighting the main topics and key information.
            
            Guidelines for General Documents:
            - Do not use AI terms or mention that this is an AI summary
            - Summarize like a human would for an audiobook
            - Be straightforward and conversational
            - Explain each main point clearly with smooth transitions
            - Break down complex topics into simple, understandable language
            - Use examples where helpful to illustrate concepts
            - Structure it logically with clear flow between topics
            - Make it engaging and easy to follow for audio listening
            - Focus on the most important information and practical insights
            
            Format the summary with clear sections and smooth transitions between ideas.
            """

        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[
                types.Part.from_bytes(
                    data=filepath.read_bytes(),
                    mime_type='application/pdf',
                ),
                prompt
            ]
        )

        # Track token usage
        if hasattr(response, 'usage_metadata'):
            add_tokens(
                input_tokens=response.usage_metadata.input_tokens,
                output_tokens=response.usage_metadata.output_tokens
            )

        return JSONResponse(
            content={
                "message": "✅ PDF summarized successfully!",
                "filename": filename,
                "is_research_paper": is_research_paper,
                "summary": response.text.strip(),
                "summary_details": {
                    "word_count": len(response.text.split()),
                    "file_analyzed": filename,
                    "file_size_mb": round(os.path.getsize(pdf_file_path) / (1024 * 1024), 2)
                }
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"❌ Error summarizing PDF: {str(e)}"}
        )

@app.get("/generate_audio_book/")
async def generate_audio_book():

    try:
 
        os.makedirs("audio", exist_ok=True)
        

        summary_response = await summarize_pdf()
        

        if hasattr(summary_response, 'body'):

            summary_data = json.loads(summary_response.body.decode())
        else:

            summary_data = summary_response
        

        if 'summary' not in summary_data:
            return JSONResponse(
                status_code=400,
                content={"message": "❌ Failed to get summary for audio generation"}
            )
        
        text = summary_data['summary']
        filename = summary_data.get('filename', 'unknown.pdf')
        

        language = 'en'
        myobj = gTTS(text=text, lang=language, slow=False)
        

        audio_filename = f"audiobook_{filename.replace('.pdf', '')}.mp3"
        audio_path = os.path.join("audio", audio_filename)
        
        myobj.save(audio_path)
        
        return JSONResponse(
            content={
                "message": "✅ Audio book generated successfully!",
                "source_pdf": filename,
                "audio_file": audio_filename,
                "audio_path": audio_path,
                "text_length": len(text),
                "word_count": len(text.split()),
                "download_url": f"/download_audio_book/{audio_filename}"
            }
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"❌ Error generating audio book: {str(e)}"}
        )

@app.get("/download_audio_book/")
async def download_audio_book():

    try:

        if not os.path.exists("audio"):
            return JSONResponse(
                status_code=404,
                content={"message": "❌ No audio files found. Please generate audio book first."}
            )
        

        audio_files = [f for f in os.listdir("audio") if f.endswith(".mp3")]
        
        if not audio_files:
            return JSONResponse(
                status_code=404,
                content={"message": "❌ No audio files found. Please generate audio book first."}
            )
        

        audio_files.sort(key=lambda x: os.path.getmtime(os.path.join("audio", x)), reverse=True)
        latest_audio = audio_files[0]
        audio_path = os.path.join("audio", latest_audio)
        

        return FileResponse(
            path=audio_path,
            filename=latest_audio,
            media_type='audio/mpeg',
            headers={"Content-Disposition": f"attachment; filename={latest_audio}"}
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"❌ Error downloading audio book: {str(e)}"}
        )

@app.get("/play_audio_book/")
async def play_audio_book():

    try:

        if not os.path.exists("audio"):
            return JSONResponse(
                status_code=404,
                content={"message": "❌ No audio files found. Please generate audio book first."}
            )

        audio_files = [f for f in os.listdir("audio") if f.endswith(".mp3")]
        
        if not audio_files:
            return JSONResponse(
                status_code=404,
                content={"message": "❌ No audio files found. Please generate audio book first."}
            )

        audio_files.sort(key=lambda x: os.path.getmtime(os.path.join("audio", x)), reverse=True)
        latest_audio = audio_files[0]
        audio_path = os.path.join("audio", latest_audio)

        return FileResponse(
            path=audio_path,
            filename=latest_audio,
            media_type='audio/mpeg'
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"❌ Error playing audio book: {str(e)}"}
        )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)