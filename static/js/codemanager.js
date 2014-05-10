// Constructor
/*
 * Provide the interface to manage code on Google App Engine Cloud Endpoints
 * @constructor
 * @param {String} manager_name
 * @param {String} editor_textarea_id
 * @param {String} name_field_id
 * @param {Endpoints.Model} endpoints_model
 */
CodeManager = function (manager_name, editor_textarea_id, name_field_id, endpoints_model) {
    
    // CodeMirror editor options
    var editor_options = {
        lineNumbers: true,
        theme: "base16-light",
        lineWrapping: true,
        mode: "python",
        indentUnit: 4,
    }
    var textarea_dom = document.getElementById(editor_textarea_id);
    var name_dom = document.getElementById(name_field_id);

    this.name = manager_name;
    this.editor = CodeMirror.fromTextArea(textarea_dom, editor_options);
    this.name_field = name_dom; // TODO: this has to be merged with name_dom.
    this.model = endpoints_model;
    this.default_code_snippet = "new_code";
    this.default_code_name = "new_code_name";

    // status
    this.updater = function(){};
    this.current_id = null;
    this.collection = [];
}

// Helpers
/*
 * get code obj
 */
CodeManager.prototype.getCodeObj = function (id) {
    return this.collection.filter(function(obj){ return id === obj.id; })[0];
}
/*
 * delete code obj
 */
CodeManager.prototype.delCodeObj = function (id) {
    var unmatch_obj_f = function (obj) {
        console.log(obj.id + "___" + id);
        return obj.id != id;
    }
    console.log(this.collection.filter(unmatch_obj_f).length);
    this.collection = this.collection.filter(unmatch_obj_f);
}

// APIs
/*
 * fetch data from endpoints API.
 */
CodeManager.prototype.init = function(callback) {
    var _this = this;
    this.model.list().execute(function(res){
        if (res.items) {
            _this.collection = [];
            res.items.map(function(obj){
                _this.collection.push(obj);
            });
        }

        // added custom fields to the collection
        _this.collection.map(function(obj){
            obj['unsaved'] = false;
            obj['status'] = 'old';
        });

        if ( (!_this.current_id) &&  _this.collection.length >= 1 ) {
            _this.current_id = _this.collection[0].id;
        }

        _this.initEvents();

        callback({
            length: _this.collection.length
        });

    });
}


CodeManager.prototype.initEvents = function() {
    var _this = this;
    _this.editor.on("keyup", function(e){
        _this.cache(_this.current_id);
        _this.updater();
    });

    $(_this.name_field).on("keyup", function(e){
        _this.cache(_this.current_id);
        _this.updater();
    });
}


/*
 * add a new code into collection, but won't send it onto server
 */
CodeManager.prototype.newCode = function(callback) {
    var _this = this;
    var new_code_obj = {
        'id': "temp",
        'name': _this.default_code_name,
        'code': _this.default_code_snippet,
        'status': 'new',
        'unsaved': 'true'
    };
    this.collection.push(new_code_obj);
    this.save("temp", function(response){
        if (callback) {
            callback(response.result);
        }
        var new_id = response.result.id;
        _this.setCurrentId(new_id);
        _this.showCode(new_id);
        _this.updater();
    });
}

/*
 * delete the specifed code obj and synced content on the server.
 */
CodeManager.prototype.deleteCode = function(id, callback) {
    var _this = this;
    var code_obj = _this.getCodeObj(id);

    _this.model.delete({"id": id}).execute(function(res){
        _this.delCodeObj(id);
        callback(res);
    });
}

/*
 * sync single code onto server
 */
CodeManager.prototype.save = function (id, callback) {
    var code_obj = this.getCodeObj(id);
    if ( code_obj['status'] == 'old' ) {
        // unsaved functions
        this.model.update({
            'id': id,
            'code': code_obj.code,
            'name': code_obj.name
        }).execute(function(res){
            code_obj.unsaved = false;
            if (callback) {
                callback({'result': res});
            }
        });
    }
    else if ( code_obj['status'] == 'new' ) {
        // unsynced functions
        this.model.insert({
            'code': code_obj.code,
            'name': code_obj.name
        }).execute(function(res){
            code_obj.unsaved = false;
            code_obj.status = 'old';
            code_obj.id = res.id;
            if (callback) {
                callback({'result': res});
            }
        })
    }
    
}
/*
 * sync all codes in one time.
 */
CodeManager.prototype.saveAll = function (callback) {
    var _this = this;
    var unsaved_codes = this.collection.filter(function(obj){
        return obj.unsaved == true;
    });
    unsaved_codes.map(function(code_obj){
        _this.save(code_obj.id, callback);
    });
}

/*
 * show code to the editor 
 */
CodeManager.prototype.showCode = function (id) {
    var code_obj = this.getCodeObj(id);

    this.name_field.value = code_obj.name;
    this.editor.setValue(code_obj.code);

    $(this.editor).attr('code:id', id);

}

/*
 * cache current editing code into collection, but not sync to server. 
 */
CodeManager.prototype.cache = function (id) {
    // if no current id, do nothing
    if (!id) { return }

    // else should cache the code
    var code_obj = this.getCodeObj(id);
    var editor_code = this.editor.getValue();
    if ( code_obj.unsaved === false || code_obj.code != editor_code ) {
        code_obj.unsaved = true
    }
    code_obj.code = editor_code;
    code_obj.name = this.name_field.value;
}

/*
 * Validate the code
 */
CodeManager.prototype.validate = function (id, callbacks) {
    if (!id) { return }

    var success_fun = callbacks.success;
    var error_fun = callbacks.error;

    var code_obj = this.getCodeObj(id);
    var code = code_obj.code;

    gapi.client.bigdata.code.exam({code: code}).execute(function(res){
        if (res.status === true) {
            success_fun(res);
        }
        else if (res.status === false) {
            error_fun(res);
        }
    });

}

// Setters
/*
 * current id setter
 */
CodeManager.prototype.setCurrentId = function (id) {
    this.current_id = id
}

/*
 * set the update function, this function will be triggered after events we set in initEvents().
 */
CodeManager.prototype.setUpdater = function (updater) {
    this.updater = updater;
}

/*
 * Set default code snipper.
 */
CodeManager.prototype.setDefaultCodeSnippet = function(default_code) {
    this.default_code_snippet = default_code;
}

/*
 * Set default code name.
 */
CodeManager.prototype.setDefaultCodeName = function(default_name) {
    this.default_code_name = default_name;
}


