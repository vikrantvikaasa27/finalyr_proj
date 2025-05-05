from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import tempfile
import PyPDF2
from flask_cors import CORS
import json
import dotenv
import os
from langchain_nvidia_ai_endpoints import ChatNVIDIA
import google.generativeai as genai
import speech_recognition as sr
from pydub import AudioSegment
import io
from groq import Groq
audio_client = Groq()

# Load environment variables (API keys, etc.)
dotenv.load_dotenv()
api_key=os.getenv('GOOGLE_API_KEY')
# Configure Google Gemini API key
genai.configure(api_key=api_key) 

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure DeepSeek AI with LangChain
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
client = ChatNVIDIA(
    model="deepseek-ai/deepseek-r1",
    api_key=NVIDIA_API_KEY,
    temperature=0.6,
    top_p=0.7,
    max_tokens=4096,
)

# File upload configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

def transcribe_audio(audio_data):
    """Transcribe audio using Groq's Whisper API"""
    try:
        # Save audio data to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name

        # Initialize Groq client
        
        
        # Transcribe using Groq's Whisper API
        with open(temp_file_path, "rb") as file:
            transcription = audio_client.audio.transcriptions.create(
                file=(temp_file_path, file.read()),
                model="whisper-large-v3",
                response_format="verbose_json",
            )
            text = transcription.text
            print(f"Transcribed text: {text}")

        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return text
    except Exception as e:
        print(f"Error in transcription: {str(e)}")
        return f"Error transcribing audio: {str(e)}"

def generate_interview_questions(resume_text, job_description):
    """Generate interview questions based on resume and job description using Google's Gemini model"""
    prompt = f"""
    Based on the following resume and job description, generate 10-15 relevant interview questions.
    The questions should cover technical skills, experience, and behavioral aspects.
    
    RESUME:
    {resume_text}
    
    JOB DESCRIPTION:
    {job_description}
    
    Return the questions as a JSON array in this exact format:
    {{
        "questions": [
            "question 1",
            "question 2",
            ...
        ]
    }}
    
    IMPORTANT: Your response must be ONLY the JSON object with no additional text, markdown formatting, or explanations.
    """
    
    # Initialize Gemini model
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    try:
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Extract the text from the response
        response_text = response.text
        
        # Clean the response - remove any markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse the JSON response
        questions = json.loads(response_text)
        return questions["questions"]
        
    except Exception as e:
        print(f"Error generating questions with Gemini: {str(e)}")
        print(f"Raw response: {response.text if 'response' in locals() else 'No response'}")
        # Fallback questions if parsing fails
        return [
            "Tell me about yourself.",
            "What are your greatest strengths?",
            "What are your weaknesses?",
            "Why are you interested in this position?",
            "Where do you see yourself in 5 years?",
            "Describe a challenging project you worked on.",
            "How do you handle stress and pressure?",
            "What is your preferred work environment?",
            "How do you stay updated with industry trends?",
            "What are your salary expectations?"
        ]

def analyze_answer(question, answer):
    """Analyze the answer using Google's Gemini model"""
    prompt = f"""
    Analyze the following interview answer and provide feedback:
    
    Question: {question}
    Answer: {answer}
    
    Provide feedback in this exact JSON format:
    {{
        "clarity": [score from 1-10],
        "relevance": [score from 1-10],
        "confidence": [score from 1-10],
        "feedback": "detailed feedback about the answer",
        "suggestions": ["suggestion 1", "suggestion 2", ...]
    }}
    
    IMPORTANT: Your response must be ONLY the JSON object with no additional text, markdown formatting, or explanations.
    """
    
    # Initialize Gemini model
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    try:
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Extract the text from the response
        response_text = response.text
        
        # Clean the response - remove any markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse the JSON response
        return json.loads(response_text)
    except Exception as e:
        print(f"Error analyzing answer with Gemini: {str(e)}")
        print(f"Raw response: {response.text if 'response' in locals() else 'No response'}")
        return {
            "clarity": 5,
            "relevance": 5,
            "confidence": 5,
            "feedback": "Unable to analyze the answer properly.",
            "suggestions": ["Try to be more specific in your answers.", "Provide more concrete examples."]
        }

