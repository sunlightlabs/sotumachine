from flask import Flask, render_template, request
from sfapp.blueprint import sfapp


# create app

app = Flask(__name__)
app.register_blueprint(sfapp)


# the routes

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True, port=8000)
