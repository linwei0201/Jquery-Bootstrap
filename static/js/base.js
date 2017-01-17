/**
 * base for all pages
 */
define("base", function(){
    function Clazz(){}

    var _extend = function(props){
      var _super = this;

      var _superPropotype = _super.prototype;

      function Clas(){
        // 严格模式下 this不能指向window，如果直接调用，this为 undefined
        this && _super(this,arguments);
        this && this.init && this.init.apply(this,arguments);
      };

      var prototype = Clas.prototype = Object.create(_superPropotype);

      for(var i in props){
        if(i === "constructor"){
          return;
        }
        var prop = props[i];
        if(typeof prop === "function" && _superPropotype[i] && typeof _superPropotype[i] === "function"){
          prop = (function(name,fn){
            return function(){
              var tmp = this._super;
              this._super = _superPropotype[name];
              var ret = fn.apply(this,arguments);
              this._super = tmp;
              return ret;
            }
          })(i,prop);
        }else if(typeof prop === "object" &&  _superPropotype[i] && typeof _superPropotype[i] === "object"){
          // object 继承 TODO 没有支持更深层次的嵌套
          for(var j in _superPropotype[i]){
            if(!prop[j]){
              prop[j] = _superPropotype[i][j];
            }
          }
        }
        prototype[i] = prop;
      }
      Clas.extend = Clazz.extend;

      return Clas;
    }
    Clazz.extend = _extend;

    return Clazz;
});