@app.route('/api/start-interview', methods=['POST'])
def start_interview():
    """Start a new mock interview session"""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        resume_file = request.files['resume']
        job_description = request.form.get('job_description', '')
        
        if resume_file.filename == '':
            return jsonify({'error': 'No resume file selected'}), 400
        
        if not allowed_file(resume_file.filename):
            return jsonify({'error': 'Only PDF files are supported'}), 400
        
        # Save and process resume
        filename = secure_filename(resume_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        resume_file.save(file_path)
        
        try:
            resume_text = extract_text_from_pdf(file_path)
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Generate interview questions
        questions = generate_interview_questions(resume_text, job_description)
        
        return jsonify({
            'first_question': questions[0],
            'total_questions': len(questions),
            'questions': questions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    """Submit and analyze an answer to an interview question"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        question = request.form.get('question')
        question_index = int(request.form.get('question_index', 0))
        
        # Check if audio file is empty
        if audio_file.filename == '':
            return jsonify({'error': 'No audio file selected'}), 400
        
        # Transcribe audio
        audio_data = audio_file.read()
        if not audio_data:
            return jsonify({'error': 'Audio file is empty'}), 400
            
        transcribed_text = transcribe_audio(audio_data)
        
        # Check if transcription failed
        if transcribed_text.startswith("Error"):
            return jsonify({
                'error': transcribed_text,
                'transcribed_text': "Could not transcribe audio. Please try again."
            }), 400
        
        # Analyze answer
        analysis = analyze_answer(question, transcribed_text)
        
        # Determine if interview is complete
        is_complete = question_index >= 9  # Assuming 10 questions total
        
        if is_complete:
            # Generate final feedback
            feedback = {
                'overall_feedback': "You've completed the mock interview! Here's your overall performance analysis.",
                'confidence_score': analysis['confidence'] * 10,
                'improvements': analysis['suggestions']
            }
            return jsonify({
                'transcribed_text': transcribed_text,
                'analysis': analysis,
                'feedback': feedback
            })
        else:
            return jsonify({
                'transcribed_text': transcribed_text,
                'analysis': analysis,
                'next_question': f"Question {question_index + 2}"  # Placeholder for next question
            })
        
    except Exception as e:
        print(f"Error in submit_answer: {str(e)}")
        return jsonify({'error': str(e)}), 500

def analyze_resume_with_deepseek(resume_text, job_description=""):
    """
    Analyze resume text using DeepSeek AI model through LangChain.
    Returns structured analysis including ATS score, skills gap, and recommendations.
    """
    try:
        # Create appropriate prompt based on whether job description is provided
        if job_description:
            prompt = f"""
            Act as an expert ATS (Applicant Tracking System) analyzer and career coach. I need a detailed analysis of this resume for a specific job.
            
            RESUME:
            {resume_text}
            
            JOB DESCRIPTION:
            {job_description}
            
            Provide a comprehensive analysis in this exact JSON format, without any additional text, markdown formatting, or explanations outside the JSON:
            {{
                "match_score": [a number between 0-100 indicating how well the resume matches the job description],
                "ats_score": [a number between 0-100 indicating how well the resume would perform in ATS systems],
                "summary": [3-4 sentences summarizing key strengths and weaknesses related to this position],
                "matching_skills": [array of specific skills found in BOTH the resume and job description],
                "missing_skills": [array of important skills mentioned in the job description but missing from the resume],
                "improvements": [array of 5-7 specific, actionable recommendations to improve the resume for this job],
                "recommended_jobs": [
                    {{
                        "title": [job title that matches candidate's skills],
                        "company": [example company name],
                        "match_percentage": [number between 70-95],
                        "description": [1-2 sentence job description],
                        "link": ["https://example.com/job" or similar placeholder]
                    }},
                    [2-3 more job recommendations with the same structure]
                ]
            }}
            
            Your response must be just the raw JSON with no other text. Response format must be parseable by Python's json.loads() function.
            """
        else:
            prompt = f"""
            Act as an expert ATS (Applicant Tracking System) analyzer and career coach. I need a detailed analysis of this resume.
            
            RESUME:
            {resume_text}
            
            Provide a comprehensive analysis in this exact JSON format, without any additional text, markdown formatting, or explanations outside the JSON:
            {{
                "match_score": null,
                "ats_score": [a number between 0-100 indicating how well the resume would perform in ATS systems],
                "summary": [3-4 sentences summarizing key strengths and weaknesses of the resume],
                "matching_skills": [],
                "missing_skills": [],
                "improvements": [array of 5-7 specific, actionable recommendations to improve the resume],
                "recommended_jobs": [
                    {{
                        "title": [job title that matches candidate's skills],
                        "company": [example company name],
                        "match_percentage": [number between 70-95],
                        "description": [1-2 sentence job description],
                        "link": ["https://example.com/job" or similar placeholder]
                    }},
                    [3-4 more job recommendations based on skills with the same structure]
                ]
            }}
            
            Your response must be just the raw JSON with no other text. Response format must be parseable by Python's json.loads() function.
            """

        # Send request to DeepSeek AI
        print("Sending prompt to DeepSeek model...")
        response = client.invoke([{"role": "user", "content": prompt}])
        
        # Debug the response
        response_text = response.content
        print(f"Raw DeepSeek response: {response_text[:100]}...") # Print first 100 chars for debugging
        
        # If response is empty or None
        if not response_text or response_text.isspace():
            raise ValueError("Received empty response from DeepSeek model")
        
        # Clean the response - more aggressive cleaning to handle various markdown formats
        cleaned_text = response_text.strip()
        
        # Remove markdown code blocks if present
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text.replace("```json", "", 1)
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text.replace("```", "", 1)
        
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        cleaned_text = cleaned_text.strip()
        
        # Try to find JSON content if there's other text around it
        if not cleaned_text.startswith("{"):
            # Look for starting brace
            start_idx = cleaned_text.find("{")
            if start_idx != -1:
                cleaned_text = cleaned_text[start_idx:]
        
        # Find the last closing brace
        if cleaned_text.count("}") > 0:
            end_idx = cleaned_text.rindex("}")
            cleaned_text = cleaned_text[:end_idx+1]
        
        print(f"Cleaned response text: {cleaned_text[:100]}...") # Print first 100 chars
        
        # Try to parse the JSON
        try:
            result = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Problematic text: {cleaned_text}")
            
            # If parsing fails, attempt to create a fallback response
            fallback_response = create_fallback_analysis(resume_text)
            print("Using fallback analysis due to JSON parsing error")
            return fallback_response
        
        # Validate that the response has the expected structure
        required_fields = ["ats_score", "summary", "improvements", "recommended_jobs"]
        missing_fields = [field for field in required_fields if field not in result]
        
        if missing_fields:
            print(f"Missing required fields in response: {missing_fields}")
            # If missing crucial fields, use fallback
            if len(missing_fields) > 1:  # If missing more than one field, use fallback
                fallback_response = create_fallback_analysis(resume_text)
                print("Using fallback analysis due to missing fields")
                return fallback_response
            else:
                # Add missing fields with default values
                for field in missing_fields:
                    if field == "ats_score":
                        result["ats_score"] = 70
                    elif field == "summary":
                        result["summary"] = "This resume contains professional experience and skills. Consider formatting improvements for better ATS performance."
                    elif field == "improvements":
                        result["improvements"] = ["Improve keyword optimization", "Enhance formatting for ATS readability", "Add measurable achievements"]
                    elif field == "recommended_jobs":
                        result["recommended_jobs"] = [{
                            "title": "Professional based on resume content",
                            "company": "Example Company",
                            "match_percentage": 75,
                            "description": "Role matching candidate's experience and skills",
                            "link": "https://example.com/job"
                        }]
        
        return result
        
    except Exception as e:
        print(f"Error in DeepSeek analysis: {str(e)}")
        # Use fallback analysis instead of re-raising
        fallback_response = create_fallback_analysis(resume_text)
        print("Using fallback analysis due to exception")
        return fallback_response

def create_fallback_analysis(resume_text):
    """Create a simple fallback analysis when the AI model fails"""
    # Extract some basic info from the resume to personalize the fallback
    resume_lower = resume_text.lower()
    
    # Try to identify some skills (very basic approach)
    potential_skills = []
    for skill in ["python", "javascript", "react", "node", "sql", "java", "c++", "management", 
                 "leadership", "communication", "project management", "analysis", "research",
                 "marketing", "sales", "customer service", "data analysis", "engineering"]:
        if skill in resume_lower:
            potential_skills.append(skill.title())
    
    # Limit to 5 skills
    identified_skills = potential_skills[:5] if potential_skills else ["Professional Skills"]
    
    return {
        "match_score": None,
        "ats_score": 75,
        "summary": "This resume appears to contain relevant professional experience. To provide a more detailed analysis, we recommend reviewing the resume manually for specific strengths and improvement areas.",
        "matching_skills": [],
        "missing_skills": [],
        "improvements": [
            "Ensure consistent formatting throughout the document",
            "Add measurable achievements with specific metrics",
            "Include relevant keywords for your target roles",
            "Optimize the resume's structure for ATS readability",
            "Consider adding a concise professional summary"
        ],
        "recommended_jobs": [
            {
                "title": f"{identified_skills[0] if identified_skills else 'Professional'} Specialist",
                "company": "Example Company",
                "match_percentage": 85,
                "description": "Role utilizing professional experience and skills from resume",
                "link": "https://example.com/job1"
            },
            {
                "title": f"Senior {identified_skills[1] if len(identified_skills) > 1 else 'Professional'}",
                "company": "Sample Organization",
                "match_percentage": 80,
                "description": "Position matching candidate background and expertise",
                "link": "https://example.com/job2"
            }
        ]
    }

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    """
    API endpoint to analyze a resume PDF and optional job description.
    Returns detailed analysis using Google's Gemini model.
    """
    # Enable detailed error output for debugging
    detailed_errors = True
    
    try:
        # Check if resume file is present in request
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        resume_file = request.files['resume']
        
        # Check if filename is empty
        if resume_file.filename == '':
            return jsonify({'error': 'No resume file selected'}), 400
        
        # Check if file is allowed
        if not allowed_file(resume_file.filename):
            return jsonify({'error': 'Only PDF files are supported'}), 400
        
        # Get job description if provided
        job_description = request.form.get('job_description', '')
        
        # Save the file temporarily
        filename = secure_filename(resume_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        resume_file.save(file_path)
        
        # Extract text from PDF
        try:
            resume_text = extract_text_from_pdf(file_path)
            print(f"Successfully extracted {len(resume_text)} characters from PDF")
            
            # Print a small sample of the text for debugging
            text_sample = resume_text[:200].replace('\n', ' ')
            print(f"Sample of extracted text: {text_sample}...")
        except Exception as pdf_error:
            return jsonify({
                'error': 'Failed to extract text from the PDF',
                'details': str(pdf_error) if detailed_errors else None
            }), 400
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # If resume text extraction failed or is too short
        if not resume_text or len(resume_text) < 100:
            return jsonify({
                'error': 'Could not extract sufficient text from the PDF. Please ensure your PDF contains text and not just images.'
            }), 400
        
        # Analyze the resume using NVIDIA DeepSeek
        try:
            print("Sending resume to NVIDIA DeepSeek for analysis...")
            analysis_result = analyze_resume_with_deepseek(resume_text, job_description)
            print("Successfully received analysis from NVIDIA DeepSeek")
        except Exception as api_error:
            error_message = str(api_error)
            print(f"NVIDIA DeepSeek API Error: {error_message}")
            
            # Instead of failing, provide a basic fallback analysis
            analysis_result = create_fallback_analysis(resume_text)
            print("Using fallback analysis due to API error")
        
        # Return the analysis to the client
        return jsonify(analysis_result)
        
    except Exception as e:
        # Provide detailed error information for debugging
        import traceback
        error_details = traceback.format_exc()
        print(f"Unhandled error: {str(e)}")
        print(f"Traceback: {error_details}")
        
        # Create a basic fallback response
        fallback_result = {
            "ats_score": 70,
            "summary": "We were unable to complete a full analysis of your resume. Please try again later.",
            "improvements": [
                "Ensure your PDF is properly formatted and contains extractable text",
                "Check that your resume is not password protected",
                "Try using a different PDF if the issue persists"
            ],
            "recommended_jobs": [
                {
                    "title": "Professional Position",
                    "company": "Example Company",
                    "match_percentage": 75,
                    "description": "General role suited to your background",
                    "link": "https://example.com/job"
                }
            ]
        }
        
        return jsonify(fallback_result)

if __name__ == '__main__':
    app.run(debug=True)