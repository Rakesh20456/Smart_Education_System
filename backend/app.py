import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import  cross_origin
import os
import PyPDF2
import time
import re

os.environ['GOOGLE_API_KEY'] = "AIzaSyCzQkn88sSSWibG1IrN9U9GrMUntrTEeWo"
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
llm = ChatGoogleGenerativeAI(model='gemini-pro')
template1 = """
    You have to generate 5 MCQs for this topic: {topic}, with options.

    Format should be like this:
    1. Question?
        a. OptionA
        b. OptionB
        c. OptionC
        d. OptionD
    [  
        For example program Use '```' in front and back.
        - eg : ``` Print("Hello World")```
    ]
    Don't need to put '**' in front and back of the question.
"""
template2 = """
    You have to evaluate these MCQs: {mcqs}

    If the answer is wrong, then you have to give the right answer.

    Format should be like this:
    1. Question?
        a. OptionA
        b. OptionB
        c. OptionC
        d. OptionD
        Your answer: <option>
        Correct answer: <option>

    Don't need to put '**' in front and back of the question.
    [  
        For example program Use '```' in front and back.
        - eg : ``` Print("Hello World")```
    ]
    [
        - For Feedback You have to use like this **Feedback:**
        - You dont need to give the sentence you have to return only the number like How many answers will be correct
        eg1 : 4
        eg2 : 5 
        eg3 : 2
    ]
    Also, give some feedback at the end of the MCQs.
"""

template3 = """
    Generate detailed educational content about {title}. Include examples and a clear explanation.
    
    Don't need to user ## or mentioned below example while generate content. 
    For Example: [
        ## Heading ##
        * Definition
        * **Sub Topic ** Definition
    ]
    
    You can use ** for head only.
    For Example: [
        ** Heading **
            Definition
        * Sub topic *
            Definition
    ]
"""

prompt1 = PromptTemplate(input_variables=['topic'], template=template1)
prompt2 = PromptTemplate(input_variables=['mcqs'], template=template2)

chain1 = LLMChain(llm=llm, prompt=prompt1)
chain2 = LLMChain(llm=llm, prompt=prompt2)

app = Flask(__name__)

prompt3 = PromptTemplate(input_variables=['title'], template=template3)
chain3 = LLMChain(llm=llm, prompt= prompt3)

@app.route('/generate-content', methods=['POST'])
@cross_origin(origin='*')
def generate():
    title = request.get_json()
    response = chain3.run(title = title.get('selectedTopic'))
    return jsonify({ 'content': response})

def parse_mcqs(mcq_text):
    mcqs = []
    current_question = None
    code_block = False
    code = []

    for line in mcq_text.split('\n'):
        line = line.strip()
        if re.match(r'^\d+\.', line):
            if current_question:
                if code:
                    current_question['code'] = '\n'.join(code)
                mcqs.append(current_question)
            
            question = line
            if question.startswith('**') and question.endswith('**'):
                question = question[2:-2].strip()
            
            current_question = {'question': question, 'options': {}, 'code': None}
            code = []
            code_block = False
        
        elif re.match(r'^[a-d]\.', line) and current_question:
            option, text = re.split(r'\.', line, 1)
            current_question['options'][option.strip()] = text.strip()
        
        elif '```' in line:
            code_block = not code_block
            continue
        elif code_block:
            code.append(line)

    if current_question:
        if code:
            current_question['code'] = '\n'.join(code)
        mcqs.append(current_question)

    return mcqs

@app.route('/data', methods=['POST'])
@cross_origin(origin='*')
def mcqgen():
    req_data = request.get_json(force=True)
    if not req_data:
        return jsonify({'error': 'Topic is required'}), 400
    
    bot_response = chain1.run(topic=req_data['topic'])
    print("BOT Response:", bot_response)
    
    parsed_mcqs = parse_mcqs(bot_response)
    print("BOT Response:", parsed_mcqs)
    return jsonify({'mcqs': parsed_mcqs})

@app.route('/evaluate', methods=['POST'])
@cross_origin(origin='*')
def evaluate():
    req_data = request.get_json(force=True)
    mcqs = req_data.get('mcqs')
    if not mcqs:
        return jsonify({'error': 'MCQs data is required'}), 400

    formatted_mcqs = format_mcqs_for_prompt(mcqs)

    bot_response = chain2.run(mcqs=formatted_mcqs)
    print("BOT Response:", bot_response)

    parsed_evaluation = parse_evaluation(bot_response)

    return jsonify({'evaluation': parsed_evaluation})

def format_mcqs_for_prompt(mcqs):
    formatted = ""
    for i, mcq in enumerate(mcqs, 1):
        formatted += f"{i}. {mcq['question']}\n"
        for option, text in mcq['options'].items():
            formatted += f"   {option}. {text}\n"
        formatted += f"Your answer: {mcq['selectedAnswer']}\n\n"
    return formatted

def parse_evaluation(evaluation_text):
    evaluations = []
    current_eval = None
    feedback = ""
    collecting_feedback = False
    code_block = False
    code_lines = []

    lines = evaluation_text.split('\n')
    for line in lines:
        line = line.strip()

        if re.match(r'^\d+\.', line):
            if current_eval:
                if code_lines:
                    current_eval['code'] = '\n'.join(code_lines)
                evaluations.append(current_eval)
            current_eval = {'question': line, 'options': [], 'user_answer': '', 'correct_answer': '', 'code': None}
            code_block = False
            code_lines = []
            collecting_feedback = False
        elif re.match(r'^[a-d]\.', line) and current_eval:
            current_eval['options'].append(line)
        elif line.startswith("Your answer:") or line.startswith("**Your answer**:"):
            current_eval['user_answer'] = line.split(":", 1)[1].strip()
        elif line.startswith("Correct answer:") or line.startswith("**Correct answer**:"):
            current_eval['correct_answer'] = line.split(":", 1)[1].strip()
        elif line.startswith("**Feedback:**"):
            collecting_feedback = True
            feedback = re.search(r"\d+", line).group()
        elif collecting_feedback:
            continue
        elif '```' in line:
            code_block = True
            continue
        elif '```' in line and code_block:
            code_block = False
            continue
        
        elif code_block:
            code_lines.append(line)

    if current_eval:
        if code_lines:
            current_eval['code'] = '\n'.join(code_lines)
        evaluations.append(current_eval)

    return {
        'evaluations': evaluations,
        'feedback': feedback.strip()
    }


