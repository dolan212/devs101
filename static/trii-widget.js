var widget_data = {};

function trii_init(div_id, tree_json, globals) {
    var div = document.getElementById(div_id);
    div.style.display = "flex";
    div.style.border = "1px solid black";
    div.style.padding = 0;
    var cy_div = document.createElement("div");
    var info_div = document.createElement("div");
    cy_div.style.display = "inline-block";
    cy_div.style.margin = 0;
    info_div.style.display = "inline-block";
    info_div.style.margin = 0;

    cy_div.style.width = "70%";
    cy_div.style.height = "100%";
    cy_div.style.borderRight = "1px solid black";

    info_div.style.width = "30%";
    info_div.style.height = "100%";
    info_div.style.padding = "5px";

    div.appendChild(cy_div);
    div.appendChild(info_div);
    widget_data.info_div = info_div;

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
            console.log(json.tree);
        });
    }
    if(globals) {
        for(var glob in globals) {
            if(globals.hasOwnProperty(glob)) {
                if(widget_data.globals[glob] !== undefined) {
                    widget_data.globals[glob] = globals[glob];
                }
            }
        }
    }
    widget_data.times_bought;

    widget_data.cy.on('select', node_select_handler);
    widget_data.cy.on('unselect', node_deselect_handler);
        
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
    var name = document.createElement("p");
    name.innerHTML = `<b>Skill:</b> ${node._label}`;
    var desc = document.createElement("p");
    desc.innerHTML = `<b>Description:</b> ${node._description}`;
    widget_data.info_div.appendChild(name);
    widget_data.info_div.appendChild(desc);
    var skillpoints;
    node.rules.forEach(function(item) {
        if(item.type == "skillpoint") {
            if(!skillpoints) skillpoints = document.createElement("p");
            skillpoints.innerHTML = `<b>Skillpoints:</b> ${item.skillpoints}`;
        }
    });
    if(skillpoints) widget_data.info_div.appendChild(skillpoints);
    var buy_div = document.createElement("div");
    buy_div.style.width = "100%";
    buy_div.style.position = "relative";
    buy_div.style.bottom = 0;
    buy_div.style.display = "flex";
    var minus_button = document.createElement("button");
    minus_button.innerHTML = "-";
    minus_button.style.width = "20%";
    var plus_button = document.createElement("button");
    plus_button.innerHTML = "+";
    plus_button.style.width = "20%";
    var times_bought = document.createElement("span");
    times_bought.style.width = "60%";
    times_bought.style.textAlign = "center";
    var num_bought = 0;
    if(widget_data.times_bought) {
        if(widget_data.times_bought[node._id])
            num_bought = widget_data.times_bought[node._id];
    }
    
    buy_div.appendChild(minus_button);
    buy_div.appendChild(times_bought);
    buy_div.appendChild(plus_button);
    widget_data.info_div.appendChild(buy_div);
    var error = document.createElement("span");
    error.style.color = "red";
    widget_data.info_div.appendChild(error);

    function refresh() {
        if(num_bought >= node.max_times) plus_button.disabled = true;
        else plus_button.disabled = false;

        if(num_bought <= 0) minus_button.disabled = true;
        else minus_button.disabled = false;
        times_bought.innerHTML = `${num_bought}/${node.max_times}`;
        error.innerHTML = '';
    }
    refresh();

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

function buy_skill(node) {
    var dep = check_dependencies(node);
    if(!dep) throw "You have not yet bought all the dependencies";
    if(widget_data.times_bought) {
        if(widget_data.times_bought[node._id]) {
            if(widget_data.times_bought[node._id] >= node.max_times)
                throw "You have reached the maximum amount of times you can buy this skill";
            else widget_data.times_bought[node._id]++;
        }
        else widget_data.times_bought[node._id] = 1;
    } else {
        widget_data.times_bought = [];
        widget_data.times_bought[node._id] = 1;
    }
    return widget_data.times_bought[node._id];
}

function sell_skill(node) {
    if(!widget_data.times_bought) throw "You have not purchased this skill";
    if(!widget_data.times_bought[node._id] || widget_data.times_bought[node._id] <= 0) throw "You have not purchased this skill";
    widget_data.times_bought[node._id]--;
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
function set_times_bought(times_bought) {
    widget_data.times_bought = times_bought;
}
