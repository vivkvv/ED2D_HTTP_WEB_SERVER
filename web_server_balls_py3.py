from copyreg import dispatch_table
from flask import (
    Flask,
    request
)

import jinja2
from jinja2 import meta

import os.path

template_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.getcwd()))

DISPATCHER_IP = "20.203.227.129"

app = Flask(__name__)

@app.before_request
def before_all_requests():
    print(request)

# TODO: It does not work
# Instead I've added functionality to get_main_page
# Fix it!
@app.route('/dispatcher', methods=['GET'])
def set_ip_of_rooms_dispacher(vmIP):
    vm_ip = request.args.get('vmIP')
    pass

@app.route('/viewGame', methods=['GET', 'POST'])
def get_view_game():
    view_var = __get_variables('view.html')
    template = template_env.get_template('view.html')
    data = {
        'roomMode': request.args['roomMode'],
        'roomIP': request.args['roomIP'],
        'roomPort': request.args['roomPort'],
        'webRTCGameId': request.args['webRTCGameId']
    }
    out_html = template.render(data)
    return out_html

@app.route('/static/colormaps/colormaps.txt', methods=['GET', 'POST'])
def get_possible_colormaps():
    template = template_env.get_template('/static/colormaps/colormaps.txt')
    out_html = template.render()
    return out_html

@app.route('/static/colormaps/<path:path>', methods=['GET', 'POST'])
def get_colormap(path):
    template = template_env.get_template('/static/colormaps/' + path)
    out_html = template.render()
    return out_html

@app.route('/static/games/games.txt', methods=['GET', 'POST'])
def get_possible_games():
    template = template_env.get_template('/static/games/games.txt')
    out_html = template.render()
    return out_html

@app.route('/', methods=['GET', 'POST'])
def get_main_page():
    global DISPATCHER_IP
    vm_ip = request.args.get('vmIP')
    if(vm_ip == "vm"):
        DISPATCHER_IP = request.remote_addr
    elif(vm_ip is None):
        main_html_var = __get_variables('main.html')
        template = template_env.get_template('main.html')
        data = {list(main_html_var)[0]: DISPATCHER_IP}
        out_html = template.render(data)
        return out_html

def __get_variables(filename):
    template_src = template_env.loader.get_source(template_env, filename)
    template_source = template_src[0]
    parsed_content = template_env.parse(template_source)
    jinja_meta = jinja2.meta
    variables = jinja_meta.find_undeclared_variables(parsed_content)
    return variables


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
