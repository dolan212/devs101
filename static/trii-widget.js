function trii_init(div_id, tree_json, callback, editable, globals) {
    var widget_data = {};
    var public_data = {};
    /* 
     * BEGIN FUNCTION DEFINITIONS
     * These functions are defined within the trii_init method in order to avoid polluting the public namespace
     * In order for a function to be externally accessible, it must be added to the public_data object, and used
     * with the object passed to the callback
     */
    function refresh_globals() {
        widget_data.global_div.innerHTML = '<h3 style="text-align:center;">Global Variables</h3>';
        if(widget_data.globals !== undefined) {
            var details_div = document.createElement("div");
            details_div.style.padding = "5px";
            Object.keys(widget_data.globals).forEach(function(key, index) {
                var p = document.createElement('p');
                p.innerHTML = `<b>${key}:</b> ${widget_data.globals[key]}`;
                details_div.appendChild(p);
            });
            widget_data.global_div.appendChild(details_div);
        }
    }
    function node_select_handler(evt) {
        widget_data.cy.nodes().not(evt.target).unselect();
        var node = findNode(evt.target.id());
        displayNodeDetails(node);
    }
    function node_deselect_handler(evt) {
        while(widget_data.info_div.firstChild)
            widget_data.info_div.removeChild(widget_data.info_div.firstChild);
    }
    function findNode(id) {
        var node = null;
        widget_data.tree.nodes.forEach(function(item) {
            if(item._id == id) {
                node = item;
            }
        });
        return node;
    }
    function loadJSON(json, callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', json, true);
        xobj.onreadystatechange = function() {
            if(xobj.readyState == 4 && xobj.status == "200") {
                callback(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    }
    function displayNodeDetails(node) {
        widget_data.info_div.innerHTML = `<h3 style="text-align:center;">Skill ${node._id}</h3>`;
        var details_div = document.createElement("div");
        details_div.style.padding = "5px";
        var name = document.createElement("p");
        name.innerHTML = `<b>Name:</b> ${node._label}`;
        var desc = document.createElement("p");
        desc.innerHTML = `<b>Description:</b> ${node._description}`;
        details_div.appendChild(name);
        details_div.appendChild(desc);
        var skillpoints;
        node.rules.forEach(function(item) {
            if(item.type == "skillpoint") {
                if(!skillpoints) skillpoints = document.createElement("p");
                skillpoints.innerHTML = `<b>Skillpoints:</b> ${item.skillpoints}`;
                node.skillpoints = parseInt(item.skillpoints);
            }
        });
        if(skillpoints) details_div.appendChild(skillpoints);
        widget_data.info_div.appendChild(details_div);
        var buy_div = document.createElement("div");
        buy_div.style.width = "100%";
        buy_div.style.position = "relative";
        buy_div.style.bottom = 0;
        buy_div.style.display = "flex";
        var times_bought = document.createElement("span");
        times_bought.style.width = "60%";
        times_bought.style.textAlign = "center";
        
        buy_div.style.position = "absolute";
        buy_div.style.bottom = 0;
        var num_bought = 0;
        if(widget_data.times_bought) {
            if(widget_data.times_bought[node._id])
                num_bought = widget_data.times_bought[node._id];
        }
        if(editable) {
            var minus_button = document.createElement("button");
            minus_button.innerHTML = "-";
            minus_button.style.width = "20%";
            minus_button.style.color = "red";
            var plus_button = document.createElement("button");
            plus_button.innerHTML = "+";
            plus_button.style.width = "20%";
            plus_button.style.color = "green";
            buy_div.appendChild(minus_button);
            buy_div.appendChild(times_bought);
            buy_div.appendChild(plus_button);
        }
        else {
            times_bought.style.width = "100%";
            buy_div.appendChild(times_bought);
        }
        
        widget_data.info_div.appendChild(buy_div);
        var error = document.createElement("span");
        error.style.color = "red";
        widget_data.info_div.appendChild(error);

        function refresh() {
            if(editable) {
                if(num_bought >= node.max_times) plus_button.disabled = true;
                else plus_button.disabled = false;

                if(num_bought <= 0) minus_button.disabled = true;
                else minus_button.disabled = false;
            }
            times_bought.innerHTML = `${num_bought}/${node.max_times}`;
            error.innerHTML = '';
            refresh_label(node);
            refresh_globals();
            refresh_edges(node);
        }
        refresh();

        if(editable) {
            plus_button.onclick = function(evt) {
                try {
                    num_bought = buy_skill(node);
                    refresh();
                } catch(exception) {
                    error.innerHTML = exception;
                }
            }

            minus_button.onclick = function(evt) {
                try {
                    num_bought = sell_skill(node);
                    refresh();
                } catch(exception) {
                    error.innerHTML = exception;
                }
            }
        }
    }
    function buy_skill(node) {
        if(!editable) throw "Tree is not editable";
        var dep = check_dependencies(node);
        if(!dep) throw "You have not yet bought all the dependencies";
        //check skillpoints
        var sp = widget_data.globals['skillpoints'];
        if(sp < node.skillpoints) throw "You do not have enough skillpoints";
        if(widget_data.times_bought) {
            if(widget_data.times_bought[node._id]) {
                if(widget_data.times_bought[node._id] >= node.max_times)
                    throw "You have reached the maximum amount of times you can buy this skill";
                else  {
                    widget_data.times_bought[node._id]++;
                    widget_data.globals['skillpoints'] -= node.skillpoints;
                }
            }
            else {
                widget_data.times_bought[node._id] = 1;
                widget_data.globals['skillpoints'] -= node.skillpoints;
            }
        } else {
            widget_data.times_bought = [];
            widget_data.times_bought[node._id] = 1;
            widget_data.globals['skillpoints'] -= node.skillpoints;
        }
        return widget_data.times_bought[node._id];
    }
    function sell_skill(node) {
        if(!editable) throw "Tree is not editable";
        if(!widget_data.times_bought) throw "You have not purchased this skill";
        if(!widget_data.times_bought[node._id] || widget_data.times_bought[node._id] <= 0) throw "You have not purchased this skill";
        widget_data.times_bought[node._id]--;
        widget_data.globals['skillpoints'] += node.skillpoints;
        return widget_data.times_bought[node._id];
    }
    function check_dependencies(node) {
        var valid = true;
        node.rules.forEach(function(item) {
            if(item.type == 'dependency') {
                if(!widget_data.times_bought || !widget_data.times_bought[item.node] || widget_data.times_bought[item.node] <= 0) valid = false;
            }
        });
        return valid;
    }
    function get_times_bought() {
        return widget_data.times_bought;
    }
    function refresh_label(node) {
        var cy_node = widget_data.cy.$(`#${node._id}`);
        var times_bought = widget_data.times_bought[node._id] ? widget_data.times_bought[node._id] : 0;
        cy_node.data('label', `${node._label} (${times_bought}/${node.max_times})`);
    }
    function refresh_edges(node) {
            if(widget_data.times_bought[node._id] && widget_data.times_bought[node._id] > 0) {
                widget_data.tree.edges.forEach(function(edge) {
                    var cy_edge = widget_data.cy.$(`#${edge._id}`);
                    if(edge._source == node._id) {
                        cy_edge.style('line-color', 'green');
                        cy_edge.style('target-arrow-color', 'green');
                    }
                })
            }
            else {
                widget_data.tree.edges.forEach(function(edge) {
                    var cy_edge = widget_data.cy.$(`#${edge._id}`);
                    if(edge._source == node._id) {
                        cy_edge.style('line-color', '#ccc');
                        cy_edge.style('target-arrow-color', '#999');
                    }
                })
            }
    }
    function set_times_bought(id, times_bought) {
        var node = findNode(id);
        var dep = check_dependencies(node);
        if(!dep) {
            var error = 'Error: prerequisite nodes not bought';
            console.log(error);
            throw error;
        }
        if(times_bought <= node.max_times) {
            widget_data.times_bought[id] = times_bought;
            refresh_label(node);
            refresh_edges(node);
        }
        else {
            var error = `Error: ${times_bought} is greater than the maximum of ${node.max_times} the node is allowed to be bought.`;
            console.log(error);
            throw error;
        }
    }
    function set_global_value(global, value) {
        if(widget_data.globals[global]) {
            widget_data.globals[global] = value;
            refresh_globals();
        }
        else {
            var error = `Error: global ${global} does not exist`;
            console.log(error);
            throw error;
        }
    }
    /*
     * END FUNCTION DEFINITIONS
     */
    //setup divs
    var div = document.getElementById(div_id);
    div.style.display = "flex";
    div.style.border = "1px solid black";
    div.style.padding = 0;
    var cy_div = document.createElement("div");
    var info_div = document.createElement("div");
    var global_div = document.createElement("div");
    cy_div.style.display = "inline-block";
    cy_div.style.margin = 0;
    info_div.style.display = "block";
    info_div.style.position = "absolute";
    info_div.style.bottom = 0;
    info_div.style.margin = 0;
    global_div.style.display = "block";
    global_div.style.position = "absolute";
    global_div.style.top = 0;
    global_div.style.margin = 0;

    cy_div.style.width = "70%";
    cy_div.style.height = "100%";
    cy_div.style.borderRight = "1px solid black";
    
    var right_hand_div = document.createElement('div');

    right_hand_div.style.width = "30%";
    right_hand_div.style.height = "100%";
    right_hand_div.style.position = "relative";

    global_div.style.width = "100%";
    global_div.style.height = "50%";
    //global_div.style.padding = "5px";
    global_div.style.borderBottom = "1px solid black";

    info_div.style.width = "100%";
    info_div.style.height = "50%";
    //info_div.style.padding = "5px";

    right_hand_div.appendChild(global_div);
    right_hand_div.appendChild(info_div);

    div.appendChild(cy_div);
    div.appendChild(right_hand_div);

    widget_data.info_div = info_div;
    widget_data.global_div = global_div;

    //setup cytoscape
    widget_data.cy = cytoscape({
        container: cy_div
    });
    if(tree_json) {
        loadJSON(tree_json, function(json) {
            widget_data.json = json;
            widget_data.cy.json(json.cytoscape);
            widget_data.cy.fit();
            widget_data.cy.nodes().forEach(function(ele) {
                ele.style('background-color', ele.data('background-color'));
            });
            widget_data.tree = json.tree;
            widget_data.globals = json.globals;
            widget_data.times_bought = [];
            widget_data.cy.on('select', node_select_handler);
            widget_data.cy.on('unselect', node_deselect_handler);
            widget_data.tree.nodes.forEach(function(item) {
                refresh_label(item);
            });
            if(globals) {
                for(var glob in globals) {
                    if(globals.hasOwnProperty(glob)) {
                        widget_data.globals[glob] = globals[glob];
                    }
                }
            }
            refresh_globals();
            public_data.set_times_bought = set_times_bought;
            public_data.set_global_value = set_global_value;
            public_data.get_times_bought = get_times_bought;
            if(callback) callback(public_data);
        });
    }
    else {
        throw "Error, please provide a JSON file for the tree";
    }
}

