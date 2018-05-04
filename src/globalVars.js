class global{

  constructor(name, type, defaultVal, req) {
    this._name = name;
    this._type = type;
    this._value = defaultVal;
    this._required = req;

  }

  set name(name) { this._name = name; }
  set value(val) { this._value = val; }
  set type(type) { return this._type = type; }
  set required(req) { this._required = req; }
  get name() { return this._name; }
  get type() { return this._type; }
  get value() { return this._value; }
  get required() { return this._required; }

}

export function global(name, type, defaultVal, req) {
  var gVar = global(name, type, defaultVal, req);
  return gVar;
}
/*
class globals{

  constructor() {
    this.globalVars = [];
  }

}
*/
