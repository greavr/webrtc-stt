from flask import Flask, render_template, flash, request, redirect

# App Config
app = Flask(__name__)

@app.route("/", methods=['GET', 'POST'])
def default():
    return render_template('index.html')

if __name__ == "__main__":
    #app.run(ssl_context='adhoc')
    app.run(host='0.0.0.0',port=443, ssl_context=('server.crt', 'server.key'))