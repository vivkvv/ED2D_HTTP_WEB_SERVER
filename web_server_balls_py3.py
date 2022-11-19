""" This is the main module for flying balls ()electrodynamics 1.5d application """

#from copyreg import dispatch_table
import os.path

from flask import (
    Flask,
    request
)

import jinja2
from jinja2 import meta

template_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.getcwd()))

DISPATCHER_IP = "20.203.227.129"

app = Flask(__name__)

@app.before_request
def before_all_requests():
    """ to check all input requests """
    print(request)

# TODO: It does not work
# Instead I've added functionality to get_main_page
# Fix it!
@app.route('/dispatcher', methods=['GET'])
def set_ip_of_rooms_dispacher(vmIP):
    """ it does not work """
    vm_ip_address = request.args.get('vmIP')


@app.route('/viewGame', methods=['GET', 'POST'])
def get_view_game():
    """ returns view.html with filled parameters """\
    """ view.html is the filling of a frame inside main.html """
    #view_var = __get_variables('view.html')
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
    """ returns the list of possible colormaps """
    template = template_env.get_template('/static/colormaps/colormaps.txt')
    out_html = template.render()
    return out_html

@app.route('/static/colormaps/<path:path>', methods=['GET', 'POST'])
def get_colormap(path):
    """ returns colormap by path """
    template = template_env.get_template('/static/colormaps/' + path)
    out_html = template.render()
    return out_html

@app.route('/static/games/games.txt', methods=['GET', 'POST'])
def get_possible_games():
    """ returns posible games """
    template = template_env.get_template('/static/games/games.txt')
    out_html = template.render()
    return out_html

@app.route('/', methods=['GET', 'POST'])
def get_main_page():
    """ returns main.html with filled parameters """
    global DISPATCHER_IP
    vm_ip = request.args.get('vmIP')
    if vm_ip == "vm":
        DISPATCHER_IP = request.remote_addr
    elif vm_ip is None:
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
