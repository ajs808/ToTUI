# Tree of Thoughts UI (ToTUI)

A comprehensive implementation of the Tree of Thoughts (ToT) framework with an interactive web interface for visualizing and exploring thought processes in large language model problem-solving.

<img width="1721" height="953" alt="ToTUI (1)" src="https://github.com/user-attachments/assets/4fd75bbb-373f-4f51-b568-2467d4917a1d" />

## Overview

This project implements the Tree of Thoughts methodology from the paper ["Tree of Thoughts: Deliberate Problem Solving with Large Language Models"](https://arxiv.org/abs/2305.10601), providing both a Python backend for running ToT algorithms and a React-based frontend for interactive visualization and exploration.

## Features

### Backend (Python)
- **Multiple Task Support**: Game24, Text Generation, and Crosswords
- **Flexible Search Methods**: BFS (Breadth-First Search) with support for different generation, evaluation, and selection strategies
- **LLM Integration**: Support for GPT-3.5, GPT-4, and GPT-4o models
- **Configurable Parameters**: Temperature, sampling methods, evaluation strategies
- **RESTful API**: Flask-based API for frontend integration
- **Comprehensive Logging**: Detailed logging of search processes and results

### Frontend (React)
- **Interactive Tree Visualization**: Real-time visualization of thought trees using ReactFlow
- **Manual Node Editing**: Edit, expand, and add custom thoughts to nodes
- **Configurable Parameters**: Adjust LLM settings, search parameters, and visualization options
- **Auto-solve Mode**: Automatically expand the best nodes to explore solution paths
- **Modern UI**: Clean, responsive interface with intuitive controls

## Installation

### Prerequisites
- Python 3.7+
- Node.js 16+
- OpenAI API key

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ToTUI
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Set up your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Backend API

Start the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Running the Frontend

In a separate terminal, start the React development server:
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Command Line Interface

Run ToT experiments directly from the command line:

```bash
# Game24 task with BFS
python run.py --task game24 --method_generate propose --method_evaluate value --method_select greedy

# Text generation with sampling
python run.py --task text --method_generate sample --prompt_sample cot

# Crosswords with custom parameters
python run.py --task crosswords --n_generate_sample 5 --n_evaluate_sample 3
```

## Supported Tasks

### Game24
Solve the classic "24" game where you use four numbers and basic arithmetic operations to reach 24.

**Example Input**: `1 2 3 4`
**Example Output**: 
```
1 + 2 = 3 (left: 3 3 4)
3 + 3 = 6 (left: 4 6)
6 * 4 = 24 (left: 24)
(1 + 2 + 3) * 4 = 24
```

### Text Generation
Generate creative text based on prompts using chain-of-thought reasoning.

### Crosswords
Solve crossword puzzles using logical reasoning and word associations.

## Configuration Options

### Generation Methods
- **Sample**: Generate multiple candidate thoughts using sampling
- **Propose**: Generate specific proposals for next steps

### Evaluation Methods
- **Value**: Evaluate thoughts based on their potential value
- **Vote**: Use voting mechanisms to rank thoughts

### Selection Methods
- **Greedy**: Always select the highest-ranked thought
- **Sample**: Probabilistically sample from ranked thoughts

### Search Parameters
- `n_generate_sample`: Number of thoughts to generate per node
- `n_evaluate_sample`: Number of evaluations per thought
- `n_select_sample`: Number of thoughts to select for expansion

## Experiment Logs

Results are automatically saved to the `logs/` directory with detailed information including:
- Search trajectories
- Evaluation scores
- Token usage statistics
- Success rates
