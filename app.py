from flask import Flask, request, jsonify, send_from_directory
from lark import Lark
import os

app = Flask(__name__, static_folder='frontend', static_url_path='')

# Load grammar from external file
with open("grammar3.lark", "r") as file:
    grammar = file.read()

parser = Lark(grammar, start='start', parser='lalr')

def tree_to_dict(tree):
    if hasattr(tree, 'data'):
        return {
            "name": str(tree.data),
            "children": [
                tree_to_dict(child) if hasattr(child, 'data') else {"name": str(child)}
                for child in tree.children
            ]
        }
    else:
        return {"name": str(tree)}

@app.route('/analyze', methods=['POST'])
def analyze_code():
    data = request.get_json()
    source_code = data.get('sourceCode', '')

    try:
        parse_tree = parser.parse(source_code)
        tree_dict = tree_to_dict(parse_tree)
        return jsonify(tree_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
