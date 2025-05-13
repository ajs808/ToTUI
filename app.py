from flask import Flask, request, jsonify
from tot.methods.bfs import solve
from tot.tasks.game24 import Game24Task
import argparse

app = Flask(__name__)

@app.route('/')
def index():
    return "Tree of Thoughts API is running!"

@app.route('/solve', methods=['POST'])
def solve_task():
    data = request.json
    args = argparse.Namespace(
        backend=data.get('backend', 'gpt-4'),
        temperature=data.get('temperature', 0.7),
        task=data.get('task', 'game24'),
        naive_run=data.get('naive_run', False),
        prompt_sample=data.get('prompt_sample', None),
        method_generate=data.get('method_generate', 'propose'),
        method_evaluate=data.get('method_evaluate', 'value'),
        method_select=data.get('method_select', 'greedy'),
        n_generate_sample=data.get('n_generate_sample', 1),
        n_evaluate_sample=data.get('n_evaluate_sample', 3),
        n_select_sample=data.get('n_select_sample', 5)
    )
    task = Game24Task()
    ys, infos = solve(args, task, 900)
    return jsonify({'solution': ys[0], 'steps': infos})

@app.route('/foo', methods=['POST'])
def foo():
    pass

if __name__ == '__main__':
    app.run(debug=True) 