conversation_history = []
user_data = ""

def bot(conversation_history, user_data, is_first_question=False):
    if is_first_question:
        return "Welcome to the mock interview. Let's begin. Tell me about yourself."

    template = """
    You are an experienced HR professional conducting a general interview round. Your goal is to assess the candidate's skills, experience, and fit for the role based on their resume.

    Resume content:
    {resume}

    Conversation history:
    {history}

    Instructions:
    - Provide a brief suggestion to improve the candidate's previous response. Be constructive and specific.
    - Then, ask only one question at a time and don't repeat same questions, focusing on the most relevant aspects of the candidate's background.
    - Maintain a professional yet engaging tone throughout the interview.

    Question types to include if mentioned in resume:
    - Skills assessment: "Can you elaborate on your experience with [specific skill mentioned in resume]?"
    - "What's the most challenging problem you've solved using [specific skill mentioned in resume]?"
    - "How do you stay updated with the latest developments in [specific skill mentioned in resume]?"
    - Achievement exploration: "I see you [accomplished X]. Can you walk me through how you achieved that?"
    - Project deep-dive: "Tell me more about your role in [specific project from resume]."
    - Behavioral questions: "Describe a situation where you [relevant scenario based on job requirements]."
    - Problem-solving scenarios: "How would you approach [hypothetical situation related to the role]?"
    - Salary Expectation: "What is your salary expectation?"

    If asked to finsh the interview:
    [
        - Thank you for taking this mock interview in our application. Best of luck with your job search!
    ]
    If say irrelevant answer (eg: efnekjf, fakenfjk, no, faen,embarkkkksss):
    [
        - I apologize, but your response doesn't seem to answer the question. Let me repeat: previous_question"
    ]

    Focus on one skill or experience at a time. Keep your responses conversational and avoid repetitive phrasing. Tailor each question to the candidate's unique background and the information they've shared so far.
    Based on the conversation history and resume, provide your suggestion for improvement and then your next question:
    
    Format Must be like this for every response : 

    **Suggestion for improvement:**
        - suggestions

    **Next question:**
        - next question

    """

    history_text = "\n".join([f"Bot: {entry['bot']}\nUser: {entry['user']}" for entry in conversation_history])

    prompt = PromptTemplate(
        input_variables=['history', 'resume'],
        template=template
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    response = chain.run(history=history_text, resume=user_data)

    parts = response.split('\n', 1)
    suggestion = parts[0].strip()
    question = parts[1].strip() if len(parts) > 1 else ""
    
    return f"{suggestion}\n\n{question}"

def extract_text_from_pdf(pdf_file):
    text = ""
    with pdf_file.stream as f:
        pdf_reader = PyPDF2.PdfReader(f)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

resume_data = {
    'content': None,
    'timestamp': None
}

def store_resume(content):
    global resume_data
    resume_data['content'] = content
    resume_data['timestamp'] = time.time()

def is_resume_expired():
    global resume_data
    if resume_data['timestamp'] is None:
        return True
    current_time = time.time()
    elapsed_time = current_time - resume_data['timestamp']
    return elapsed_time > 3600

def clear_expired_resume():
    global resume_data
    if is_resume_expired():
        resume_data = {'content': None, 'timestamp': None}

@app.route('/api/upload-resume', methods=['POST'])
@cross_origin(origin='*')
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and file.filename.lower().endswith('.pdf'):
        resume_content = extract_text_from_pdf(file)
        store_resume(resume_content)
        return jsonify({"message": "Resume uploaded successfully"}), 200
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/chat', methods=['POST'])
@cross_origin(origin='*')
def chat():
    global conversation_history, resume_data
    data = request.json
    user_message = data.get('user')

    clear_expired_resume()

    if resume_data['content'] is None:
        return jsonify({"error": "Please upload a resume first"}), 400

    if user_message is None and not conversation_history:
        bot_response = "Welcome to the mock interview. Let's begin. Tell me about yourself."
        conversation_history.append({'bot': bot_response, 'user': ''})
        return jsonify({"bot_response": bot_response}), 200
    elif user_message is not None:
        if conversation_history:
            conversation_history[-1]['user'] = user_message
        
        bot_response = bot(conversation_history, resume_data['content'])
        conversation_history.append({'bot': bot_response, 'user': ''})
        
        return jsonify({"bot_response": bot_response}), 200
    
    return jsonify({"error": "Invalid request"}), 400


def is_valid_url(url):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code in [200, 301, 302]:
            return True
        return False
    except requests.RequestException as e:
        print(f"URL validation failed for {url}: {e}")
        return False
    
from googletrans import Translator

translator = Translator()

@app.route('/translate', methods=['POST'])
@cross_origin(origin='*')
def translate_text():
    data = request.json
    text = data.get('text')
    target_language = data.get('language')

    if not text or not target_language:
        return jsonify({'error': 'Text and target language are required'}), 400

    translation = translator.translate(text, dest=target_language)
    return jsonify({'translatedText': translation.text})

if __name__ == '__main__':
    app.run(debug=True)