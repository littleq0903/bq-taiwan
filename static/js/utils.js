/*
 * Global overwriting
 */
String.prototype.format = function()
{
   var content = this;
   for (var i=0; i < arguments.length; i++)
   {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);  
   }
   return content;
};

/*
 * functions to control sign in/out button.
 */
lock_signin_btn = function () {
    var $btn_signin = $("#btn-signin");
    $btn_signin.attr('disabled', true);
}
unlock_signin_btn = function () {
    var $btn_signin = $("#btn-signin");
    $btn_signin.attr('disabled', false);
}

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Bytes';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

AjaxUploadFile = function (file_dom, url, callback) {
    /*
     * This function describes how to upload file via ajax.
     */
    var files = file_dom.files;
    var file = files[0];
    var xhr = new XMLHttpRequest();
    var formData = new FormData();

    formData.append('file', file);
    xhr.onreadystatechange = function(e) {
        if ( 4 == this.readyState ) {
            console.log('xhr upload complete');
            callback(xhr.response);
        }
    }
    xhr.open('post', url, true);
    xhr.send(formData);
}

AjaxSendForm = function (form, url, callback) {
    /*
     * This function describes how to send a form via Ajax.
     */

    var form_data = {};
    $(form).serialize().map(function(obj){
        form_data[obj.name] = obj.value;
    });
    console.log(form_data);
    console.log("AjaxSendForm has not been implemented.");
}


RenderTemplate = function (template_script_selector, target_selector, view) {
    var template_string = $(template_script_selector).html();
    var conversion = "{{=<% %>=}}";
    var template_string = conversion + template_string;

    var content_to_render = Mustache.render(template_string, view);

    $(target_selector).html(content_to_render);
}

RenderCodeList = function (options) {
    var source_$id = options.source;
    var target_$id = options.target;
    var code_manager = options.code_manager;
    RenderTemplate(source_$id, target_$id, {
        "items": code_manager.collection,
        "synced": function() {
            if (this.unsaved) {
                return "Unsynced";
            } else {
                return "Synced";
            }
        }
    });
}

ValidateCode = function (code, callback) {
    gapi.client.bigdata.code.exam({code: code}).execute(callback);
}

InjectListIndex = function (property_name, data, offset) {
    if (typeof offset == 'undefined') offset = 0;
    for ( var i = 0; i < data.length ; i+=1 ) {
        data[i][property_name] = i + offset;
    }
    return data;
}

SerializeForm = function (form_selector) {
    var $form = $(form_selector);
    var nv_array = $form.serializeArray();
    
    var rtn_data = {};

    nv_array.map(function(o){
        rtn_data[o.name] = o.value;
    });

    return rtn_data;
}

ParseTime = function (time_str) {
    var date_obj = new Date(time_str);
    return date_obj.toLocaleString();
}
