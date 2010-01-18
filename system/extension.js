Function.prototype.clone = function () {
    if (Prototype.Browser.IE) {
        var func = this.toString();
        return new Function(func.substring(func.indexOf('{') + 1, func.lastIndexOf('}')));
    }
    else {
        return eval('(' + this.toString().replace(/^function .*?\(/, "function (") + ')');
    }
};

Object.isBoolean = function (val) {
    return val.constructor === Boolean;
};

String.fromAttributes = function (attributes) {
    var result = '';
    
    for (var i = 0; i < attributes.length; i++) {
        result += "#{name}='#{value}' ".interpolate({
            name: attributes.item(i).nodeName,
            value: attributes.item(i).nodeValue
        });
    }
    
    return result;
};

Object.fromAttributes = function (attributes) {
    var result = {};

    for (var i = 0; i < attributes.length; i++) {
        result[attributes.item(i).nodeName] = attributes.item(i).nodeName;
    }

    return result;
};

String.prototype.parseQuery = function () {
    var result  = {};
    var matches = this.match(/\?(.*)$/);
    
    if (!matches) {
        return result;
    }
    
    var blocks = matches[1].split(/&/);
    for (var i = 0; i < blocks.length; i++) {
        var parts = blocks[i].split(/=/);
        var name  = decodeURIComponent(parts[0]);
        
        if (parts[1]) {
            result[name] = decodeURIComponent(parts[1]);
        }
        else {
            result[name] = true;
        }
    }
    
    return result;
}

Object.toQuery = function (query) {
    var result = '';
    
    for (var name in obj) {
        result += "#{name}=#{value}&".interpolate({
            name: name,
            value: obj[name]
        });
    }
    
    return result.substr(0, result.length - 1);
}
