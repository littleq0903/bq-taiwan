var API = function (object_name) {
    return '/api/' + object_name ;
}

AccountModel = Backbone.Model.extend({
    defaults: {
        username: null,
        password: null,
        plan: "basic"
    },

    url: function() {
        var post_url = API('account');
        var get_url = post_url + '/' + this.id;
        return this.id ? get_url : post_url;
    }
});

FunctionModel = Backbone.Model.extend({
    defaults:{
        name: null,
        content: null,
        timestamp: null
    },

    url: function() {
        var post_url = API('function');
        var get_url = post_url + '/' + this.id;
        return this.id ? get_url : post_url;
    }
});

FunctionCollection = Backbone.Collection.extend({
    model: FunctionModel
})
