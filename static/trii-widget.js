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
    })
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
    widget_data.info_div.appendChild(name);
}
