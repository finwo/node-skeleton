/* Slight modification of:
 * https://raw.githubusercontent.com/jeromeetienne/microevent.js/master/microevent.js
 */
define(function () {
  var MicroEvent	= function(){};
  MicroEvent.prototype	= {
    on	: function(event, fct){
      this._events = this._events || {};
      this._events[event] = this._events[event]	|| [];
      this._events[event].push(fct);
    },
    off	: function(event, fct){
      this._events = this._events || {};
      if( event in this._events === false  )	return;
      this._events[event].splice(this._events[event].indexOf(fct), 1);
    },
    emit	: function(event /* , args... */){
      var i;
      this._events = this._events || {};
      if( event in this._events === false  )	return;
      for(i = 0; i < this._events[event].length; i++){
        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
      if ( '*' in this._events === false ) return;
      for(i = 0; i < this._events['*'].length; i++){
        this._events['*'][i].apply(this, [event].concat(Array.prototype.slice.call(arguments, 1)));
      }
    },
  };
  MicroEvent.mixin	= function(destObject){
    var props	= ['on', 'off', 'emit'];
    for(var i = 0; i < props.length; i ++){
      if( typeof destObject === 'function' ){
        destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
      }else{
        destObject[props[i]] = MicroEvent.prototype[props[i]];
      }
    }
    return destObject;
  };
  return MicroEvent;
});
